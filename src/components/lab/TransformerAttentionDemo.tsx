import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Search, Eye, Layers, Grid3X3, Sparkles } from 'lucide-react';

interface Token {
  id: number;
  text: string;
  x: number;
  y: number;
}

interface AttentionWeight {
  from: number;
  to: number;
  weight: number;
}

const PRELOADED_EXAMPLES = [
  { label: 'Pronoun: Tired', text: 'The animal didn\'t cross the street because it was too tired' },
  { label: 'Pronoun: Wide', text: 'The animal didn\'t cross the street because it was too wide' },
  { label: 'Bank: River', text: 'He ran to the river and the bank robber followed' },
  { label: 'Bank: Money', text: 'She went to deposit money at the bank downtown' },
];

// Simulated attention patterns based on linguistic rules
const computeSimulatedAttention = (tokens: string[], headType: number): AttentionWeight[] => {
  const weights: AttentionWeight[] = [];
  const n = tokens.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let weight = 0.05; // Base attention

      const tokenI = tokens[i].toLowerCase();
      const tokenJ = tokens[j].toLowerCase();

      // Head 0: Self and neighbors (local context)
      if (headType === 0) {
        if (i === j) weight = 0.3;
        else if (Math.abs(i - j) === 1) weight = 0.25;
        else if (Math.abs(i - j) === 2) weight = 0.15;
        else weight = 0.05;
      }

      // Head 1: Pronoun resolution
      if (headType === 1) {
        const pronouns = ['it', 'they', 'he', 'she', 'them', 'his', 'her', 'its'];
        const nouns = ['animal', 'street', 'bank', 'robber', 'money', 'river', 'cat', 'dog'];

        if (pronouns.includes(tokenI)) {
          if (nouns.includes(tokenJ)) {
            // Semantic matching for "it was too tired" vs "it was too wide"
            if (tokenI === 'it') {
              const hasWide = tokens.some(t => t.toLowerCase() === 'wide');
              const hasTired = tokens.some(t => t.toLowerCase() === 'tired');

              if (hasTired && tokenJ === 'animal') weight = 0.7;
              else if (hasWide && tokenJ === 'street') weight = 0.7;
              else if (nouns.includes(tokenJ)) weight = 0.3;
            } else {
              weight = 0.5;
            }
          }
        }
        if (i === j) weight = Math.max(weight, 0.2);
      }

      // Head 2: Subject-verb relationships
      if (headType === 2) {
        const verbs = ['cross', 'ran', 'went', 'deposit', 'followed', 'was', 'didn\'t'];
        const subjects = ['animal', 'he', 'she', 'it', 'they', 'robber'];

        if (verbs.includes(tokenI) && subjects.includes(tokenJ)) weight = 0.6;
        if (subjects.includes(tokenI) && verbs.includes(tokenJ)) weight = 0.5;
        if (i === j) weight = 0.2;
      }

      // Head 3: Semantic associations (bank-river, bank-money)
      if (headType === 3) {
        const associations: Record<string, string[]> = {
          'bank': ['river', 'money', 'deposit', 'downtown', 'robber'],
          'river': ['bank', 'ran', 'water'],
          'money': ['bank', 'deposit'],
          'robber': ['bank', 'followed', 'ran'],
          'animal': ['cross', 'tired', 'street'],
          'street': ['cross', 'wide'],
        };

        if (associations[tokenI]?.includes(tokenJ)) weight = 0.7;
        if (associations[tokenJ]?.includes(tokenI)) weight = 0.5;
        if (i === j) weight = 0.2;
      }

      weights.push({ from: i, to: j, weight });
    }
  }

  // Normalize weights per row (softmax-like)
  for (let i = 0; i < n; i++) {
    const rowWeights = weights.filter(w => w.from === i);
    const sum = rowWeights.reduce((s, w) => s + w.weight, 0);
    rowWeights.forEach(w => w.weight = w.weight / sum);
  }

  return weights;
};

