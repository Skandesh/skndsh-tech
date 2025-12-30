import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Minus, Equal, RotateCcw, Sparkles, Search } from 'lucide-react';

interface WordEmbeddingsDemoProps {
  onBack: () => void;
}

// Pre-computed 2D embeddings (simplified projection from real Word2Vec)
// Positions are normalized to fit in canvas space
const WORD_EMBEDDINGS: Record<string, { x: number; y: number; category: string }> = {
  // Royalty
  king: { x: 0.7, y: 0.2, category: 'royalty' },
  queen: { x: 0.75, y: 0.35, category: 'royalty' },
  prince: { x: 0.65, y: 0.25, category: 'royalty' },
  princess: { x: 0.72, y: 0.38, category: 'royalty' },

  // Gender
  man: { x: 0.5, y: 0.15, category: 'person' },
  woman: { x: 0.55, y: 0.3, category: 'person' },
  boy: { x: 0.45, y: 0.12, category: 'person' },
  girl: { x: 0.52, y: 0.28, category: 'person' },

  // Countries
  france: { x: 0.2, y: 0.6, category: 'country' },
  italy: { x: 0.25, y: 0.55, category: 'country' },
  germany: { x: 0.18, y: 0.52, category: 'country' },
  spain: { x: 0.28, y: 0.58, category: 'country' },
  japan: { x: 0.15, y: 0.65, category: 'country' },

  // Cities
  paris: { x: 0.3, y: 0.7, category: 'city' },
  rome: { x: 0.35, y: 0.65, category: 'city' },
  berlin: { x: 0.28, y: 0.62, category: 'city' },
  madrid: { x: 0.38, y: 0.68, category: 'city' },
  tokyo: { x: 0.25, y: 0.75, category: 'city' },

  // Animals
  dog: { x: 0.8, y: 0.7, category: 'animal' },
  cat: { x: 0.85, y: 0.72, category: 'animal' },
  puppy: { x: 0.78, y: 0.68, category: 'animal' },
  kitten: { x: 0.83, y: 0.7, category: 'animal' },
  horse: { x: 0.75, y: 0.75, category: 'animal' },
  elephant: { x: 0.7, y: 0.78, category: 'animal' },

  // Verbs (tense)
  walk: { x: 0.4, y: 0.4, category: 'verb' },
  walked: { x: 0.42, y: 0.45, category: 'verb' },
  run: { x: 0.45, y: 0.38, category: 'verb' },
  ran: { x: 0.47, y: 0.43, category: 'verb' },
  swim: { x: 0.38, y: 0.42, category: 'verb' },
  swam: { x: 0.4, y: 0.47, category: 'verb' },

  // Emotions
  happy: { x: 0.1, y: 0.2, category: 'emotion' },
  joyful: { x: 0.12, y: 0.18, category: 'emotion' },
  sad: { x: 0.9, y: 0.9, category: 'emotion' },
  angry: { x: 0.88, y: 0.85, category: 'emotion' },
  excited: { x: 0.15, y: 0.22, category: 'emotion' },

  // Food
  apple: { x: 0.55, y: 0.85, category: 'food' },
  banana: { x: 0.58, y: 0.82, category: 'food' },
  orange: { x: 0.52, y: 0.88, category: 'food' },
  pizza: { x: 0.6, y: 0.8, category: 'food' },
};

// Predefined analogy examples
const ANALOGY_EXAMPLES = [
  { a: 'king', b: 'man', c: 'woman', result: 'queen', label: 'king - man + woman = queen' },
  { a: 'paris', b: 'france', c: 'italy', result: 'rome', label: 'paris - france + italy = rome' },
  { a: 'walked', b: 'walk', c: 'swim', result: 'swam', label: 'walked - walk + swim = swam' },
  { a: 'puppy', b: 'dog', c: 'cat', result: 'kitten', label: 'puppy - dog + cat = kitten' },
];

