import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Background3D from '../components/Background3D';
import ChatInterface from '../components/ChatInterface';
import TextScramble from '../components/TextScramble';
import BlogSection from '../components/BlogSection';
import { Project } from '../types';
import { ExternalLink, Github, ArrowDown, Zap, LayoutGrid, FlaskConical, Fingerprint } from 'lucide-react';
import AlgorithmVisuals from '../components/AlgorithmVisuals';

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "AI-POWERED ARCHITECT",
    category: "AI / DEV TOOLS",
    year: "2024",
    description: "Production-ready VS Code extension converting Figma designs to working code. Architected with Python & Node.js, enabling automated code generation.",
    imageUrl: "https://picsum.photos/800/600?grayscale&random=1"
  },
  {
    id: 2,
    title: "CLOUD MIGRATION OPS",
    category: "CLOUD / MICROSERVICES",
    year: "2023",
    description: "Led migration of on-premise services to Azure & GCP. Designed scalable microservices architecture and installment-based payment systems.",
    imageUrl: "https://picsum.photos/800/600?grayscale&random=2"
  },
  {
    id: 3,
    title: "DATA CORE OPTIMIZATION",
    category: "DATA ENGINEERING",
    year: "2023",
    description: "Revolutionized ETL pipelines reducing runtime by 91% (5hrs to 45mins). Spearheaded SQL Server 2019 migration reducing dev time by 40%.",
    imageUrl: "https://picsum.photos/800/600?grayscale&random=3"
  },
  {
    id: 4,
    title: "ENTERPRISE WORKFLOW",
    category: "PROCESS AUTOMATION",
    year: "2022",
    description: "Re-engineered workflows across 10 departments, cutting reporting time by 75%. Consolidated communication systems for 25% cost reduction.",
    imageUrl: "https://picsum.photos/800/600?grayscale&random=4"
  }
];

const LAB_ITEMS = [
  { id: "001", name: "Fluid Type", type: "WebGL", desc: "Real-time typography distortion via flow fields." },
  { id: "002", name: "Neural Shader", type: "GLSL", desc: "Simulating neural activation patterns in fragment shaders." },
  { id: "003", name: "Haptic Web", type: "API", desc: "Experimental vibration patterns for mobile web interactions." },
  { id: "004", name: "Zero UI", type: "Concept", desc: "Voice and gesture only navigation prototype." },
  { id: "005", name: "Data Mosh", type: "Video", desc: "Controlled datamoshing as a transition effect." },
  { id: "006", name: "Bio-Auth", type: "Security", desc: "Visualizing cryptographic handshakes biologically." },
];

