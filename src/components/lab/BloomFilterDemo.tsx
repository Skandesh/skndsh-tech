import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Plus, Search, Shuffle, RotateCcw, AlertTriangle, Check, X } from 'lucide-react';

interface BloomFilterDemoProps {
  onBack: () => void;
}

interface CheckResult {
  item: string;
  bits: number[];
  result: 'positive' | 'negative' | 'false_positive';
  isActuallyInSet: boolean;
}

const BloomFilterDemo: React.FC<BloomFilterDemoProps> = ({ onBack }) => {
  const [arraySize, setArraySize] = useState(256);
  const [numHashFunctions, setNumHashFunctions] = useState(3);
  const [bitArray, setBitArray] = useState<boolean[]>(() => new Array(256).fill(false));
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [eventLog, setEventLog] = useState<string[]>(['Bloom filter initialized. Size: 256 bits, 3 hash functions']);
  const [lastCheck, setLastCheck] = useState<CheckResult | null>(null);
  const [highlightedBits, setHighlightedBits] = useState<number[]>([]);
  const [animatingBits, setAnimatingBits] = useState<number[]>([]);
  const [falsePositiveCount, setFalsePositiveCount] = useState(0);

  // Simple hash function
  const hashString = useCallback((str: string, seed: number): number => {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
      hash = (hash * 31 + seed) | 0;
    }
    return Math.abs(hash);
  }, []);

  // Get hash positions for an item
  const getHashPositions = useCallback((item: string): number[] => {
    const positions: number[] = [];
    for (let i = 0; i < numHashFunctions; i++) {
      const hash = hashString(item.toLowerCase(), i * 7919 + 31);
      positions.push(hash % arraySize);
    }
    return positions;
  }, [hashString, numHashFunctions, arraySize]);

  // Log a message
  const log = useCallback((message: string) => {
    setEventLog(prev => [message, ...prev.slice(0, 49)]);
  }, []);

  // Add an item to the filter
  const addItem = useCallback(async (item: string) => {
    if (!item.trim()) return;

    const normalizedItem = item.trim().toLowerCase();

    if (addedItems.has(normalizedItem)) {
      log(`"${item}" already in filter`);
      return;
    }

    const positions = getHashPositions(normalizedItem);

    // Animate the bits
    setAnimatingBits(positions);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Set the bits
    setBitArray(prev => {
      const newArray = [...prev];
      positions.forEach(pos => {
        newArray[pos] = true;
      });
      return newArray;
    });

    setAddedItems(prev => new Set(prev).add(normalizedItem));
    log(`Added "${item}" → bits [${positions.join(', ')}]`);

    await new Promise(resolve => setTimeout(resolve, 200));
    setAnimatingBits([]);
  }, [addedItems, getHashPositions, log]);

  // Check if an item might be in the filter
  const checkItem = useCallback(async (item: string) => {
    if (!item.trim()) return;

    const normalizedItem = item.trim().toLowerCase();
    const positions = getHashPositions(normalizedItem);

    setHighlightedBits(positions);

    // Check all positions
    const allBitsSet = positions.every(pos => bitArray[pos]);
    const isActuallyInSet = addedItems.has(normalizedItem);

    let result: 'positive' | 'negative' | 'false_positive';
    if (!allBitsSet) {
      result = 'negative';
      log(`Checked "${item}" → bits [${positions.join(', ')}] → DEFINITELY NOT IN SET`);
    } else if (isActuallyInSet) {
      result = 'positive';
      log(`Checked "${item}" → bits [${positions.join(', ')}] → POSSIBLY IN SET (true positive)`);
    } else {
      result = 'false_positive';
      setFalsePositiveCount(prev => prev + 1);
      log(`Checked "${item}" → bits [${positions.join(', ')}] → FALSE POSITIVE! Never added.`);
    }

    setLastCheck({
      item,
      bits: positions,
      result,
      isActuallyInSet,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    setHighlightedBits([]);
    setLastCheck(null);
  }, [bitArray, addedItems, getHashPositions, log]);

  // Handle input submission
  const handleAdd = () => {
    addItem(inputValue);
    setInputValue('');
  };

  const handleCheck = () => {
    checkItem(inputValue);
    setInputValue('');
  };

  // Add random items
  const addRandomItems = async () => {
    const names = [
      'alice', 'bob', 'charlie', 'david', 'eve', 'frank', 'grace', 'henry',
      'iris', 'jack', 'kate', 'leo', 'mia', 'noah', 'olivia', 'peter',
      'quinn', 'ruby', 'sam', 'tina', 'uma', 'victor', 'wendy', 'xander'
    ];
    const shuffled = names.sort(() => Math.random() - 0.5).slice(0, 10);
    for (const name of shuffled) {
      if (!addedItems.has(name)) {
        await addItem(name);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  // Reset the filter
  const resetFilter = (newSize?: number) => {
    const size = newSize || arraySize;
    setBitArray(new Array(size).fill(false));
    setAddedItems(new Set());
    setEventLog([`Bloom filter reset. Size: ${size} bits, ${numHashFunctions} hash functions`]);
    setLastCheck(null);
    setHighlightedBits([]);
    setFalsePositiveCount(0);
  };

  // Handle size change
  const handleSizeChange = (newSize: number) => {
    setArraySize(newSize);
    resetFilter(newSize);
  };

  // Handle hash function count change
  const handleHashChange = (newCount: number) => {
    setNumHashFunctions(newCount);
    resetFilter();
  };

  // Calculate stats
  const stats = useMemo(() => {
    const bitsSet = bitArray.filter(b => b).length;
    const fillRatio = (bitsSet / arraySize) * 100;

    // Theoretical false positive rate
    const k = numHashFunctions;
    const m = arraySize;
    const n = addedItems.size;
    const theoreticalFPR = n > 0
      ? Math.pow(1 - Math.exp(-k * n / m), k) * 100
      : 0;

    // Optimal hash functions
    const optimalK = n > 0 ? Math.round((m / n) * Math.log(2)) : numHashFunctions;

    return {
      bitsSet,
      fillRatio,
      theoreticalFPR,
      optimalK,
      itemCount: addedItems.size,
    };
  }, [bitArray, arraySize, numHashFunctions, addedItems.size]);

  // Render bit grid
  const gridSize = Math.sqrt(arraySize);
  const isSquare = Number.isInteger(gridSize);
  const cols = isSquare ? gridSize : 16;

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
          <h1 className="text-xl font-display font-bold tracking-widest">BLOOM FILTER</h1>
          <span className="text-[9px] font-mono text-gray-500">PROBABILISTIC_DATA_STRUCTURES // THE_BOUNCER</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Size selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500">SIZE:</span>
          {[64, 128, 256, 512].map(size => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                arraySize === size
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Hash function selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500">HASH FNS:</span>
          {[2, 3, 4, 5].map(k => (
            <button
              key={k}
              onClick={() => handleHashChange(k)}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                numHashFunctions === k
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Input and actions */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Name..."
            className="w-32 px-3 py-1 text-xs font-mono bg-black border border-gray-800 focus:border-gray-600 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-green-600 hover:text-green-500 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3 h-3" /> ADD
          </button>
          <button
            onClick={handleCheck}
            disabled={!inputValue.trim()}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            <Search className="w-3 h-3" /> CHECK
          </button>
        </div>

        {/* Utility buttons */}
        <button
          onClick={addRandomItems}
          className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-yellow-600 hover:text-yellow-500 transition-colors"
        >
          <Shuffle className="w-3 h-3" /> RANDOM 10
        </button>
        <button
          onClick={() => resetFilter()}
          className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-gray-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> RESET
        </button>
      </div>

      {/* Check result banner */}
      {lastCheck && (
        <div className={`mb-4 p-4 border ${
          lastCheck.result === 'negative'
            ? 'border-green-800 bg-green-950/30'
            : lastCheck.result === 'false_positive'
              ? 'border-red-800 bg-red-950/30'
              : 'border-yellow-800 bg-yellow-950/30'
        }`}>
          <div className="flex items-center gap-3">
            {lastCheck.result === 'negative' ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : lastCheck.result === 'false_positive' ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <div className="text-sm font-mono">
                {lastCheck.result === 'negative' && (
                  <span className="text-green-500">DEFINITELY NOT IN SET</span>
                )}
                {lastCheck.result === 'positive' && (
                  <span className="text-yellow-500">POSSIBLY IN SET (True Positive)</span>
                )}
                {lastCheck.result === 'false_positive' && (
                  <span className="text-red-500">FALSE POSITIVE! &quot;{lastCheck.item}&quot; was never added.</span>
                )}
              </div>
              <div className="text-[10px] font-mono text-gray-500 mt-1">
                Checked bits: [{lastCheck.bits.join(', ')}]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main visualization area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bit array grid */}
        <div className="lg:col-span-3 bg-black/50 border border-gray-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-mono text-gray-500">BIT ARRAY ({arraySize} bits)</h3>
            <div className="text-[10px] font-mono text-gray-500">
              {stats.bitsSet}/{arraySize} SET ({stats.fillRatio.toFixed(1)}%)
            </div>
          </div>

          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {bitArray.map((bit, i) => {
              const isHighlighted = highlightedBits.includes(i);
              const isAnimating = animatingBits.includes(i);
              const isLastCheckBit = lastCheck?.bits.includes(i);

              return (
                <div
                  key={i}
                  className={`
                    aspect-square flex items-center justify-center text-[8px] font-mono
                    transition-all duration-300 border
                    ${bit
                      ? isHighlighted || isAnimating
                        ? lastCheck?.result === 'negative'
                          ? 'bg-green-500 border-green-400'
                          : lastCheck?.result === 'false_positive'
                            ? 'bg-red-500 border-red-400'
                            : 'bg-yellow-500 border-yellow-400'
                        : 'bg-green-600 border-green-700'
                      : isHighlighted
                        ? 'bg-gray-800 border-green-400 ring-2 ring-green-500'
                        : 'bg-gray-900 border-gray-800'
                    }
                    ${isAnimating ? 'scale-125 ring-2 ring-green-500' : ''}
                  `}
                  title={`Bit ${i}: ${bit ? 'ON' : 'OFF'}`}
                >
                  {arraySize <= 128 && (
                    <span className={bit ? 'text-black' : 'text-gray-700'}>{i}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">FILTER STATS</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">ITEMS:</span>
                <span className="text-white">{stats.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">BITS SET:</span>
                <span className="text-white">{stats.bitsSet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">FILL %:</span>
                <span className={stats.fillRatio > 50 ? 'text-yellow-500' : 'text-white'}>
                  {stats.fillRatio.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">EST. FPR:</span>
                <span className={stats.theoreticalFPR > 10 ? 'text-red-500' : 'text-white'}>
                  {stats.theoreticalFPR.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">OPTIMAL K:</span>
                <span className={numHashFunctions === stats.optimalK ? 'text-green-500' : 'text-gray-400'}>
                  {stats.optimalK}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">FALSE POS:</span>
                <span className={falsePositiveCount > 0 ? 'text-red-500' : 'text-white'}>
                  {falsePositiveCount}
                </span>
              </div>
            </div>

            {stats.fillRatio > 50 && (
              <div className="mt-3 p-2 border border-yellow-800 bg-yellow-950/30 text-[10px] font-mono text-yellow-500">
                WARNING: Filter &gt;50% full. FPR increasing rapidly.
              </div>
            )}
          </div>

          {/* Added items */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">ADDED ITEMS ({addedItems.size})</h3>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {Array.from(addedItems).map(item => (
                <span key={item} className="px-2 py-1 text-[10px] font-mono bg-gray-900 border border-gray-800">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Event log */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">EVENT LOG</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {eventLog.map((event, i) => (
                <div
                  key={i}
                  className={`text-[10px] font-mono ${
                    event.includes('FALSE POSITIVE') ? 'text-red-500' :
                    event.includes('DEFINITELY NOT') ? 'text-green-500' :
                    event.includes('Added') ? 'text-blue-400' :
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
        <div>ALGORITHM: BLOOM_1970</div>
        <div>USED_BY: CHROME, CASSANDRA, MEDIUM</div>
        <div className="hidden md:block">SPACE: {Math.ceil(arraySize / 8)} BYTES</div>
        <div className="hidden md:block text-right">FALSE_NEG_RATE: 0%</div>
      </div>
    </div>
  );
};

export default BloomFilterDemo;