const CATEGORY_COLORS: Record<string, string> = {
  royalty: '#f59e0b',
  person: '#3b82f6',
  country: '#22c55e',
  city: '#14b8a6',
  animal: '#ec4899',
  verb: '#8b5cf6',
  emotion: '#ef4444',
  food: '#f97316',
};

const WordEmbeddingsDemo: React.FC<WordEmbeddingsDemoProps> = ({ onBack }) => {
  const [activeWords, setActiveWords] = useState<Set<string>>(new Set(['king', 'queen', 'man', 'woman']));
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [analogyMode, setAnalogyMode] = useState(false);
  const [analogyA, setAnalogyA] = useState('');
  const [analogyB, setAnalogyB] = useState('');
  const [analogyC, setAnalogyC] = useState('');
  const [analogyResult, setAnalogyResult] = useState<{ word: string; position: { x: number; y: number } } | null>(null);
  const [eventLog, setEventLog] = useState<string[]>(['Word embeddings loaded. 50 words in vocabulary.']);
  const [showClusters, setShowClusters] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const log = useCallback((message: string) => {
    setEventLog(prev => [message, ...prev.slice(0, 49)]);
  }, []);

  // Calculate distance between two words
  const distance = useCallback((w1: string, w2: string): number => {
    const e1 = WORD_EMBEDDINGS[w1];
    const e2 = WORD_EMBEDDINGS[w2];
    if (!e1 || !e2) return Infinity;
    return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
  }, []);

  // Calculate cosine similarity (approximated for 2D)
  const cosineSimilarity = useCallback((w1: string, w2: string): number => {
    const e1 = WORD_EMBEDDINGS[w1];
    const e2 = WORD_EMBEDDINGS[w2];
    if (!e1 || !e2) return 0;
    // Center the vectors
    const cx = 0.5, cy = 0.5;
    const v1 = { x: e1.x - cx, y: e1.y - cy };
    const v2 = { x: e2.x - cx, y: e2.y - cy };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    return dot / (mag1 * mag2);
  }, []);

  // Find nearest neighbors
  const nearestNeighbors = useMemo(() => {
    if (!selectedWord) return [];
    return Object.keys(WORD_EMBEDDINGS)
      .filter(w => w !== selectedWord)
      .map(w => ({ word: w, dist: distance(selectedWord, w), sim: cosineSimilarity(selectedWord, w) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);
  }, [selectedWord, distance, cosineSimilarity]);

  // Perform vector arithmetic
  const performAnalogy = useCallback(() => {
    const a = WORD_EMBEDDINGS[analogyA.toLowerCase()];
    const b = WORD_EMBEDDINGS[analogyB.toLowerCase()];
    const c = WORD_EMBEDDINGS[analogyC.toLowerCase()];

    if (!a || !b || !c) {
      log('All words must be in vocabulary');
      return;
    }

    // a - b + c
    const resultX = a.x - b.x + c.x;
    const resultY = a.y - b.y + c.y;

    // Find nearest word to result
    let nearest = '';
    let minDist = Infinity;
    Object.entries(WORD_EMBEDDINGS).forEach(([word, pos]) => {
      if (word === analogyA || word === analogyB || word === analogyC) return;
      const dist = Math.sqrt(Math.pow(pos.x - resultX, 2) + Math.pow(pos.y - resultY, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = word;
      }
    });

    setAnalogyResult({
      word: nearest,
      position: { x: resultX, y: resultY },
    });

    // Add words to display
    setActiveWords(prev => {
      const next = new Set(prev);
      next.add(analogyA.toLowerCase());
      next.add(analogyB.toLowerCase());
      next.add(analogyC.toLowerCase());
      next.add(nearest);
      return next;
    });

    log(`${analogyA} - ${analogyB} + ${analogyC} ≈ ${nearest}`);
  }, [analogyA, analogyB, analogyC, log]);

  // Run predefined analogy
  const runExample = useCallback((example: typeof ANALOGY_EXAMPLES[0]) => {
    setAnalogyA(example.a);
    setAnalogyB(example.b);
    setAnalogyC(example.c);

    setActiveWords(prev => {
      const next = new Set(prev);
      next.add(example.a);
      next.add(example.b);
      next.add(example.c);
      next.add(example.result);
      return next;
    });

    const a = WORD_EMBEDDINGS[example.a];
    const b = WORD_EMBEDDINGS[example.b];
    const c = WORD_EMBEDDINGS[example.c];

    setAnalogyResult({
      word: example.result,
      position: { x: a.x - b.x + c.x, y: a.y - b.y + c.y },
    });

    log(`${example.label}`);
  }, [log]);

  // Add a word
  const addWord = useCallback((word: string) => {
    const w = word.toLowerCase();
    if (WORD_EMBEDDINGS[w]) {
      setActiveWords(prev => new Set(prev).add(w));
      log(`Added "${w}" to visualization`);
    } else {
      log(`"${word}" not in vocabulary`);
    }
  }, [log]);

  // Clear words
  const clearWords = useCallback(() => {
    setActiveWords(new Set());
    setSelectedWord(null);
    setAnalogyResult(null);
    log('Cleared all words');
  }, [log]);

  // Load preset word groups
  const loadPreset = useCallback((preset: string) => {
    const presets: Record<string, string[]> = {
      royalty: ['king', 'queen', 'prince', 'princess', 'man', 'woman'],
      geography: ['france', 'paris', 'italy', 'rome', 'germany', 'berlin'],
      animals: ['dog', 'cat', 'puppy', 'kitten', 'horse', 'elephant'],
      emotions: ['happy', 'sad', 'angry', 'joyful', 'excited'],
    };
    if (presets[preset]) {
      setActiveWords(new Set(presets[preset]));
      log(`Loaded ${preset} preset`);
    }
  }, [log]);

  // Draw canvas
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

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * (width - 2 * padding);
      const y = padding + (i / 10) * (height - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw cluster regions if enabled
    if (showClusters) {
      const categories = new Map<string, { x: number; y: number }[]>();
      Object.entries(WORD_EMBEDDINGS).forEach(([word, data]) => {
        if (!categories.has(data.category)) {
          categories.set(data.category, []);
        }
        categories.get(data.category)!.push({ x: data.x, y: data.y });
      });

      categories.forEach((points, category) => {
        const color = CATEGORY_COLORS[category] || '#666';
        // Calculate bounding box
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs) - 0.05;
        const maxX = Math.max(...xs) + 0.05;
        const minY = Math.min(...ys) - 0.05;
        const maxY = Math.max(...ys) + 0.05;

        const screenMinX = padding + minX * (width - 2 * padding);
        const screenMaxX = padding + maxX * (width - 2 * padding);
        const screenMinY = padding + minY * (height - 2 * padding);
        const screenMaxY = padding + maxY * (height - 2 * padding);

        ctx.fillStyle = color + '15';
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(screenMinX, screenMinY, screenMaxX - screenMinX, screenMaxY - screenMinY, 10);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = color + '80';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(category.toUpperCase(), screenMinX + 5, screenMinY + 12);
      });
    }

    // Draw connections for nearest neighbors
    if (selectedWord && WORD_EMBEDDINGS[selectedWord]) {
      const sel = WORD_EMBEDDINGS[selectedWord];
      const selX = padding + sel.x * (width - 2 * padding);
      const selY = padding + sel.y * (height - 2 * padding);

      nearestNeighbors.forEach((neighbor, i) => {
        if (!activeWords.has(neighbor.word)) return;
        const n = WORD_EMBEDDINGS[neighbor.word];
        const nX = padding + n.x * (width - 2 * padding);
        const nY = padding + n.y * (height - 2 * padding);

        ctx.strokeStyle = `rgba(139, 92, 246, ${0.8 - i * 0.15})`;
        ctx.lineWidth = 2 - i * 0.3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(selX, selY);
        ctx.lineTo(nX, nY);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Draw analogy arrow if active
    if (analogyResult && analogyA && analogyB && analogyC) {
      const a = WORD_EMBEDDINGS[analogyA.toLowerCase()];
      const b = WORD_EMBEDDINGS[analogyB.toLowerCase()];
      const c = WORD_EMBEDDINGS[analogyC.toLowerCase()];

      if (a && b && c) {
        // Draw vector from b to a (the relationship)
        const bX = padding + b.x * (width - 2 * padding);
        const bY = padding + b.y * (height - 2 * padding);
        const aX = padding + a.x * (width - 2 * padding);
        const aY = padding + a.y * (height - 2 * padding);
        const cX = padding + c.x * (width - 2 * padding);
        const cY = padding + c.y * (height - 2 * padding);
        const rX = padding + analogyResult.position.x * (width - 2 * padding);
        const rY = padding + analogyResult.position.y * (height - 2 * padding);

        // a - b vector (relationship)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(bX, bY);
        ctx.lineTo(aX, aY);
        ctx.stroke();

        // Apply same vector from c to result
        ctx.strokeStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(rX, rY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Result point
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(rX, rY, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw word points
    activeWords.forEach(word => {
      const data = WORD_EMBEDDINGS[word];
      if (!data) return;

      const x = padding + data.x * (width - 2 * padding);
      const y = padding + data.y * (height - 2 * padding);

      const isSelected = word === selectedWord;
      const color = CATEGORY_COLORS[data.category] || '#666';

      // Point
      ctx.fillStyle = isSelected ? '#fff' : color;
      ctx.strokeStyle = isSelected ? color : '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = isSelected ? '#fff' : '#aaa';
      ctx.font = isSelected ? 'bold 12px JetBrains Mono' : '11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(word, x, y - 12);
    });
  }, [activeWords, selectedWord, nearestNeighbors, analogyResult, analogyA, analogyB, analogyC, showClusters]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const padding = 40 / rect.width;

    // Find clicked word
    let closest: string | null = null;
    let minDist = 0.05;

    activeWords.forEach(word => {
      const data = WORD_EMBEDDINGS[word];
      if (!data) return;
      const wx = padding + data.x * (1 - 2 * padding);
      const wy = padding + data.y * (1 - 2 * padding);
      const dist = Math.sqrt(Math.pow(x - wx, 2) + Math.pow(y - wy, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = word;
      }
    });

    if (closest) {
      setSelectedWord(closest === selectedWord ? null : closest);
      if (closest !== selectedWord) {
        log(`Selected "${closest}"`);
      }
    } else {
      setSelectedWord(null);
    }
  }, [activeWords, selectedWord, log]);

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
          <h1 className="text-xl font-display font-bold tracking-widest">WORD EMBEDDINGS</h1>
          <span className="text-[9px] font-mono text-gray-500">AI_ML // SEMANTIC_SPACE</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500">LOAD:</span>
          {['royalty', 'geography', 'animals', 'emotions'].map(preset => (
            <button
              key={preset}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1 text-xs font-mono border border-gray-800 hover:border-gray-600 transition-colors"
            >
              {preset.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Show clusters toggle */}
        <button
          onClick={() => setShowClusters(!showClusters)}
          className={`px-3 py-1 text-xs font-mono border transition-colors ${
            showClusters
              ? 'bg-purple-500 text-black border-purple-500'
              : 'bg-black text-gray-500 border-gray-800 hover:border-purple-600'
          }`}
        >
          CLUSTERS
        </button>

        <button
          onClick={clearWords}
          className="flex items-center gap-1 px-3 py-1 text-xs font-mono border border-gray-800 hover:border-gray-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> CLEAR
        </button>
      </div>

      {/* Analogy controls */}
      <div className="mb-6 p-4 bg-black/50 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-mono text-gray-400">VECTOR ARITHMETIC</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input
            type="text"
            value={analogyA}
            onChange={e => setAnalogyA(e.target.value)}
            placeholder="king"
            className="w-24 px-2 py-1 text-xs font-mono bg-black border border-gray-800 focus:border-gray-600 outline-none"
          />
          <Minus className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={analogyB}
            onChange={e => setAnalogyB(e.target.value)}
            placeholder="man"
            className="w-24 px-2 py-1 text-xs font-mono bg-black border border-gray-800 focus:border-gray-600 outline-none"
          />
          <Plus className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={analogyC}
            onChange={e => setAnalogyC(e.target.value)}
            placeholder="woman"
            className="w-24 px-2 py-1 text-xs font-mono bg-black border border-gray-800 focus:border-gray-600 outline-none"
          />
          <Equal className="w-4 h-4 text-gray-500" />
          <button
            onClick={performAnalogy}
            className="px-3 py-1 text-xs font-mono border border-green-800 bg-green-950/30 text-green-500 hover:border-green-600 transition-colors"
          >
            COMPUTE
          </button>
          {analogyResult && (
            <span className="px-3 py-1 text-xs font-mono bg-green-500 text-black font-bold">
              {analogyResult.word}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-mono text-gray-500">EXAMPLES:</span>
          {ANALOGY_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => runExample(ex)}
              className="px-2 py-1 text-[10px] font-mono border border-gray-800 hover:border-yellow-600 hover:text-yellow-500 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main visualization area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3 bg-black/50 border border-gray-800 p-4" style={{ minHeight: '450px' }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
            style={{ height: '420px' }}
          />
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Add word */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">ADD WORD</h3>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {Object.keys(WORD_EMBEDDINGS)
                .filter(w => !activeWords.has(w))
                .map(word => (
                  <button
                    key={word}
                    onClick={() => addWord(word)}
                    className="px-2 py-1 text-[10px] font-mono bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors"
                    style={{ borderLeftColor: CATEGORY_COLORS[WORD_EMBEDDINGS[word].category], borderLeftWidth: 2 }}
                  >
                    {word}
                  </button>
                ))}
            </div>
          </div>

          {/* Selected word info */}
          {selectedWord && (
            <div className="bg-black/50 border border-gray-800 p-4">
              <h3 className="text-xs font-mono text-gray-500 mb-3">
                <Search className="w-3 h-3 inline mr-2" />
                NEAREST TO &quot;{selectedWord.toUpperCase()}&quot;
              </h3>
              <div className="space-y-2">
                {nearestNeighbors.map((n, i) => (
                  <div key={n.word} className="flex justify-between text-sm font-mono">
                    <span
                      className="cursor-pointer hover:text-white"
                      onClick={() => addWord(n.word)}
                      style={{ color: CATEGORY_COLORS[WORD_EMBEDDINGS[n.word]?.category] || '#666' }}
                    >
                      {i + 1}. {n.word}
                    </span>
                    <span className="text-gray-500">{(n.sim * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">CATEGORIES</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-mono text-gray-400">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event log */}
          <div className="bg-black/50 border border-gray-800 p-4">
            <h3 className="text-xs font-mono text-gray-500 mb-3">EVENT LOG</h3>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {eventLog.map((event, i) => (
                <div
                  key={i}
                  className={`text-[10px] font-mono ${
                    event.includes('≈') ? 'text-green-500' :
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
        <div>ALGORITHM: WORD2VEC_2013</div>
        <div>USED_BY: GOOGLE, OPENAI, NETFLIX</div>
        <div className="hidden md:block">DIMENSIONS: 300 (2D PROJECTION)</div>
        <div className="hidden md:block text-right">VOCABULARY: {Object.keys(WORD_EMBEDDINGS).length} WORDS</div>
      </div>
    </div>
  );
};

export default WordEmbeddingsDemo;