const TOOLS = [
  { name: "React / Next.js", level: "FRONTEND_CORE" },
  { name: "Node.js / Go", level: "BACKEND_SYS" },
  { name: "PostgreSQL", level: "DATA_PERSIST" },
  { name: "Docker / K8s", level: "INFRA_OPS" },
  { name: "WebGL / Three.js", level: "VISUAL_LAYER" },
  { name: "TypeScript", level: "TYPE_SAFETY" }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(0);
  const [activeAlgorithmStep, setActiveAlgorithmStep] = useState(0);
  const [activeLabItem, setActiveLabItem] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-bg text-[#e0e0e0] font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Global Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03]" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 3px)' }}></div>
      
      {/* Background Layer */}
      <Background3D />

      {/* Fixed UI Overlay: Progress & Info */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 mix-blend-difference">
         {/* Left Border Line */}
         <div className="absolute left-6 md:left-12 top-0 bottom-0 w-px bg-white/10"></div>
         {/* Right Border Line */}
         <div className="absolute right-6 md:right-12 top-0 bottom-0 w-px bg-white/10"></div>
         
         {/* Scroll Indicator */}
         <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-1 flex flex-col gap-1 items-end pr-2">
            <div className="text-[8px] font-mono mb-2">{Math.round(scrolled)}px</div>
            <div className="h-24 w-px bg-gray-800 relative">
               <div 
                 className="absolute top-0 left-0 w-full bg-white transition-all duration-75 ease-out"
                 style={{ height: `${Math.min((scrolled / (document.body.scrollHeight - window.innerHeight)) * 100, 100)}%` }}
               ></div>
            </div>
         </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 pointer-events-none">
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-8 flex justify-between items-start pointer-events-auto mix-blend-difference z-50">
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-bold tracking-[0.25em] font-display">
              <TextScramble text="SKNDSH" />
              <span className="text-gray-500"> // </span>T.
            </h1>
            <span className="text-[9px] font-mono text-gray-400 tracking-widest">SYS.VER.11.0.1</span>
          </div>
          <div className="hidden md:flex gap-12 text-xs font-mono tracking-[0.2em]">
            <button onClick={() => scrollTo('manifesto')} className="hover:text-white text-gray-500 transition-colors">INDEX</button>
            <button onClick={() => scrollTo('work')} className="hover:text-white text-gray-500 transition-colors">PROJECTS</button>
            <button onClick={() => scrollTo('blog')} className="hover:text-white text-gray-500 transition-colors">LOGS</button>
            <button onClick={() => navigate('/lab')} className="hover:text-white text-green-500 transition-colors flex items-center gap-2">
                <FlaskConical className="w-3 h-3" /> SIMULATION
            </button>
            <button onClick={() => scrollTo('tech')} className="hover:text-white text-gray-500 transition-colors">STACK</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-white text-gray-500 transition-colors">COMM</button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pointer-events-auto pl-6 pr-6 md:pl-24 md:pr-24">
          
          {/* HERO SECTION */}
          <section id="hero" className="min-h-screen flex flex-col justify-center relative border-l border-r border-white/5 bg-black/60 backdrop-blur-sm">
            <div className="px-6 md:px-12 space-y-8">
              <div className="overflow-hidden">
                 <h2 className="text-6xl md:text-[8vw] font-display font-medium leading-[0.85] tracking-tighter animate-in slide-in-from-bottom-10 fade-in duration-1000">
                  <TextScramble text="BEYOND" /><br/>
                  <TextScramble text="FULL" /><br/>
                  <span className="text-gray-600"><TextScramble text="STACK" /></span>
                 </h2>
              </div>
              <p className="text-xs md:text-sm font-mono text-gray-400 max-w-md leading-relaxed border-l border-white/20 pl-4 uppercase tracking-wide bg-black/80 p-2">
                Engineering the abstract. <br/>
                Defining the bleeding edge.
              </p>
            </div>
            
            <div className="absolute bottom-12 left-6 md:left-12 animate-bounce">
              <ArrowDown className="w-4 h-4 text-gray-500" />
            </div>
          </section>

          {/* MANIFESTO SECTION */}
          <section id="manifesto" className="py-32 border-l border-r border-white/5 bg-[#030303]/90 backdrop-blur-md">
             <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                   <span className="text-[10px] font-mono border border-gray-700 px-2 py-1 text-gray-400">OPERATIVE: SKANDESH</span>
                   <h3 className="text-3xl md:text-5xl font-display leading-tight">
                      THE CODE IS <TextScramble text="SILENT" />.<br />
                      THE IMPACT IS <TextScramble text="DEAFENING" />.
                   </h3>
                </div>
                <div className="flex flex-col justify-end space-y-6 text-sm text-gray-400 leading-relaxed font-mono">
                   <div className="bg-black/50 p-4 border border-gray-900">
                      <ul className="list-disc pl-4 space-y-2">
                        <li>PRECISION ENGINEERING. ZERO COMPROMISE.</li>
                        <li>Executing complex digital maneuvers with surgical accuracy.</li>
                        <li>Your vision, deployed.</li>
                      </ul>
                   </div>
                   <div className="bg-black/50 p-4 border border-gray-900">
                      <ul className="list-disc pl-4 space-y-2">
                        <li>6 years of silence. 6 years of shipping.</li>
                        <li>From architecting distributed systems to crafting pixel-perfect animations.</li>
                        <li>Building software that is both powerful and beautiful.</li>
                      </ul>
                   </div>
                </div>
             </div>
          </section>

          {/* WORK SECTION */}
          <section id="work" className="py-32 border-l border-r border-white/5 bg-[#050505]/85 backdrop-blur-sm">
            <div className="px-6 md:px-12 mb-20 flex justify-between items-end">
              <span className="text-[10px] font-mono border border-gray-700 px-2 py-1 text-gray-400">02 / DEPLOYMENTS</span>
            </div>

            <div className="px-6 md:px-12 grid grid-cols-1 gap-40">
              {PROJECTS.map((project, index) => (
                <div key={project.id} className="group relative">
                  {/* Large Index Number */}
                  <span className="absolute -top-20 -left-4 md:-left-12 text-[120px] font-display font-bold text-white/5 select-none z-0 group-hover:text-white/10 transition-colors">
                    0{index + 1}
                  </span>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start bg-black/40 p-6 md:p-0 rounded-lg md:rounded-none">
                    {/* Image Area */}
                    <div className="w-full lg:w-7/12 aspect-video overflow-hidden bg-gray-900 relative border border-gray-800 group-hover:border-gray-600 transition-colors">
                       {/* Glitch overlay effect container */}
                      <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-20 transition-opacity bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700 ease-out"
                      />
                    </div>

                    {/* Text Area */}
                    <div className="w-full lg:w-5/12 flex flex-col h-full pt-4">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-[9px] font-mono bg-white text-black px-2 py-1">{project.year}</span>
                            <span className="text-[9px] font-mono text-gray-400 tracking-widest uppercase">{project.category}</span>
                        </div>
                        <h4 className="text-4xl md:text-6xl font-display font-medium mb-8 leading-tight">
                            <TextScramble text={project.title} hoverTrigger={false} />
                        </h4>
                        <div className="bg-black/60 p-4 border border-gray-800/50 mb-12">
                            <p className="text-sm text-gray-400 leading-relaxed font-mono">
                            {project.description}
                            </p>
                        </div>
                        
                        <div className="mt-auto">
                            <button className="group/btn flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] hover:text-white text-gray-500 transition-colors">
                                <span>Initialize Case Study</span>
                                <div className="w-8 h-px bg-gray-700 group-hover/btn:w-12 group-hover/btn:bg-white transition-all"></div>
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BLOG SECTION */}
          <BlogSection />

          {/* R&D / LAB SECTION */}
           <section id="lab" className="py-32 border-l border-r border-white/5 bg-[#030303]/90 backdrop-blur-sm">
             <div className="px-6 md:px-12">
                <div className="mb-16 flex flex-col md:flex-row justify-between md:items-end gap-4">
                   <div>
                     <span className="text-[10px] font-mono border border-gray-700 px-2 py-1 text-gray-400">04 / R&D LAB</span>
                     <h3 className="text-3xl md:text-5xl font-display mt-8 max-w-2xl leading-tight">
                        <TextScramble text="EXPERIMENTAL PROTOCOLS" />
                     </h3>
                   </div>
                   <button 
                    onClick={() => navigate('/lab')}
                    className="text-xs font-mono text-green-500 max-w-xs text-right hover:underline cursor-pointer flex items-center gap-2"
                   >
                      ENTER SIMULATION MODE <ExternalLink className="w-3 h-3" />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800 border border-gray-800">
                   {LAB_ITEMS.map((item) => (
                      <div key={item.id} className="bg-black p-8 hover:bg-gray-900/50 transition-colors group min-h-[180px] flex flex-col justify-between">
                         <div className="flex justify-between items-start mb-4">
                            <FlaskConical className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                            <span className="text-[9px] font-mono text-gray-600">{item.id}</span>
                         </div>
                         <div>
                            <h4 className="text-xl font-display mb-2"><TextScramble text={item.name} hoverTrigger={true} /></h4>
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{item.type}</p>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              {item.desc}
                            </p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           </section>

           {/* TECHNICAL ARSENAL SECTION */}
           <section id="tech" className="py-32 border-l border-r border-white/5 bg-[#030303]/90">
             <div className="px-6 md:px-12">
                <div className="mb-16">
                   <span className="text-[10px] font-mono border border-gray-700 px-2 py-1 text-gray-400">05 / ARCHITECTURE</span>
                   <h3 className="text-3xl md:text-5xl font-display mt-8 max-w-2xl leading-tight">
                      IMPOSSIBLE IS JUST AN <TextScramble text="UNOPTIMIZED ALGORITHM" />.
                   </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-800 border border-gray-800">
                   {TOOLS.map((tool, idx) => (
                      <div key={idx} className="bg-black p-6 aspect-square flex flex-col justify-between hover:bg-gray-900 transition-colors group cursor-crosshair">
                         <div className="flex justify-between items-start">
                            <Zap className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                            <span className="text-[8px] font-mono text-gray-600">{tool.level}</span>
                         </div>
                         <span className="text-xs font-mono font-bold tracking-wider">{tool.name}</span>
                      </div>
                   ))}
                </div>
             </div>
          </section>

          {/* PROCESS / ALGORITHM SECTION */}
          <section className="py-32 border-l border-r border-white/5 bg-[#050505]/95">
             <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="flex items-center justify-center">
                     <div className="aspect-square w-full max-w-md bg-gray-900/50 border border-gray-800 p-4 relative overflow-hidden flex items-center justify-center group">
                        <AlgorithmVisuals step={activeAlgorithmStep} />
                     </div>
                 </div>
                 <div className="flex flex-col justify-center space-y-8">
                    <div className="flex items-center gap-2 text-gray-500">
                       <Fingerprint className="w-4 h-4" />
                       <span className="text-[10px] font-mono uppercase tracking-widest">The Algorithm</span>
                    </div>
                    
                    <div className="space-y-8 text-sm font-mono text-gray-400">
                        <div 
                           className="group flex gap-6 border-b border-gray-800 pb-8 hover:border-white/20 transition-colors cursor-pointer"
                           onMouseEnter={() => setActiveAlgorithmStep(0)}
                        >
                           <span className={`text-white/50 transition-colors ${activeAlgorithmStep === 0 ? 'text-white' : 'group-hover:text-white'}`}>01.</span>
                           <div>
                              <h5 className={`mb-2 font-display uppercase tracking-wider transition-colors ${activeAlgorithmStep === 0 ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}><TextScramble text="DISCOVERY" /></h5>
                              <p className="opacity-60">Mapping the problem space through rigorous data analysis and user observation.</p>
                           </div>
                        </div>
                        <div 
                           className="group flex gap-6 border-b border-gray-800 pb-8 hover:border-white/20 transition-colors cursor-pointer"
                           onMouseEnter={() => setActiveAlgorithmStep(1)}
                        >
                           <span className={`text-white/50 transition-colors ${activeAlgorithmStep === 1 ? 'text-white' : 'group-hover:text-white'}`}>02.</span>
                           <div>
                              <h5 className={`mb-2 font-display uppercase tracking-wider transition-colors ${activeAlgorithmStep === 1 ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}><TextScramble text="ABSTRACTION" /></h5>
                              <p className="opacity-60">Reducing complex requirements into pure, functional components.</p>
                           </div>
                        </div>
                        <div 
                           className="group flex gap-6 border-b border-gray-800 pb-8 hover:border-white/20 transition-colors cursor-pointer"
                           onMouseEnter={() => setActiveAlgorithmStep(2)}
                        >
                           <span className={`text-white/50 transition-colors ${activeAlgorithmStep === 2 ? 'text-white' : 'group-hover:text-white'}`}>03.</span>
                           <div>
                              <h5 className={`mb-2 font-display uppercase tracking-wider transition-colors ${activeAlgorithmStep === 2 ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}><TextScramble text="SYNTHESIS" /></h5>
                              <p className="opacity-60">Recombining components into high-fidelity interactive prototypes.</p>
                           </div>
                        </div>
                    </div>
                 </div>
             </div>
          </section>

          {/* CONTACT SECTION */}
          <section id="contact" className="py-32 px-6 md:px-12 text-center border-l border-r border-white/5 mt-0 relative bg-white text-black overflow-hidden">
             <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <div className="mb-12 animate-pulse">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <h2 className="text-6xl md:text-9xl font-display font-bold tracking-tighter mb-12 leading-none">
                    <TextScramble text="WORK" /><br/>
                    <TextScramble text="WITH ME" />
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    <a href="mailto:hello@skandesh.dev" className="text-lg font-mono hover:bg-black hover:text-white px-4 py-2 transition-all border border-black">hello@skandesh.dev</a>
                    <div className="flex gap-6">
                        <a href="#" className="hover:scale-110 transition-transform"><Github className="w-6 h-6" /></a>
                        <a href="#" className="hover:scale-110 transition-transform"><LayoutGrid className="w-6 h-6" /></a>
                    </div>
                </div>
             </div>
             
             {/* Dither texture for footer */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px' }}>
             </div>
          </section>

        </main>



      </div>

      {/* AI Overlay */}
      <div className="pointer-events-auto">
         <ChatInterface />
      </div>
    </div>
  );
};

export default Home;
