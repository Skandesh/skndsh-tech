import React from 'react';
import { Map, Compass, Globe, Anchor, Camera, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TravelHome = () => {
    const navigate = useNavigate();

    const trips = [
        { id: 1, location: 'Kyoto, Japan', coordinates: '35.0116° N, 135.7681° E', date: 'OCT 2024', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop' },
        { id: 2, location: 'Reykjavík, Iceland', coordinates: '64.1265° N, 21.8174° W', date: 'JUL 2024', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2159&auto=format&fit=crop' },
        { id: 3, location: 'Swiss Alps', coordinates: '46.8182° N, 8.2275° E', date: 'MAR 2024', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop' },
    ];

  return (
    <div className="min-h-screen bg-[#041a2f] text-white font-sans selection:bg-[#4facfe] selection:text-black pb-32">
        {/* Navigation */}
        <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#4facfe]">
                <Compass className="w-4 h-4" />
                <span>EXPEDITION_LOG // SKANDESH</span>
            </div>
             <button onClick={() => navigate('/')} className="text-xs font-mono tracking-widest hover:text-[#4facfe] transition-colors bg-[#041a2f]/80 backdrop-blur px-4 py-2 border border-[#4facfe]/30 rounded-full">
                RETURN TO BASE
            </button>
        </nav>

        {/* Hero Section */}
        <div className="min-h-screen flex flex-col justify-end pb-24 px-6 md:px-24 relative overflow-hidden">
             
             {/* Background Gradient & Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#041a2f] via-[#041a2f]/50 to-transparent z-10"></div>
             {/* Image Background */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center opacity-60 scale-105 animate-slow-zoom"></div>
             
             {/* Grid Overlay */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay"></div>

             <div className="relative z-20 max-w-4xl space-y-6">
                 <div className="flex items-center gap-4 text-[#4facfe] text-xs font-mono tracking-widest mb-4">
                     <span className="w-2 h-2 bg-[#4facfe] rounded-full animate-pulse"></span>
                     <span>LIVE FEED: GLOBAL</span>
                 </div>
                 <h1 className="text-6xl md:text-9xl font-bold tracking-tight leading-none mix-blend-overlay opacity-80">
                     THE WORLD<br/>
                     IS WAITING.
                 </h1>
                 <p className="font-mono text-sm text-blue-200/60 max-w-md leading-relaxed">
                     Exploring the intersection of culture, geography, and experience. Documenting the planet one coordinate at a time.
                 </p>
             </div>
        </div>

        {/* Stats Section */}
        <section className="py-24 border-b border-white/10 bg-[#06213a]">
            <div className="px-6 md:px-24 grid grid-cols-2 md:grid-cols-4 gap-12">
                <div className="space-y-2">
                    <span className="text-3xl md:text-5xl font-bold text-[#4facfe]">12</span>
                    <p className="text-xs font-mono uppercase tracking-widest opacity-60">Countries</p>
                </div>
                <div className="space-y-2">
                    <span className="text-3xl md:text-5xl font-bold text-[#4facfe]">48</span>
                    <p className="text-xs font-mono uppercase tracking-widest opacity-60">Cities</p>
                </div>
                <div className="space-y-2">
                    <span className="text-3xl md:text-5xl font-bold text-[#4facfe]">21k</span>
                    <p className="text-xs font-mono uppercase tracking-widest opacity-60">Miles Flown</p>
                </div>
                 <div className="space-y-2">
                    <span className="text-3xl md:text-5xl font-bold text-[#4facfe]">∞</span>
                    <p className="text-xs font-mono uppercase tracking-widest opacity-60">Memories</p>
                </div>
            </div>
        </section>

        {/* Journal / Grid Section */}
        <section className="py-32 px-6 md:px-24">
            <div className="flex justify-between items-end mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Recent Deployments</h2>
                 <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#4facfe] border-b border-[#4facfe] pb-1 cursor-pointer hover:opacity-80">
                     VIEW ARCHIVE <ArrowRight className="w-4 h-4" />
                 </div>
            </div>

            <div className="space-y-24">
                {trips.map((trip, index) => (
                    <div key={trip.id} className={`flex flex-col md:flex-row gap-12 items-center group ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                        <div className="w-full md:w-3/5 aspect-video bg-gray-900 relative overflow-hidden rounded-sm transition-transform duration-700 group-hover:scale-[1.02]">
                            <img src={trip.image} alt={trip.location} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                            {/* HUD Overlays */}
                            <div className="absolute top-4 left-4 border border-white/20 bg-black/50 backdrop-blur px-2 py-1 text-[10px] font-mono rounded">
                                CAM_0{index + 1}
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#4facfe] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                        </div>

                        <div className="w-full md:w-2/5 space-y-6">
                            <div className="flex items-center gap-3 text-[#4facfe]">
                                <Globe className="w-4 h-4" />
                                <span className="text-xs font-mono tracking-widest">{trip.coordinates}</span>
                            </div>
                            <h3 className="text-4xl md:text-6xl font-bold uppercase leading-none text-transparent stroke-text-white group-hover:text-white transition-colors duration-500 cursor-default">
                                {trip.location.split(',')[0]}
                            </h3>
                            <div className="w-12 h-1 bg-[#4facfe]/30 group-hover:bg-[#4facfe] transition-colors"></div>
                            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                                A journey into the heart of {trip.location}. Capturing the essence of the landscape and the rhythm of life in this unique coordinate.
                            </p>
                            <span className="inline-block text-xs font-mono border border-white/20 px-3 py-1 text-gray-400 rounded-full">{trip.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Footer */}
        <section className="py-24 text-center border-t border-[#4facfe]/20 bg-[#020d17]">
             <Anchor className="w-8 h-8 mx-auto text-[#4facfe] mb-8 animate-bounce" />
             <h4 className="text-xl font-bold tracking-tight mb-2">Where to next?</h4>
             <p className="text-xs font-mono text-[#4facfe] opacity-60 uppercase tracking-widest">
                 Planning pending...
             </p>
        </section>
    </div>
  );
};

export default TravelHome;
