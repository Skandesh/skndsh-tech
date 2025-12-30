import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface FlowStateCanvasProps {
  onBack?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

const FlowStateCanvas: React.FC<FlowStateCanvasProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const [isPlaying, setIsPlaying] = useState(true);
  const [particleCount, setParticleCount] = useState(0);

  // Noise function for organic flow
  const noise = (x: number, y: number, t: number): number => {
    const scale = 0.003;
    return (
      Math.sin(x * scale + t * 0.5) * Math.cos(y * scale + t * 0.3) +
      Math.sin((x + y) * scale * 0.5 + t * 0.4) * 0.5 +
      Math.cos(x * scale * 2 - y * scale + t * 0.2) * 0.3
    );
  };

  const createParticle = (width: number, height: number): Particle => {
    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (edge) {
      case 0: x = Math.random() * width; y = 0; break;
      case 1: x = width; y = Math.random() * height; break;
      case 2: x = Math.random() * width; y = height; break;
      default: x = 0; y = Math.random() * height; break;
    }

    return {
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 200 + Math.random() * 300,
      hue: 0 + Math.random() * 30, // Red to orange range
    };
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

    // Initialize particles
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const maxParticles = 800;

    for (let i = 0; i < maxParticles; i++) {
      particlesRef.current.push(createParticle(width, height));
    }

    let time = 0;

    const animate = () => {
      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Fade trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      let activeCount = 0;

      particlesRef.current.forEach((p) => {
        // Calculate flow field angle
        const angle = noise(p.x, p.y, time) * Math.PI * 2;

        // Base velocity from flow field
        let fx = Math.cos(angle) * 1.5;
        let fy = Math.sin(angle) * 1.5;

        // Mouse attraction/repulsion
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            const force = (1 - dist / 200) * 3;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        }

        // Apply velocity with smoothing
        p.vx = p.vx * 0.95 + fx * 0.05;
        p.vy = p.vy * 0.95 + fy * 0.05;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Calculate opacity based on life
        const lifeRatio = p.life / p.maxLife;
        const opacity = lifeRatio < 0.1
          ? lifeRatio * 10
          : lifeRatio > 0.9
            ? (1 - lifeRatio) * 10
            : 1;

        // Draw particle
        if (opacity > 0) {
          activeCount++;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${opacity * 0.8})`;
          ctx.fill();

          // Draw subtle trail
          if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
            ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Reset particle if dead or out of bounds
        if (
          p.life > p.maxLife ||
          p.x < -50 || p.x > width + 50 ||
          p.y < -50 || p.y > height + 50
        ) {
          const newP = createParticle(width, height);
          p.x = newP.x;
          p.y = newP.y;
          p.vx = 0;
          p.vy = 0;
          p.life = 0;
          p.maxLife = newP.maxLife;
          p.hue = newP.hue;
        }
      });

      setParticleCount(activeCount);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  };

  const handleReset = () => {
    particlesRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      for (let i = 0; i < 800; i++) {
        particlesRef.current.push(createParticle(rect.width, rect.height));
      }
    }
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

      {/* Stats */}
      <div className="absolute bottom-6 left-6 z-10 font-mono text-[10px] text-white/40 space-y-1">
        <div>PARTICLES: {particleCount}</div>
        <div>MOVE CURSOR TO ATTRACT</div>
      </div>

      {/* Title */}
      <div className="absolute bottom-6 right-6 z-10 text-right">
        <div className="font-mono text-[10px] text-red-500/60 uppercase tracking-widest">GENERATIVE</div>
        <div className="font-black text-lg tracking-tight">FLOW_STATE</div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => (mouseRef.current.active = true)}
        onMouseLeave={() => (mouseRef.current.active = false)}
      />
    </div>
  );
};

export default FlowStateCanvas;
