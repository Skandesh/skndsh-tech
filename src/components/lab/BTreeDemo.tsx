import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Shuffle, RotateCcw, Play, Pause } from 'lucide-react';

interface BTreeDemoProps {
  onBack: () => void;
}

interface BTreeNode {
  id: string;
  keys: number[];
  children: BTreeNode[];
  isLeaf: boolean;
  x: number;
  y: number;
  highlighted: boolean;
  splitAnimation: boolean;
}

interface AnimationState {
  type: 'search' | 'insert' | 'delete' | 'split' | 'none';
  path: string[];
  currentNode: string | null;
  foundKey: number | null;
  message: string;
}

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const LEVEL_HEIGHT = 100;

const BTreeDemo: React.FC<BTreeDemoProps> = ({ onBack }) => {
  const [order, setOrder] = useState(3); // max keys = order - 1, so order 3 = 2 keys max
  const [tree, setTree] = useState<BTreeNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [eventLog, setEventLog] = useState<string[]>(['B-Tree initialized. Order: 3']);
  const [animation, setAnimation] = useState<AnimationState>({
    type: 'none',
    path: [],
    currentNode: null,
    foundKey: null,
    message: '',
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showBPlusLinks, setShowBPlusLinks] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idCounter = useRef(0);

  const generateId = () => {
    idCounter.current += 1;
    return `node-${idCounter.current}`;
  };

  const log = useCallback((message: string) => {
    setEventLog(prev => [message, ...prev.slice(0, 49)]);
  }, []);

  // Create a new leaf node
  const createNode = useCallback((keys: number[] = []): BTreeNode => {
    return {
      id: generateId(),
      keys: [...keys],
      children: [],
      isLeaf: true,
      x: 0,
      y: 0,
      highlighted: false,
      splitAnimation: false,
    };
  }, []);

  // Calculate positions for all nodes
  const calculatePositions = useCallback((node: BTreeNode | null, canvasWidth: number): BTreeNode | null => {
    if (!node) return null;

    const positionNode = (n: BTreeNode, level: number, left: number, right: number): BTreeNode => {
      const x = (left + right) / 2;
      const y = level * LEVEL_HEIGHT + 60;

      let newChildren: BTreeNode[] = [];
      if (n.children.length > 0) {
        const childWidth = (right - left) / n.children.length;
        newChildren = n.children.map((child, i) =>
          positionNode(child, level + 1, left + i * childWidth, left + (i + 1) * childWidth)
        );
      }

      return { ...n, x, y, children: newChildren };
    };

    return positionNode(node, 0, 50, canvasWidth - 50);
  }, []);

  // Find the correct leaf node for a key
  const findLeaf = useCallback((node: BTreeNode, key: number): BTreeNode => {
    if (node.isLeaf) return node;

    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }
    return findLeaf(node.children[i], key);
  }, []);

  // Search for a key
  const searchKey = useCallback(async (key: number) => {
    if (!tree) {
      log(`Search failed: tree is empty`);
      return;
    }

    setIsAnimating(true);
    setAnimation({ type: 'search', path: [], currentNode: null, foundKey: null, message: `Searching for ${key}...` });

    const searchNode = async (node: BTreeNode, path: string[]): Promise<boolean> => {
      const newPath = [...path, node.id];
      setAnimation(prev => ({ ...prev, path: newPath, currentNode: node.id }));
      await new Promise(resolve => setTimeout(resolve, 500 / speed));

      // Check if key is in this node
      const keyIndex = node.keys.indexOf(key);
      if (keyIndex !== -1) {
        setAnimation(prev => ({ ...prev, foundKey: key, message: `Found ${key} at depth ${path.length}` }));
        log(`Found ${key} at depth ${path.length}`);
        return true;
      }

      if (node.isLeaf) {
        setAnimation(prev => ({ ...prev, message: `${key} not found` }));
        log(`${key} not found in tree`);
        return false;
      }

      // Find child to traverse
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) {
        i++;
      }

      return searchNode(node.children[i], newPath);
    };

    await searchNode(tree, []);
    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    setAnimation({ type: 'none', path: [], currentNode: null, foundKey: null, message: '' });
    setIsAnimating(false);
  }, [tree, log, speed]);

  // Split a full node
  const splitChild = useCallback((parent: BTreeNode, childIndex: number): BTreeNode => {
    const maxKeys = order - 1;
    const minKeys = Math.ceil(order / 2) - 1;
    const child = parent.children[childIndex];
    const midIndex = Math.floor(child.keys.length / 2);
    const midKey = child.keys[midIndex];

    // Create new right node
    const rightNode: BTreeNode = {
      id: generateId(),
      keys: child.keys.slice(midIndex + 1),
      children: child.isLeaf ? [] : child.children.slice(midIndex + 1),
      isLeaf: child.isLeaf,
      x: 0,
      y: 0,
      highlighted: false,
      splitAnimation: true,
    };

    // Update left node (original child)
    const leftNode: BTreeNode = {
      ...child,
      keys: child.keys.slice(0, midIndex),
      children: child.isLeaf ? [] : child.children.slice(0, midIndex + 1),
      splitAnimation: true,
    };

    // Update parent
    const newParentKeys = [...parent.keys];
    newParentKeys.splice(childIndex, 0, midKey);

    const newParentChildren = [...parent.children];
    newParentChildren.splice(childIndex, 1, leftNode, rightNode);

    return {
      ...parent,
      keys: newParentKeys,
      children: newParentChildren,
    };
  }, [order]);

  // Insert a key
  const insertKey = useCallback(async (key: number) => {
    const maxKeys = order - 1;

    if (!tree) {
      const newTree = createNode([key]);
      setTree(newTree);
      log(`Inserted ${key} into new root`);
      return;
    }

    // Check if key already exists
    const checkExists = (node: BTreeNode): boolean => {
      if (node.keys.includes(key)) return true;
      if (node.isLeaf) return false;
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) i++;
      return checkExists(node.children[i]);
    };

    if (checkExists(tree)) {
      log(`${key} already exists in tree`);
      return;
    }

    setIsAnimating(true);
    setAnimation({ type: 'insert', path: [], currentNode: null, foundKey: null, message: `Inserting ${key}...` });

    // Insert into tree
    const insertIntoNode = (node: BTreeNode): { node: BTreeNode; split: boolean; midKey?: number; rightNode?: BTreeNode } => {
      if (node.isLeaf) {
        // Insert into leaf
        const newKeys = [...node.keys, key].sort((a, b) => a - b);
        const newNode = { ...node, keys: newKeys };

        if (newKeys.length > maxKeys) {
          // Need to split
          const midIndex = Math.floor(newKeys.length / 2);
          const midKey = newKeys[midIndex];
          const leftNode: BTreeNode = {
            ...node,
            keys: newKeys.slice(0, midIndex),
          };
          const rightNode: BTreeNode = {
            id: generateId(),
            keys: newKeys.slice(midIndex + 1),
            children: [],
            isLeaf: true,
            x: 0,
            y: 0,
            highlighted: false,
            splitAnimation: false,
          };
          return { node: leftNode, split: true, midKey, rightNode };
        }
        return { node: newNode, split: false };
      }

      // Find child to insert into
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) i++;

      const result = insertIntoNode(node.children[i]);

      if (!result.split) {
        const newChildren = [...node.children];
        newChildren[i] = result.node;
        return { node: { ...node, children: newChildren }, split: false };
      }

      // Handle split from child
      const newKeys = [...node.keys];
      newKeys.splice(i, 0, result.midKey!);
      const newChildren = [...node.children];
      newChildren.splice(i, 1, result.node, result.rightNode!);
      const newNode = { ...node, keys: newKeys, children: newChildren };

      if (newKeys.length > maxKeys) {
        // Parent also needs to split
        const midIndex = Math.floor(newKeys.length / 2);
        const midKey = newKeys[midIndex];
        const leftNode: BTreeNode = {
          ...node,
          keys: newKeys.slice(0, midIndex),
          children: newChildren.slice(0, midIndex + 1),
          isLeaf: false,
        };
        const rightNode: BTreeNode = {
          id: generateId(),
          keys: newKeys.slice(midIndex + 1),
          children: newChildren.slice(midIndex + 1),
          isLeaf: false,
          x: 0,
          y: 0,
          highlighted: false,
          splitAnimation: false,
        };
        return { node: leftNode, split: true, midKey, rightNode };
      }

      return { node: newNode, split: false };
    };

    const result = insertIntoNode(tree);

    if (result.split) {
      // Create new root
      const newRoot: BTreeNode = {
        id: generateId(),
        keys: [result.midKey!],
        children: [result.node, result.rightNode!],
        isLeaf: false,
        x: 0,
        y: 0,
        highlighted: false,
        splitAnimation: false,
      };
      setTree(newRoot);
      log(`Inserted ${key}, root split! New height.`);
    } else {
      setTree(result.node);
      log(`Inserted ${key}`);
    }

    await new Promise(resolve => setTimeout(resolve, 300 / speed));
    setAnimation({ type: 'none', path: [], currentNode: null, foundKey: null, message: '' });
    setIsAnimating(false);
  }, [tree, order, createNode, log, speed]);

  // Delete a key (simplified version)
  const deleteKey = useCallback(async (key: number) => {
    if (!tree) {
      log(`Delete failed: tree is empty`);
      return;
    }

    setIsAnimating(true);
    setAnimation({ type: 'delete', path: [], currentNode: null, foundKey: null, message: `Deleting ${key}...` });

    const minKeys = Math.ceil(order / 2) - 1;

    const deleteFromNode = (node: BTreeNode): BTreeNode | null => {
      const keyIndex = node.keys.indexOf(key);

      if (node.isLeaf) {
        if (keyIndex === -1) {
          log(`${key} not found`);
          return node;
        }
        const newKeys = node.keys.filter(k => k !== key);
        if (newKeys.length === 0 && !tree?.children.length) {
          return null; // Tree becomes empty
        }
        return { ...node, keys: newKeys };
      }

      if (keyIndex !== -1) {
        // Key is in internal node - replace with predecessor
        const getPredecessor = (n: BTreeNode): number => {
          if (n.isLeaf) return n.keys[n.keys.length - 1];
          return getPredecessor(n.children[n.children.length - 1]);
        };
        const predecessor = getPredecessor(node.children[keyIndex]);
        const newKeys = [...node.keys];
        newKeys[keyIndex] = predecessor;

        // Delete predecessor from left subtree
        const deleteFromSubtree = (n: BTreeNode, k: number): BTreeNode => {
          if (n.isLeaf) {
            return { ...n, keys: n.keys.filter(key => key !== k) };
          }
          const newChildren = [...n.children];
          newChildren[newChildren.length - 1] = deleteFromSubtree(newChildren[newChildren.length - 1], k);
          return { ...n, children: newChildren };
        };

        const newChildren = [...node.children];
        newChildren[keyIndex] = deleteFromSubtree(newChildren[keyIndex], predecessor);
        return { ...node, keys: newKeys, children: newChildren };
      }

      // Find child to delete from
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) i++;

      const newChildren = [...node.children];
      const result = deleteFromNode(newChildren[i]);
      if (result === null) {
        // Child became empty, remove it (simplified)
        if (newChildren.length > 1) {
          newChildren.splice(i, 1);
          const newKeys = [...node.keys];
          if (i < newKeys.length) {
            newKeys.splice(i, 1);
          } else if (newKeys.length > 0) {
            newKeys.splice(newKeys.length - 1, 1);
          }
          return { ...node, keys: newKeys, children: newChildren };
        }
        return null;
      }
      newChildren[i] = result;
      return { ...node, children: newChildren };
    };

    const result = deleteFromNode(tree);
    if (result === null) {
      setTree(null);
      log(`Deleted ${key}, tree is now empty`);
    } else if (result.keys.length === 0 && result.children.length === 1) {
      setTree(result.children[0]);
      log(`Deleted ${key}, tree height decreased`);
    } else {
      setTree(result);
      log(`Deleted ${key}`);
    }

    await new Promise(resolve => setTimeout(resolve, 300 / speed));
    setAnimation({ type: 'none', path: [], currentNode: null, foundKey: null, message: '' });
    setIsAnimating(false);
  }, [tree, order, log, speed]);

  // Handle input submission
  const handleSubmit = (action: 'insert' | 'search' | 'delete') => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) return;

    if (action === 'insert') insertKey(value);
    else if (action === 'search') searchKey(value);
    else if (action === 'delete') deleteKey(value);

    setInputValue('');
  };

  // Insert random keys
  const insertRandom = async () => {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const key = Math.floor(Math.random() * 100) + 1;
      await insertKey(key);
      await new Promise(resolve => setTimeout(resolve, 100 / speed));
    }
  };

  // Reset tree
  const resetTree = () => {
    setTree(null);
    idCounter.current = 0;
    setEventLog([`B-Tree reset. Order: ${order}`]);
    log(`Tree cleared`);
  };

  // Change order
  const handleOrderChange = (newOrder: number) => {
    setOrder(newOrder);
    resetTree();
    log(`Order changed to ${newOrder}. Max keys per node: ${newOrder - 1}`);
  };

  // Calculate tree stats
  const getTreeStats = useCallback(() => {
    if (!tree) return { height: 0, totalKeys: 0, totalNodes: 0, fillRatio: 0 };

    let height = 0;
    let totalKeys = 0;
    let totalNodes = 0;
    const maxKeys = order - 1;

    const traverse = (node: BTreeNode, level: number) => {
      height = Math.max(height, level + 1);
      totalKeys += node.keys.length;
      totalNodes += 1;
      node.children.forEach(child => traverse(child, level + 1));
    };

    traverse(tree, 0);
    const fillRatio = totalNodes > 0 ? (totalKeys / (totalNodes * maxKeys)) * 100 : 0;

    return { height, totalKeys, totalNodes, fillRatio };
  }, [tree, order]);

  const stats = getTreeStats();

  // Draw tree on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!tree) {
      ctx.fillStyle = '#666';
      ctx.font = '14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('Empty tree. Insert some keys!', rect.width / 2, rect.height / 2);
      return;
    }

    const positionedTree = calculatePositions(tree, rect.width);
    if (!positionedTree) return;

    // Draw edges first
    const drawEdges = (node: BTreeNode) => {
      node.children.forEach(child => {
        ctx.beginPath();
        ctx.strokeStyle = animation.path.includes(child.id) ? '#22c55e' : '#444';
        ctx.lineWidth = animation.path.includes(child.id) ? 2 : 1;
        ctx.moveTo(node.x, node.y + NODE_HEIGHT / 2);
        ctx.lineTo(child.x, child.y - NODE_HEIGHT / 2);
        ctx.stroke();
        drawEdges(child);
      });
    };

    // Draw B+ leaf links if enabled
    if (showBPlusLinks) {
      const leaves: BTreeNode[] = [];
      const collectLeaves = (node: BTreeNode) => {
        if (node.isLeaf) {
          leaves.push(node);
        } else {
          node.children.forEach(collectLeaves);
        }
      };
      collectLeaves(positionedTree);

      leaves.sort((a, b) => a.x - b.x);
      for (let i = 0; i < leaves.length - 1; i++) {
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(leaves[i].x + NODE_WIDTH / 2 - 10, leaves[i].y);
        ctx.lineTo(leaves[i + 1].x - NODE_WIDTH / 2 + 10, leaves[i + 1].y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    drawEdges(positionedTree);

    // Draw nodes
    const drawNode = (node: BTreeNode) => {
      const isHighlighted = animation.path.includes(node.id);
      const isCurrent = animation.currentNode === node.id;

      // Node background
      ctx.fillStyle = isCurrent ? '#22c55e' : isHighlighted ? '#1a1a2e' : '#0a0a0a';
      ctx.strokeStyle = isCurrent ? '#22c55e' : isHighlighted ? '#22c55e' : node.isLeaf ? '#8b5cf6' : '#666';
      ctx.lineWidth = isCurrent ? 2 : 1;

      const width = Math.max(NODE_WIDTH, node.keys.length * 40 + 20);
      ctx.beginPath();
      ctx.roundRect(node.x - width / 2, node.y - NODE_HEIGHT / 2, width, NODE_HEIGHT, 4);
      ctx.fill();
      ctx.stroke();

      // Draw keys
      ctx.fillStyle = isCurrent ? '#000' : '#fff';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const keyWidth = (width - 20) / Math.max(node.keys.length, 1);
      node.keys.forEach((key, i) => {
        const keyX = node.x - width / 2 + 10 + keyWidth * i + keyWidth / 2;
        const isFound = animation.foundKey === key;

        if (isFound) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(keyX, node.y, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
        }

        ctx.fillText(key.toString(), keyX, node.y);
        ctx.fillStyle = isCurrent ? '#000' : '#fff';

        // Draw separator lines
        if (i < node.keys.length - 1) {
          ctx.beginPath();
          ctx.strokeStyle = '#444';
          ctx.moveTo(keyX + keyWidth / 2, node.y - NODE_HEIGHT / 2 + 8);
          ctx.lineTo(keyX + keyWidth / 2, node.y + NODE_HEIGHT / 2 - 8);
          ctx.stroke();
        }
      });

      node.children.forEach(drawNode);
    };

    drawNode(positionedTree);
  }, [tree, animation, calculatePositions, showBPlusLinks]);

  return (
    <div className="min-h-screen p-6 md:p-12 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors group bg-black/50 px-3 py-2 border border-gray-800"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO LAB
        </button>
        <div className="text-right">
          <h1 className="text-xl font-display font-bold tracking-widest">B-TREE EXPLORER</h1>
          <span className="text-[9px] font-mono text-gray-500">DATA_STRUCTURES // DATABASE_INTERNALS</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Order selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500">ORDER:</span>
          {[3, 4, 5].map(o => (
            <button
              key={o}
              onClick={() => handleOrderChange(o)}
              disabled={isAnimating}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                order === o
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        {/* Input and actions */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit('insert')}
            placeholder="Key"
            disabled={isAnimating}
            className="w-20 px-3 py-1 text-xs font-mono bg-black border border-gray-800 focus:border-gray-600 outline-none"
          />
          <button
            onClick={() => handleSubmit('insert')}
            disabled={isAnimating || !inputValue}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-green-600 hover:text-green-500 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3 h-3" /> INSERT
          </button>
          <button
            onClick={() => handleSubmit('search')}
            disabled={isAnimating || !inputValue}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            <Search className="w-3 h-3" /> SEARCH
          </button>
          <button
            onClick={() => handleSubmit('delete')}
            disabled={isAnimating || !inputValue}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-red-600 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" /> DELETE
          </button>
        </div>

        {/* Utility buttons */}
        <button
          onClick={insertRandom}
          disabled={isAnimating}
          className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-yellow-600 hover:text-yellow-500 transition-colors disabled:opacity-50"
        >
          <Shuffle className="w-3 h-3" /> RANDOM 10
        </button>
        <button
          onClick={resetTree}
          disabled={isAnimating}
          className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-gray-600 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" /> RESET
        </button>

        {/* B+ links toggle */}
        <button
          onClick={() => setShowBPlusLinks(!showBPlusLinks)}
          className={`px-3 py-1 text-xs font-mono border transition-colors ${
            showBPlusLinks
              ? 'bg-purple-500 text-black border-purple-500'
              : 'bg-black text-gray-500 border-gray-800 hover:border-purple-600'
          }`}
        >
          B+ LINKS
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-mono text-gray-500">SPEED:</span>
          {[1, 2, 5].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 text-xs font-mono border transition-colors ${
                speed === s
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Main visualization area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3 bg-black/50 border border-gray-800 p-4" style={{ minHeight: '400px' }}>
          {animation.message && (
            <div className="text-center text-sm font-mono text-green-500 mb-2">
              {animation.message}
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ height: '360px' }}
          />
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">TREE STATS</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">HEIGHT:</span>
                <span className="text-white">{stats.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">TOTAL KEYS:</span>
                <span className="text-white">{stats.totalKeys}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">NODES:</span>
                <span className="text-white">{stats.totalNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">FILL RATIO:</span>
                <span className="text-white">{stats.fillRatio.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">MAX KEYS/NODE:</span>
                <span className="text-white">{order - 1}</span>
              </div>
            </div>
          </div>

          {/* Event log */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">EVENT LOG</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {eventLog.map((event, i) => (
                <div
                  key={i}
                  className={`text-[10px] font-mono ${
                    event.includes('split') ? 'text-yellow-500' :
                    event.includes('Found') ? 'text-green-500' :
                    event.includes('not found') ? 'text-red-500' :
                    event.includes('Deleted') ? 'text-red-400' :
                    'text-gray-400'
                  }`}
                >
                  {event}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono text-gray-500 border-t border-gray-900 pt-6">
        <div>ALGORITHM: B-TREE_1970</div>
        <div>USED_BY: POSTGRESQL, MYSQL, SQLITE</div>
        <div className="hidden md:block">COMPLEXITY: O(log n)</div>
        <div className="hidden md:block text-right">DISK_OPTIMIZED: TRUE</div>
      </div>
    </div>
  );
};

export default BTreeDemo;
