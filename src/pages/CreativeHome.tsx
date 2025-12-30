import React, { useState } from 'react';
import { Eye, ArrowUpRight, Zap, Sparkles, Camera, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { creativeManifest } from '../generated/creative-manifest';
import type { WorkFilter, WorkType } from '../types/creative';

const FILTER_CONFIG: { value: WorkFilter; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'ALL', icon: Zap },
  { value: 'generative', label: 'GENERATIVE', icon: Sparkles },
  { value: 'photography', label: 'PHOTO', icon: Camera },
  { value: 'writing', label: 'WRITING', icon: FileText },
];

const CreativeHome = () => {
  const navigate = useNavigate();
  const [hoveredWork, setHoveredWork] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<WorkFilter>('all');

  const filteredWorks = activeFilter === 'all'
    ? creativeManifest
    : creativeManifest.filter(work => work.type === activeFilter);

  const handleWorkClick = (slug: string) => {
    navigate(`/creative/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0f0f0] font-sans selection:bg-[#3f0d16] selection:text-white pb-32 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50 mix-blend-difference">
        <span className="text-xl font-black tracking-tighter text-white">SKNDSH.ART</span>
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold hover:text-red-600 transition-colors uppercase tracking-widest border border-transparent hover:border-red-600 px-4 py-2"
        >
          Close Exhibition
        </button>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center px-6 md:px-24 pt-20 relative">
        <div className="relative z-10 w-full">
          <div className="text-[15vw] leading-[0.75] font-black tracking-tighter transition-colors duration-700 select-none cursor-default mix-blend-difference relative">
            <span className="block hover:text-[#3f0d16] transition-colors duration-300">CHAOS</span>
            <span className="block text-transparent stroke-text hover:text-white transition-colors duration-500 ml-[10vw]">FORM</span>
            <span className="block hover:text-red-700 transition-colors duration-300">VOID</span>
          </div>

          <div className="absolute top-1/2 right-0 md:right-24 -translate-y-1/2 flex flex-col items-end text-right gap-4 max-w-sm">
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest leading-relaxed">
              Explorations in the space between<br />
              mathematics and aesthetics.
            </p>
            <div className="w-12 h-1 bg-red-600"></div>
          </div>
        </div>

        {/* Background Texture */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-[#3f0d16]/30 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-12 left-6 md:left-24 animate-bounce">
          <ArrowUpRight className="w-6 h-6 rotate-180" />
        </div>
      </div>

      {/* Manifesto Section */}
      <section className="py-32 px-6 md:px-24 bg-white text-black relative">
        <div className="max-w-4xl">
          <button
            onClick={() => navigate('/creative/manifesto-001')}
            className="font-mono text-xs uppercase tracking-widest border border-black px-2 py-1 mb-8 inline-block hover:bg-black hover:text-white transition-colors"
          >
            Manifesto: 01 →
          </button>
          <h2 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight mb-12">
            Design is intelligence<br />
            <span className="text-red-600">made visible.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-mono text-sm leading-relaxed">
            <p>
              I believe that true creativity emerges from constraints. The screen is not a limit, but a canvas defined by pixels and logic. My work seeks to break the grid, to introduce organic unpredictability into rigid systems.
            </p>
            <p>
              This collection represents my experiments in form, color, and interactivity. It is a playground where code meets canvas, and where the functional becomes the fantastical.
            </p>
          </div>
        </div>
      </section>

      {/* Selected Works Grid */}
      <section className="py-32 px-6 md:px-12 bg-[#050505]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 px-4 md:px-12 gap-8">
          <h3 className="text-5xl md:text-8xl font-black text-[#1a1a1a] tracking-tighter uppercase select-none">
            Selected Works
          </h3>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_CONFIG.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-all ${
                  activeFilter === value
                    ? 'border-red-600 text-red-500 bg-red-950/20'
                    : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 md:px-12 mb-8">
          <span className="font-mono text-xs text-gray-600">
            SHOWING {filteredWorks.length} WORK{filteredWorks.length !== 1 ? 'S' : ''}
          </span>
        </div>

        {filteredWorks.length === 0 ? (
          <div className="px-4 md:px-12 py-24 text-center">
            <p className="font-mono text-sm text-gray-500">No works in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 px-4 md:px-12">
            {filteredWorks.map((work, index) => (
              <div
                key={work.slug}
                className={`group cursor-pointer ${index % 2 === 1 ? 'md:mt-32' : ''}`}
                onClick={() => handleWorkClick(work.slug)}
                onMouseEnter={() => setHoveredWork(work.slug)}
                onMouseLeave={() => setHoveredWork(null)}
              >
                <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#111]">
                  <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border ${
                      work.type === 'generative'
                        ? 'border-red-800 text-red-400 bg-red-950/50'
                        : work.type === 'photography'
                          ? 'border-blue-800 text-blue-400 bg-blue-950/50'
                          : 'border-gray-700 text-gray-400 bg-gray-900/50'
                    }`}>
                      {work.type}
                    </span>
                  </div>

                  {/* Interactive badge */}
                  {work.interactive && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-green-800 text-green-400 bg-green-950/50">
                        INTERACTIVE
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start border-t border-white/10 pt-4">
                  <div>
                    <h4 className="text-xl md:text-2xl font-bold tracking-tight mb-1 group-hover:text-red-500 transition-colors">
                      {work.title}
                    </h4>
                    <p className="font-mono text-xs text-gray-500 uppercase">{work.category}</p>
                  </div>
                  <span className="font-mono text-xs text-gray-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <section className="py-24 border-t border-white/10 text-center">
        <Zap className="w-8 h-8 mx-auto text-red-600 mb-8" />
        <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          End of Exhibition
        </p>
      </section>
    </div>
  );
};

export default CreativeHome;
