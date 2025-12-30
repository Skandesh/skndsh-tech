import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Palette, Plane, Sparkles } from 'lucide-react';

interface Profile {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  path: string;
  icon: React.ReactNode;
  bgImage?: string; // Optional for future texture
}

const ProfileSelector = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);

  const profiles: Profile[] = [
    {
      id: 'tech',
      title: 'TECH',
      subtitle: 'SYSTEMS // LOGIC',
      color: '#050505', // Void Black
      path: '/tech',
      icon: <Code2 />,
      bgImage: '/images/tech-bg.png'
    },
    {
      id: 'creative',
      title: 'CREATIVE',
      subtitle: 'ABSTRACT // FORM',
      color: '#3f0d16', // Deep Crimson
      path: '/creative',
      icon: <Palette />,
      bgImage: '/images/creative-bg.png'
    },
    {
      id: 'travel',
      title: 'TRAVEL',
      subtitle: 'WORLD // VIEW',
      color: '#0c2e42', // Deep Ocean
      path: '/travel',
      icon: <Plane />,
      bgImage: '/images/travel-bg.png'
    },
    {
      id: 'spirituality',
      title: 'SPIRITUALITY',
      subtitle: 'INNER // PEACE',
      color: '#4338ca', // Indigo
      path: '/spirituality',
      icon: <Sparkles />,
      bgImage: '/images/spirituality-bg.png'
    }
  ];

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-black overflow-hidden font-sans">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          onMouseEnter={() => setActiveId(profile.id)}
          onMouseLeave={() => setActiveId(null)}
          onClick={() => navigate(profile.path)}
          className={`
            relative flex-1 cursor-pointer
            transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
            border-b md:border-b-0 md:border-r border-white/5
            group overflow-hidden
            ${activeId === profile.id ? 'md:flex-[2] opacity-100' : 'opacity-80 hover:opacity-100'}
            ${activeId && activeId !== profile.id ? 'opacity-40 filter grayscale-[50%]' : ''}
          `}
          style={{ backgroundColor: profile.color }}
        >
          {/* Background Texture/Gradient Overlay - REPLACED WITH IMAGE */}
          
          {/* Background Image (Hover Only) */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out z-0 ${activeId === profile.id ? 'opacity-50' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${profile.bgImage})` }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 pointer-events-none z-10" />
          
          {/* Content Container */}
          <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 z-20">
            
            {/* Top Indicator */}
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
                 0{profiles.indexOf(profile) + 1}
               </span>
               <div className={`
                 text-white/80 transition-transform duration-500 
                 ${activeId === profile.id ? 'scale-110 rotate-0' : 'scale-75 -rotate-12 opacity-50'}
               `}>
                 {React.cloneElement(profile.icon as React.ReactElement, { size: activeId === profile.id ? 40 : 24, strokeWidth: 1 })}
               </div>
            </div>

            {/* Main Title Area */}
            <div className={`
               flex flex-col gap-2 transition-transform duration-500
               ${activeId === profile.id ? 'translate-y-0' : 'translate-y-4'}
            `}>
              <h2 className={`
                font-display font-medium text-white tracking-tighter leading-none transition-all duration-300
                ${profile.title.length > 10 ? 'text-2xl md:text-4xl lg:text-5xl break-all md:break-normal' : 
                  profile.title.length > 8 ? 'text-3xl md:text-5xl lg:text-6xl' : 
                  'text-4xl md:text-6xl lg:text-7xl'}
              `}>
                {profile.title}
              </h2>
              <div className={`
                flex items-center gap-4 overflow-hidden transition-all duration-500
                ${activeId === profile.id ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}
              `}>
                 <p className="text-xs font-mono text-white/60 tracking-widest uppercase">
                   {profile.subtitle}
                 </p>
                 <ArrowRight className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileSelector;
