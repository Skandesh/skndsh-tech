import React from 'react';

interface AlgorithmVisualsProps {
  step: number;
}

const AlgorithmVisuals: React.FC<AlgorithmVisualsProps> = ({ step }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gray-900/50 overflow-hidden border border-gray-800">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}
      ></div>

      {/* STEP 1: DISCOVERY - Particles converging to form a core */}
      {step === 0 && (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Central Core forming */}
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse z-10"></div>
            
            {/* Orbiting Particles */}
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <div className="absolute inset-0 animate-[spin_7s_linear_infinite_reverse] opacity-70">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 bg-gray-500 rounded-full"></div>
            </div>
            
            {/* Converging Rings */}
            <div className="absolute inset-0 border border-white/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-12 border border-white/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1.5s]"></div>
            
            <div className="absolute bottom-4 left-4 text-[9px] font-mono text-gray-500">FIG. 1: DISCOVERY // CONVERGENCE</div>
        </div>
      )}

      {/* STEP 2: ABSTRACTION - Analysis/Scanning/Unstable State */}
      {step === 1 && (
        <div className="relative w-48 h-48 flex items-center justify-center">
             {/* Core being analyzed */}
            <div className="w-16 h-16 border border-white/50 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-[1px] bg-green-500/50 absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_10px_#22c55e]"></div>
                <div className="w-8 h-8 bg-white/10 rounded-full backdrop-blur-sm"></div>
            </div>

            {/* Brackets / Targeting */}
            <div className="absolute w-24 h-24 border-t border-l border-white/30 -top-2 -left-2"></div>
            <div className="absolute w-24 h-24 border-b border-r border-white/30 -bottom-2 -right-2"></div>

            {/* Data Streams */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                <div className="w-8 h-[1px] bg-gray-700 animate-pulse"></div>
                <div className="w-12 h-[1px] bg-gray-600 animate-pulse delay-75"></div>
                <div className="w-6 h-[1px] bg-gray-700 animate-pulse delay-150"></div>
            </div>

            <div className="absolute bottom-4 left-4 text-[9px] font-mono text-gray-500">FIG. 2: ABSTRACTION // ANALYSIS</div>
            
            <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
      )}

      {/* STEP 3: SYNTHESIS - Stable Compound / Molecule */}
      {step === 2 && (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Molecular Structure */}
            <div className="relative animate-[spin_20s_linear_infinite]">
                {/* Center Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_30px_white] z-20"></div>
                
                {/* Connections */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-white/30 rotate-0"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-white/30 rotate-60"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-white/30 rotate-120"></div>

                {/* Satellite Nodes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[28px] w-3 h-3 bg-gray-300 rounded-full border border-gray-900 z-10"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[28px] w-3 h-3 bg-gray-300 rounded-full border border-gray-900 z-10"></div>
                
                <div className="absolute top-1/2 right-0 translate-x-[24px] -translate-y-1/2 w-3 h-3 bg-gray-300 rounded-full border border-gray-900 z-10"></div>
                <div className="absolute top-1/2 left-0 -translate-x-[24px] -translate-y-1/2 w-3 h-3 bg-gray-300 rounded-full border border-gray-900 z-10"></div>
            </div>

            {/* Stable Field */}
            <div className="absolute inset-0 border border-white/5 rounded-full animate-pulse"></div>

            <div className="absolute bottom-4 left-4 text-[9px] font-mono text-gray-500">FIG. 3: SYNTHESIS // COMPOUND</div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmVisuals;
