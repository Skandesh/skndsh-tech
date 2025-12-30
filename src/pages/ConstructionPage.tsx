import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer } from 'lucide-react';

const ConstructionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        
        {/* Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <Hammer className="w-24 h-24 text-blue-400 relative z-10 mx-auto" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Work in Progress
          </h1>
          <p className="text-xl text-[#888888]">
            This personality is currently loading resources... check back soon!
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center justify-center gap-2 px-6 py-3 mx-auto mt-8 border border-[#333] hover:border-[#555] rounded-full transition-all duration-300 hover:bg-[#111]"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Profiles</span>
        </button>
      </div>
    </div>
  );
};

export default ConstructionPage;
