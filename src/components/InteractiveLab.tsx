import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { ArrowLeft, Zap, Share2, Hexagon, Radio, Target, Waves, Orbit, Magnet } from 'lucide-react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseX: number;
  baseY: number;
  color: string;
  angle: number; // For circular motions
  radius: number; // For circular motions
  speed: number;
};

type SimMode = 'CHAOS' | 'GRID' | 'ORBIT' | 'GALAXY' | 'WAVE';
type ForceType = 'REPEL' | 'ATTRACT';

const InteractiveLab = ({ onBack }: { onBack: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<SimMode>('CHAOS');
  const [forceType, setForceType] = useState<ForceType>('REPEL');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    
    // Particle System Configuration
    const particleCount = width < 768 ? 300 : 800;
    const particles: Particle[] = [];
    const mouse = { x: width/2, y: height/2, active: false };
    
    // Colors
    const colors = ['#333', '#555', '#888', '#22c55e', '#ffffff'];

    // Initialize Particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 0.5,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 200 + 50,
        speed: 0.02 + Math.random() * 0.05
      });
    }

    // Event Listeners
    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
        mouse.active = false;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Simulation Loop
    let animationId: number;
    
    const simParams = {
        speed: 1,
        friction: 0.95,
        returnForce: 0.08,
        repelRadius: 150,
        repelForce: 2
    };

    const update = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trail effect
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const time = Date.now() * 0.001;

      particles.forEach((p, i) => {
        // Mode Behaviors
        if (mode === 'CHAOS') {
            p.x += p.vx * simParams.speed;
            p.y += p.vy * simParams.speed;

            // Bounce
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        } 
        else if (mode === 'GRID') {
            const cols = Math.floor(Math.sqrt(particleCount * 1.5)); // Widen aspect
            const col = i % cols;
            const row = Math.floor(i / cols);
            const spacingX = width / cols;
            const spacingY = height / (particleCount/cols);
            
            const targetX = col * spacingX + spacingX/2;
            const targetY = row * spacingY + spacingY/2;

            p.x += (targetX - p.x) * simParams.returnForce;
            p.y += (targetY - p.y) * simParams.returnForce;
        }
        else if (mode === 'ORBIT') {
            p.angle += p.speed * 0.5;
            const targetX = centerX + Math.cos(p.angle) * p.radius;
            const targetY = centerY + Math.sin(p.angle) * p.radius * 0.5; // Flattened orbit
            
            p.x += (targetX - p.x) * 0.1;
            p.y += (targetY - p.y) * 0.1;
        }
        else if (mode === 'GALAXY') {
            // Spiral Galaxy logic
            const arms = 3;
            const armIndex = i % arms;
            const armOffset = (Math.PI * 2 * armIndex) / arms;
            
            const distFromCenter = (i / particleCount) * (Math.min(width, height) * 0.45);
            const spiralAngle = distFromCenter * 0.05 - time * 0.5; // Rotate entire galaxy
            
            const targetX = centerX + Math.cos(armOffset + spiralAngle) * distFromCenter;
            const targetY = centerY + Math.sin(armOffset + spiralAngle) * distFromCenter;

            // Add some noise/spread
            const jitter = 5;
            
            p.x += (targetX - p.x + (Math.random()-0.5)*jitter) * 0.05;
            p.y += (targetY - p.y + (Math.random()-0.5)*jitter) * 0.05;
        }
        else if (mode === 'WAVE') {
             const targetX = (i / particleCount) * width;
             // Complex wave layering
             const yOffset = Math.sin(targetX * 0.01 + time) * 100 
                           + Math.sin(targetX * 0.03 - time * 2) * 50;
             
             const targetY = centerY + yOffset;
             
             p.x += (targetX - p.x) * 0.1;
             p.y += (targetY - p.y) * 0.1;
        }

        // Mouse Interaction
        if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < simParams.repelRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (simParams.repelRadius - distance) / simParams.repelRadius;
                
                // Determine force direction based on setting
                const dirMultiplier = forceType === 'REPEL' ? -1 : 1;

                const dirX = forceDirectionX * force * simParams.repelForce * dirMultiplier;
                const dirY = forceDirectionY * force * simParams.repelForce * dirMultiplier;
                
                if (mode === 'CHAOS') {
                   p.vx += dirX * 0.5;
                   p.vy += dirY * 0.5;
                } else {
                   p.x += dirX * 5;
                   p.y += dirY * 5;
                }
            }
        }

        // Draw
        const pulse = 1 + Math.sin(time * 5 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (mode === 'GALAXY' ? pulse : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [mode, forceType]);

  const switchMode = (newMode: SimMode) => {
      setMode(newMode);
      anime({
          targets: '.mode-indicator',
          scale: [1.5, 1],
          duration: 400,
          easing: 'easeOutElastic'
      });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden flex flex-col z-50">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors group bg-black/50 px-3 py-2 border border-gray-800">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                TERMINATE
            </button>
        </div>
        <div className="text-right pointer-events-auto">
            <div className="flex items-center gap-2 justify-end mb-1">
               <div className={`w-2 h-2 rounded-full ${mode === 'CHAOS' ? 'bg-red-500' : 'bg-green-500'} animate-pulse mode-indicator`}></div>
               <h1 className="text-xl font-display font-bold tracking-widest uppercase">Swarm Intelligence</h1>
            </div>
            <span className="text-[9px] font-mono text-gray-500">PHYSICS_ENGINE_ACTIVE // {mode}</span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative border border-gray-800 bg-black/20 rounded-sm overflow-hidden">
         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-crosshair" />
         
         {/* Controls Overlay */}
         <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
            <button 
                onClick={() => switchMode('CHAOS')}
                className={`px-4 py-2 text-xs font-mono border transition-all flex items-center gap-2 ${mode === 'CHAOS' ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'}`}
            >
                <Zap className="w-3 h-3" /> ENTROPY
            </button>
            <button 
                onClick={() => switchMode('GRID')}
                className={`px-4 py-2 text-xs font-mono border transition-all flex items-center gap-2 ${mode === 'GRID' ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'}`}
            >
                <Hexagon className="w-3 h-3" /> LATTICE
            </button>
            <button 
                onClick={() => switchMode('ORBIT')}
                className={`px-4 py-2 text-xs font-mono border transition-all flex items-center gap-2 ${mode === 'ORBIT' ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'}`}
            >
                <Share2 className="w-3 h-3" /> ORBITAL
            </button>
            <button 
                onClick={() => switchMode('GALAXY')}
                className={`px-4 py-2 text-xs font-mono border transition-all flex items-center gap-2 ${mode === 'GALAXY' ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'}`}
            >
                <Orbit className="w-3 h-3" /> GALAXY
            </button>
            <button 
                onClick={() => switchMode('WAVE')}
                className={`px-4 py-2 text-xs font-mono border transition-all flex items-center gap-2 ${mode === 'WAVE' ? 'bg-white text-black border-white' : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'}`}
            >
                <Waves className="w-3 h-3" /> WAVEFORM
            </button>
            
            <div className="h-px bg-gray-800 my-1"></div>
            
            <button 
                onClick={() => setForceType(prev => prev === 'REPEL' ? 'ATTRACT' : 'REPEL')}
                className={`px-4 py-2 text-xs font-mono border transition-all flex items-center gap-2 ${forceType === 'ATTRACT' ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-red-900/50 text-red-400 border-red-800'}`}
            >
                <Magnet className="w-3 h-3" /> {forceType} FORCE
            </button>
         </div>

         {/* Info Overlay */}
         <div className="absolute bottom-4 right-4 text-[10px] font-mono text-gray-600 bg-black/80 p-2 border border-gray-900 pointer-events-none">
            INTERACTION_MODE: {forceType}<br/>
            RENDERER: CANVAS_2D<br/>
            FPS: 60
         </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono text-gray-500 border-t border-gray-900 pt-6">
         <div className="flex items-center gap-2">
             <Radio className="w-3 h-3" />
             <span>STATUS: ONLINE</span>
         </div>
         <div className="flex items-center gap-2">
             <Target className="w-3 h-3" />
             <span>NODES: {window.innerWidth < 768 ? 300 : 800}</span>
         </div>
         <div className="hidden md:block">
             LATENCY: 16ms
         </div>
         <div className="hidden md:block text-right">
             SESSION: {Math.random().toString(36).substring(7).toUpperCase()}
         </div>
      </div>

    </div>
  );
};

export default InteractiveLab;