const TransformerAttentionDemo = ({ onBack }: { onBack: () => void }) => {
  const [inputText, setInputText] = useState(PRELOADED_EXAMPLES[0].text);
  const [activeHead, setActiveHead] = useState(1);
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);
  const [lockedToken, setLockedToken] = useState<number | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const focusedToken = lockedToken ?? hoveredToken;

  // Tokenize input
  const tokens = useMemo(() => {
    return inputText.trim().split(/\s+/).filter(t => t.length > 0);
  }, [inputText]);

  // Position tokens in a flowing layout
  const tokenPositions: Token[] = useMemo(() => {
    const positions: Token[] = [];
    const containerWidth = 600;
    const tokenWidth = 80;
    const tokenHeight = 50;
    const padding = 20;

    let x = padding;
    let y = padding;

    tokens.forEach((text, i) => {
      const estimatedWidth = Math.max(tokenWidth, text.length * 12 + 20);

      if (x + estimatedWidth > containerWidth - padding) {
        x = padding;
        y += tokenHeight + 30;
      }

      positions.push({ id: i, text, x: x + estimatedWidth / 2, y: y + tokenHeight / 2 });
      x += estimatedWidth + 15;
    });

    return positions;
  }, [tokens]);

  // Compute attention weights
  const attentionWeights = useMemo(() => {
    return computeSimulatedAttention(tokens, activeHead);
  }, [tokens, activeHead]);

  // Get attention from a specific token
  const getAttentionFrom = useCallback((fromIdx: number): AttentionWeight[] => {
    return attentionWeights.filter(w => w.from === fromIdx);
  }, [attentionWeights]);

  const HEAD_NAMES = [
    { id: 0, name: 'LOCAL', desc: 'Nearby words' },
    { id: 1, name: 'PRONOUN', desc: 'References' },
    { id: 2, name: 'SYNTAX', desc: 'Subject-verb' },
    { id: 3, name: 'SEMANTIC', desc: 'Associations' },
  ];

  const containerHeight = Math.max(200, Math.max(...tokenPositions.map(t => t.y)) + 80);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8 flex flex-col">
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
          <h1 className="text-xl font-display font-bold tracking-widest">TRANSFORMER ATTENTION</h1>
          <span className="text-[9px] font-mono text-gray-500">NEURAL_NETWORKS // INVESTIGATION_BOARD</span>
        </div>
      </div>

      {/* Input */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-mono text-gray-400">ENTER SENTENCE</span>
        </div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setLockedToken(null); }}
          className="w-full bg-gray-900/50 border border-gray-800 px-4 py-3 text-white font-mono focus:outline-none focus:border-gray-600"
          placeholder="Type a sentence..."
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {PRELOADED_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setInputText(ex.text); setLockedToken(null); }}
              className={`px-3 py-1 text-[10px] font-mono border transition-colors ${
                inputText === ex.text
                  ? 'bg-purple-900/50 text-purple-400 border-purple-700'
                  : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:border-gray-600'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-mono text-gray-400">HEAD:</span>
          {HEAD_NAMES.map(head => (
            <button
              key={head.id}
              onClick={() => setActiveHead(head.id)}
              className={`px-3 py-1.5 text-[10px] font-mono border transition-colors ${
                activeHead === head.id
                  ? 'bg-white text-black border-white'
                  : 'border-gray-700 hover:border-gray-500 text-gray-400'
              }`}
              title={head.desc}
            >
              {head.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono border transition-colors ${
            showHeatmap
              ? 'bg-orange-900/50 text-orange-400 border-orange-700'
              : 'border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          <Grid3X3 className="w-3 h-3" />
          HEATMAP
        </button>
      </div>

      {/* Main Visualization */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investigation Board */}
        <div className="lg:col-span-2 border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-950/80 p-4 relative overflow-hidden">
          <div className="absolute top-2 left-2 text-[9px] font-mono text-gray-600 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            INVESTIGATION BOARD
          </div>

          {/* SVG for connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ minHeight: containerHeight }}
          >
            {focusedToken !== null && getAttentionFrom(focusedToken).map((w, i) => {
              if (w.weight < 0.05) return null;
              const from = tokenPositions[w.from];
              const to = tokenPositions[w.to];
              if (!from || !to) return null;

              const opacity = Math.min(1, w.weight * 2);
              const strokeWidth = 1 + w.weight * 8;

              return (
                <line
                  key={i}
                  x1={from.x + 40}
                  y1={from.y + 40}
                  x2={to.x + 40}
                  y2={to.y + 40}
                  stroke={w.from === w.to ? '#8b5cf6' : '#ef4444'}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Token cards */}
          <div className="relative" style={{ minHeight: containerHeight }}>
            {tokenPositions.map((token, i) => {
              const isSource = focusedToken === i;
              const attentionToMe = focusedToken !== null
                ? attentionWeights.find(w => w.from === focusedToken && w.to === i)?.weight ?? 0
                : 0;

              return (
                <div
                  key={i}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                    isSource
                      ? 'ring-2 ring-purple-500 z-20'
                      : focusedToken !== null && attentionToMe > 0.1
                      ? 'ring-2 ring-red-500/50 z-10'
                      : 'z-0'
                  }`}
                  style={{ left: token.x + 40, top: token.y + 40 }}
                  onMouseEnter={() => !lockedToken && setHoveredToken(i)}
                  onMouseLeave={() => !lockedToken && setHoveredToken(null)}
                  onClick={() => setLockedToken(lockedToken === i ? null : i)}
                >
                  <div
                    className={`px-3 py-2 border bg-black/90 font-mono text-sm transition-all ${
                      isSource
                        ? 'border-purple-500 text-purple-300'
                        : focusedToken !== null && attentionToMe > 0.1
                        ? 'border-red-500/50 text-red-300'
                        : 'border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                    style={{
                      boxShadow: isSource
                        ? '0 0 20px rgba(139, 92, 246, 0.3)'
                        : focusedToken !== null && attentionToMe > 0.1
                        ? `0 0 ${attentionToMe * 30}px rgba(239, 68, 68, ${attentionToMe})`
                        : 'none'
                    }}
                  >
                    {token.text}
                    {focusedToken !== null && attentionToMe > 0.05 && !isSource && (
                      <span className="absolute -top-2 -right-2 bg-red-900 text-red-300 text-[8px] px-1 rounded">
                        {(attentionToMe * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-gray-600">
            {lockedToken !== null ? 'CLICK TO UNLOCK' : 'HOVER/CLICK TO FOCUS'}
          </div>
        </div>

        {/* Side Panel */}
        <div className="border border-gray-800 bg-gray-900/20 p-4 flex flex-col">
          {showHeatmap ? (
            /* Heatmap View */
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Grid3X3 className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-mono font-bold tracking-widest">ATTENTION MATRIX</span>
              </div>
              <div className="overflow-auto">
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `40px repeat(${tokens.length}, 1fr)`,
                  }}
                >
                  {/* Header row */}
                  <div></div>
                  {tokens.map((t, i) => (
                    <div key={i} className="text-[7px] font-mono text-gray-500 truncate text-center p-1">
                      {t.slice(0, 4)}
                    </div>
                  ))}

                  {/* Data rows */}
                  {tokens.map((rowToken, i) => (
                    <React.Fragment key={i}>
                      <div className="text-[7px] font-mono text-gray-500 truncate p-1 flex items-center">
                        {rowToken.slice(0, 4)}
                      </div>
                      {tokens.map((_, j) => {
                        const w = attentionWeights.find(a => a.from === i && a.to === j)?.weight ?? 0;
                        return (
                          <div
                            key={j}
                            className="aspect-square"
                            style={{
                              backgroundColor: `rgba(239, 68, 68, ${w})`,
                            }}
                            title={`${rowToken} → ${tokens[j]}: ${(w * 100).toFixed(1)}%`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-[9px] font-mono text-gray-600">
                ROW = FROM (QUERY) | COL = TO (KEY)
              </div>
            </div>
          ) : (
            /* Info Panel */
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-mono font-bold tracking-widest">
                    {focusedToken !== null ? `"${tokens[focusedToken]}" ATTENDING TO:` : 'SELECT A WORD'}
                  </span>
                </div>

                {focusedToken !== null ? (
                  <div className="space-y-1">
                    {getAttentionFrom(focusedToken)
                      .sort((a, b) => b.weight - a.weight)
                      .slice(0, 8)
                      .map((w, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex-1 h-4 bg-gray-800 relative overflow-hidden">
                            <div
                              className="h-full bg-red-500/70 transition-all"
                              style={{ width: `${w.weight * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 w-20 truncate">
                            {tokens[w.to]}
                          </span>
                          <span className="text-[10px] font-mono text-red-400 w-10 text-right">
                            {(w.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Click or hover over a word to see what it attends to.
                  </p>
                )}
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="text-[10px] font-mono text-gray-500 mb-2">ACTIVE HEAD</div>
                <div className="text-lg font-display font-bold text-white mb-1">
                  {HEAD_NAMES[activeHead].name}
                </div>
                <p className="text-sm text-gray-400">
                  {activeHead === 0 && 'Focuses on nearby words. Local context and immediate neighbors.'}
                  {activeHead === 1 && 'Resolves pronouns. Connects "it", "they", "he/she" to their referents.'}
                  {activeHead === 2 && 'Finds subject-verb relationships. Who does what.'}
                  {activeHead === 3 && 'Semantic associations. Words that belong together conceptually.'}
                </p>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="text-[10px] font-mono text-gray-500 mb-2">HOW IT WORKS</div>
                <div className="text-[11px] text-gray-400 space-y-2">
                  <p><span className="text-purple-400">QUERY:</span> What am I looking for?</p>
                  <p><span className="text-green-400">KEY:</span> What do I offer?</p>
                  <p><span className="text-red-400">VALUE:</span> What information do I contain?</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono text-gray-500 border-t border-gray-900 pt-6">
        <div>ARCHITECTURE: TRANSFORMER_2017</div>
        <div>USED_BY: GPT, CLAUDE, BERT, DALL-E</div>
        <div className="hidden md:block">HEADS: 4 (SIMULATED)</div>
        <div className="hidden md:block text-right">PAPER: ATTENTION_IS_ALL_YOU_NEED</div>
      </div>
    </div>
  );
};

export default TransformerAttentionDemo;
