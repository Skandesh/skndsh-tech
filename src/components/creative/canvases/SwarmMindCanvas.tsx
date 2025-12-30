import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface SwarmMindCanvasProps {
  onBack?: () => void;
}

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
}

const SwarmMindCanvas: React.FC<SwarmMindCanvasProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const boidsRef = useRef<Boid[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const [isPlaying, setIsPlaying] = useState(true);
  const [separation, setSeparation] = useState(25);
  const [alignment, setAlignment] = useState(50);
  const [cohesion, setCohesion] = useState(50);

  const createBoid = (width: number, height: number): Boid => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    hue: 200 + Math.random() * 60, // Blue to cyan range
  });

  const limit = (vx: number, vy: number, max: number): [number, number] => {
    const mag = Math.sqrt(vx * vx + vy * vy);
    if (mag > max) {
      return [(vx / mag) * max, (vy / mag) * max];
    }
    return [vx, vy];
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

    // Initialize boids
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const numBoids = 150;

    boidsRef.current = [];
    for (let i = 0; i < numBoids; i++) {
      boidsRef.current.push(createBoid(width, height));
    }

    const maxSpeed = 4;
    const maxForce = 0.1;
    const perceptionRadius = 100;

    const animate = () => {
      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear with fade
      ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const sepWeight = separation / 100;
      const aliWeight = alignment / 100;
      const cohWeight = cohesion / 100;

      boidsRef.current.forEach((boid, i) => {
        let sepX = 0, sepY = 0, sepCount = 0;
        let aliX = 0, aliY = 0, aliCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;

        // Calculate flocking forces
        boidsRef.current.forEach((other, j) => {
          if (i === j) return;

          const dx = other.x - boid.x;
          const dy = other.y - boid.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < perceptionRadius) {
            // Separation - steer away from nearby boids
            if (dist < 30 && dist > 0) {
              sepX -= dx / dist;
              sepY -= dy / dist;
              sepCount++;
            }

            // Alignment - match velocity with nearby boids
            aliX += other.vx;
            aliY += other.vy;
            aliCount++;

            // Cohesion - steer toward center of nearby boids
            cohX += other.x;
            cohY += other.y;
            cohCount++;
          }
        });

        // Apply separation
        if (sepCount > 0) {
          sepX /= sepCount;
          sepY /= sepCount;
          const sepMag = Math.sqrt(sepX * sepX + sepY * sepY);
          if (sepMag > 0) {
            sepX = (sepX / sepMag) * maxSpeed - boid.vx;
            sepY = (sepY / sepMag) * maxSpeed - boid.vy;
            [sepX, sepY] = limit(sepX, sepY, maxForce);
          }
        }

        // Apply alignment
        if (aliCount > 0) {
          aliX /= aliCount;
          aliY /= aliCount;
          const aliMag = Math.sqrt(aliX * aliX + aliY * aliY);
          if (aliMag > 0) {
            aliX = (aliX / aliMag) * maxSpeed - boid.vx;
            aliY = (aliY / aliMag) * maxSpeed - boid.vy;
            [aliX, aliY] = limit(aliX, aliY, maxForce);
          }
        }

        // Apply cohesion
        if (cohCount > 0) {
          cohX = cohX / cohCount - boid.x;
          cohY = cohY / cohCount - boid.y;
          const cohMag = Math.sqrt(cohX * cohX + cohY * cohY);
          if (cohMag > 0) {
            cohX = (cohX / cohMag) * maxSpeed - boid.vx;
            cohY = (cohY / cohMag) * maxSpeed - boid.vy;
            [cohX, cohY] = limit(cohX, cohY, maxForce);
          }
        }

        // Mouse avoidance
        if (mouseRef.current.active) {
          const dx = boid.x - mouseRef.current.x;
          const dy = boid.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150 && dist > 0) {
            const force = (1 - dist / 150) * 0.5;
            boid.vx += (dx / dist) * force;
            boid.vy += (dy / dist) * force;
          }
        }

        // Apply forces
        boid.vx += sepX * sepWeight * 2 + aliX * aliWeight + cohX * cohWeight;
        boid.vy += sepY * sepWeight * 2 + aliY * aliWeight + cohY * cohWeight;

        // Limit speed
        [boid.vx, boid.vy] = limit(boid.vx, boid.vy, maxSpeed);

        // Update position
        boid.x += boid.vx;
        boid.y += boid.vy;

        // Wrap around edges
        if (boid.x < 0) boid.x = width;
        if (boid.x > width) boid.x = 0;
        if (boid.y < 0) boid.y = height;
        if (boid.y > height) boid.y = 0;

        // Draw boid as triangle pointing in direction of movement
        const angle = Math.atan2(boid.vy, boid.vx);
        const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
        const size = 6 + speed;

        ctx.save();
        ctx.translate(boid.x, boid.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.5, -size * 0.4);
        ctx.lineTo(-size * 0.5, size * 0.4);
        ctx.closePath();

        ctx.fillStyle = `hsla(${boid.hue}, 70%, 60%, 0.8)`;
        ctx.fill();

        // Trail
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, 0);
        ctx.lineTo(-size * 2, 0);
        ctx.strokeStyle = `hsla(${boid.hue}, 70%, 60%, 0.3)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, separation, alignment, cohesion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      boidsRef.current = [];
      for (let i = 0; i < 150; i++) {
        boidsRef.current.push(createBoid(rect.width, rect.height));
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

      {/* Sliders */}
      <div className="absolute bottom-6 left-6 z-10 space-y-3 bg-black/50 p-4 border border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/40 w-24">SEPARATION</span>
          <input
            type="range"
            min="0"
            max="100"
            value={separation}
            onChange={(e) => setSeparation(Number(e.target.value))}
            className="w-24 accent-cyan-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/40 w-24">ALIGNMENT</span>
          <input
            type="range"
            min="0"
            max="100"
            value={alignment}
            onChange={(e) => setAlignment(Number(e.target.value))}
            className="w-24 accent-cyan-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/40 w-24">COHESION</span>
          <input
            type="range"
            min="0"
            max="100"
            value={cohesion}
            onChange={(e) => setCohesion(Number(e.target.value))}
            className="w-24 accent-cyan-500"
          />
        </div>
        <div className="font-mono text-[9px] text-white/30 mt-2">
          CURSOR REPELS SWARM
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-6 right-6 z-10 text-right">
        <div className="font-mono text-[10px] text-cyan-500/60 uppercase tracking-widest">GENERATIVE</div>
        <div className="font-black text-lg tracking-tight">SWARM_MIND</div>
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

export default SwarmMindCanvas;
