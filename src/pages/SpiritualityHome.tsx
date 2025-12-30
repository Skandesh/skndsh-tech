import React from 'react';
import { Circle, Sun, Moon, Wind, Heart, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { spiritualManifest } from '../generated/spiritual-manifest';

const SpiritualityHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-[#e8dcc4] font-serif selection:bg-[#8d4004] selection:text-white pb-32">
        {/* Navigation / Header */}
        <nav className="fixed top-0 w-full p-6 md:p-12 flex justify-between items-center z-50 mix-blend-difference">
            <span className="text-[10px] md:text-xs font-sans tracking-[0.3em] opacity-80 uppercase">Skandesh // Spirit</span>
            <button onClick={() => navigate('/')} className="text-[10px] md:text-xs font-sans tracking-widest hover:text-[#cd7f32] transition-colors uppercase">
                Return
            </button>
        </nav>

        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
             
             {/* Abstract Background Elements */}
             <div className="absolute inset-0 pointer-events-none opacity-20">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[#8d4004] blur-[100px] md:blur-[150px] animate-pulse"></div>
             </div>

             <div className="z-10 text-center space-y-8 animate-fade-in-up">
                 <div className="flex justify-center mb-8">
                     <Circle className="w-4 h-4 md:w-6 md:h-6 text-[#cd7f32] opacity-80" strokeWidth={1} />
                 </div>
                 <h1 className="text-6xl md:text-9xl font-light tracking-wide text-[#cd7f32] mix-blend-screen">
                     Seek Within
                 </h1>
                 <p className="font-sans text-xs md:text-sm tracking-[0.25em] opacity-60 uppercase max-w-md mx-auto leading-relaxed">
                     The silence behind the code.
                 </p>
             </div>

             {/* Scroll Indicator */}
             <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-40">
                <div className="w-px h-12 bg-[#e8dcc4]"></div>
                <span className="text-[10px] uppercase tracking-widest font-sans">Discover</span>
             </div>
        </div>

        {/* Philosophy Section */}
        <section className="max-w-4xl mx-auto px-6 py-24 md:py-40 space-y-16">
            <div className="text-center space-y-6">
                <span className="text-[#cd7f32] font-sans text-[10px] tracking-[0.3em] uppercase">The Philosophy</span>
                <h2 className="text-3xl md:text-5xl font-light leading-tight">
                    "Digital creation is not just logic.<br/>
                    It is <span className="text-[#cd7f32] italic">modern alchemy</span>."
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm md:text-base leading-relaxed opacity-80 font-sans font-light">
                <p>
                    In a world of constant noise and infinite notifications, I find clarity in the silence. Coding, for me, is more than syntax; it is a form of deep focus—a dhyana. It is the process of bringing order to chaos, of manifesting thought into reality.
                </p>
                <p>
                    My approach to technology is rooted in awareness. A conscious developer builds not just efficiently, but responsibly. Technology should be a tool for liberation, not entanglement. This page is a glimpse into the stillness that powers the movement.
                </p>
            </div>
        </section>

        {/* Practices Grid */}
        <section className="px-6 md:px-12 py-24 bg-[#140b08]">
            <div className="max-w-6xl mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#8d4004]/20 border border-[#8d4004]/20">
                     {/* Card 1 */}
                     <div className="bg-[#1a0f0a] p-12 flex flex-col items-center text-center space-y-6 group hover:bg-[#251610] transition-colors duration-700">
                         <Sun className="w-8 h-8 text-[#cd7f32] opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
                         <h3 className="text-xl font-light tracking-wider">Kriya</h3>
                         <p className="text-xs font-sans uppercase tracking-widest opacity-50">Energy Alignment</p>
                         <p className="text-sm opacity-60 leading-relaxed max-w-xs">
                             Harnessing internal energy to fuel external creation. The body as the first instrument of technology.
                         </p>
                     </div>
                     {/* Card 2 */}
                     <div className="bg-[#1a0f0a] p-12 flex flex-col items-center text-center space-y-6 group hover:bg-[#251610] transition-colors duration-700">
                         <Wind className="w-8 h-8 text-[#cd7f32] opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
                         <h3 className="text-xl font-light tracking-wider">Prana</h3>
                         <p className="text-xs font-sans uppercase tracking-widest opacity-50">Breath</p>
                         <p className="text-sm opacity-60 leading-relaxed max-w-xs">
                             The subtle link between the physical and the mental. Controlling the rhythm to master the mind.
                         </p>
                     </div>
                     {/* Card 3 */}
                     <div className="bg-[#1a0f0a] p-12 flex flex-col items-center text-center space-y-6 group hover:bg-[#251610] transition-colors duration-700">
                         <Moon className="w-8 h-8 text-[#cd7f32] opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
                         <h3 className="text-xl font-light tracking-wider">Dhyana</h3>
                         <p className="text-xs font-sans uppercase tracking-widest opacity-50">Meditation</p>
                         <p className="text-sm opacity-60 leading-relaxed max-w-xs">
                             The quality of non-doing. Cultivating a dimension beyond the intellect to access pure clarity.
                         </p>
                     </div>
                 </div>
            </div>
        </section>

        {/* Writings Section */}
        <section className="max-w-4xl mx-auto px-6 py-24 md:py-32">
            <div className="text-center space-y-4 mb-16">
                <span className="text-[#cd7f32] font-sans text-[10px] tracking-[0.3em] uppercase">Writings</span>
                <h2 className="text-3xl md:text-4xl font-light">Words from the stillness</h2>
            </div>

            <div className="space-y-0 border-t border-[#cd7f32]/10">
                {spiritualManifest.map((post) => (
                    <button
                        key={post.slug}
                        onClick={() => navigate(`/spirituality/${post.slug}`)}
                        className="w-full text-left py-8 border-b border-[#cd7f32]/10 group hover:bg-[#251610]/30 transition-colors px-4 -mx-4"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-sans uppercase tracking-widest text-[#cd7f32]/60">
                                        {post.category}
                                    </span>
                                    <span className="text-[9px] font-sans uppercase tracking-widest opacity-30">
                                        {post.date}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-light group-hover:text-[#cd7f32] transition-colors">
                                    {post.title}
                                </h3>
                                {post.subtitle && (
                                    <p className="text-sm opacity-50 font-sans font-light">
                                        {post.subtitle}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime}
                                </div>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>

        {/* Quote Section */}
        <section className="max-w-4xl mx-auto px-6 py-40 text-center space-y-12">
            <Heart className="w-6 h-6 mx-auto text-[#cd7f32] animate-pulse" fill="#cd7f32" strokeWidth={0} />
            <p className="text-2xl md:text-4xl font-light italic leading-relaxed text-[#e8dcc4]/90">
                &quot;When you are in tune with the source of creation,<br/> there is no stress, only flow.&quot;
            </p>
            <div className="w-24 h-px bg-[#cd7f32] mx-auto opacity-40"></div>
        </section>
    </div>
  );
};

export default SpiritualityHome;
