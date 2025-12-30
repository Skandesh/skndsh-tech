import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface NoiseFieldCanvasProps {
  onBack?: () => void;
}

const NoiseFieldCanvas: React.FC<NoiseFieldCanvasProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showVectors, setShowVectors] = useState(false);
  const [noiseScale, setNoiseScale] = useState(50);
  const [speed, setSpeed] = useState(50);
  const timeRef = useRef(0);

  // Simple 2D noise implementation
  const permutation = useRef<number[]>([]);

  useEffect(() => {
    // Initialize permutation table
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    permutation.current = [...p, ...p];
  }, []);

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);

  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  const noise2D = (x: number, y: number) => {
    const p = permutation.current;
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const gridSize = 20;
    const scale = noiseScale / 1000;
    const speedFactor = speed / 5000;

    const animate = () => {
      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      timeRef.current += speedFactor;
      const t = timeRef.current;

      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      // Draw the noise field
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * gridSize;
          const py = y * gridSize;

          // Multi-octave noise for richer pattern
          const n1 = noise2D(x * scale + t, y * scale + t * 0.7);
          const n2 = noise2D(x * scale * 2 + t * 0.5, y * scale * 2) * 0.5;
          const n3 = noise2D(x * scale * 4, y * scale * 4 + t * 0.3) * 0.25;
          const noise = (n1 + n2 + n3) / 1.75;

          const angle = noise * Math.PI * 2;

          // Color based on angle
          const hue = (noise * 0.5 + 0.5) * 60 + 280; // Purple to magenta range
          const brightness = 30 + (noise * 0.5 + 0.5) * 40;

          if (showVectors) {
            // Draw vector arrows
            const len = gridSize * 0.4;
            const endX = px + Math.cos(angle) * len;
            const endY = py + Math.sin(angle) * len;

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `hsla(${hue}, 70%, ${brightness}%, 0.6)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Arrow head
            const headLen = 4;
            const headAngle = Math.PI / 6;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - headLen * Math.cos(angle - headAngle),
              endY - headLen * Math.sin(angle - headAngle)
            );
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - headLen * Math.cos(angle + headAngle),
              endY - headLen * Math.sin(angle + headAngle)
            );
            ctx.stroke();
          } else {
            // Draw flowing lines
            ctx.beginPath();

            let lx = px;
            let ly = py;
            ctx.moveTo(lx, ly);

            // Trace a short path following the field
            for (let step = 0; step < 8; step++) {
              const nx = lx / gridSize;
              const ny = ly / gridSize;
              const n = noise2D(nx * scale + t, ny * scale + t * 0.7);
              const a = n * Math.PI * 2;

              lx += Math.cos(a) * 3;
              ly += Math.sin(a) * 3;
              ctx.lineTo(lx, ly);
            }

            const alpha = 0.3 + (noise * 0.5 + 0.5) * 0.4;
            ctx.strokeStyle = `hsla(${hue}, 70%, ${brightness}%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Add some glow points at high-magnitude areas
      for (let y = 0; y < rows; y += 3) {
        for (let x = 0; x < cols; x += 3) {
          const n = noise2D(x * scale + t, y * scale + t * 0.7);
          if (Math.abs(n) > 0.6) {
            const px = x * gridSize;
            const py = y * gridSize;
            const hue = (n * 0.5 + 0.5) * 60 + 280;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.8)`;
            ctx.fill();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, showVectors, noiseScale, speed]);

  const handleReset = () => {
    timeRef.current = 0;
    // Re-initialize permutation for new pattern
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    permutation.current = [...p, ...p];
  };

  return (
    <div className="relative w-full h-full bg-[#050505]">
      {/* Controls */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </button>
        )}
      </div>

      <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
        <button
          onClick={() => setShowVectors(!showVectors)}
          className={`px-3 py-2 text-xs font-mono uppercase tracking-widest border transition-colors ${
            showVectors
              ? 'border-purple-500 text-purple-400'
              : 'border-white/20 text-white/60 hover:border-white/50'
          }`}
        >
          VECTORS
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 border border-white/20 hover:border-white/50 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={handleReset}
          className="p-2 border border-white/20 hover:border-white/50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Sliders */}
      <div className="absolute bottom-6 left-6 z-10 space-y-3 bg-black/50 p-4 border border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/40 w-16">SCALE</span>
          <input
            type="range"
            min="10"
            max="100"
            value={noiseScale}
            onChange={(e) => setNoiseScale(Number(e.target.value))}
            className="w-24 accent-purple-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/40 w-16">SPEED</span>
          <input
            type="range"
            min="10"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 accent-purple-500"
          />
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-6 right-6 z-10 text-right">
        <div className="font-mono text-[10px] text-purple-500/60 uppercase tracking-widest">GENERATIVE</div>
        <div className="font-black text-lg tracking-tight">NOISE_FIELD</div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default NoiseFieldCanvas;
