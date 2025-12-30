import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Palette } from 'lucide-react';
import { MDXProvider } from '@mdx-js/react';
import { getWorkBySlug } from '../generated/creative-manifest';
import type { CreativeWork } from '../types/creative';
import Lightbox from '../components/creative/Lightbox';

// Dynamic import maps for MDX files by type
const generativeModules = import.meta.glob('../content/creative/generative/*.mdx');
const photographyModules = import.meta.glob('../content/creative/photography/*.mdx');
const writingModules = import.meta.glob('../content/creative/writing/*.mdx');

// Dynamic import map for canvas components
const canvasModules = import.meta.glob('../components/creative/canvases/*.tsx');

// Creative-specific MDX components
const creativeMdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-white" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-16 mb-6 text-white" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold tracking-tight mt-12 mb-4 text-white" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-300 leading-relaxed mb-6 font-mono text-sm" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-red-600 pl-6 my-12 text-2xl md:text-3xl font-light italic text-gray-200" {...props} />
  ),
  hr: () => <hr className="border-gray-800 my-16" />,
};

const CreativeWorkPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [work, setWork] = useState<CreativeWork | null>(null);
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [CanvasComponent, setCanvasComponent] = useState<React.ComponentType<{ onBack?: () => void }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state for photography
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    const metadata = getWorkBySlug(slug);
    if (!metadata) {
      setError('Work not found');
      setLoading(false);
      return;
    }

    setWork(metadata);

    // Determine which module map to use based on type
    const moduleMap = {
      generative: generativeModules,
      photography: photographyModules,
      writing: writingModules,
    }[metadata.type];

    const importPath = `../content/creative/${metadata.type}/${slug}.mdx`;
    const loader = moduleMap[importPath];

    if (!loader) {
      setError('Work content not found');
      setLoading(false);
      return;
    }

    // Load MDX content
    loader()
      .then((module: any) => {
        setContent(() => module.default);

        // If generative and interactive, also load canvas component
        if (metadata.type === 'generative' && metadata.interactive && metadata.componentPath) {
          const canvasPath = `../components/creative/canvases/${metadata.componentPath}.tsx`;
          const canvasLoader = canvasModules[canvasPath];

          if (canvasLoader) {
            return canvasLoader().then((canvasModule: any) => {
              setCanvasComponent(() => canvasModule.default);
            });
          }
        }
      })
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load work:', err);
        setError('Failed to load work');
        setLoading(false);
      });
  }, [slug]);

  const handleLightboxNext = () => {
    if (work?.images) {
      setLightboxIndex((prev) => (prev + 1) % work.images!.length);
    }
  };

  const handleLightboxPrev = () => {
    if (work?.images) {
      setLightboxIndex((prev) => (prev - 1 + work.images!.length) % work.images!.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-600 animate-pulse" />
          LOADING WORK...
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">WORK NOT FOUND</h1>
          <button
            onClick={() => navigate('/creative')}
            className="text-sm font-mono text-gray-500 hover:text-white transition-colors"
          >
            RETURN TO GALLERY
          </button>
        </div>
      </div>
    );
  }

  // Render based on work type
  return (
    <div className="min-h-screen bg-[#050505] text-[#f0f0f0]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference">
        <button
          onClick={() => navigate('/creative')}
          className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO GALLERY
        </button>
        <div className="flex items-center gap-4 text-xs font-mono text-white/40">
          <span>{work.category}</span>
          {work.readTime && (
            <>
              <span>/</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {work.readTime}
              </span>
            </>
          )}
        </div>
      </nav>

      {/* Type-specific rendering */}
      {work.type === 'generative' && (
        <GenerativeWorkView
          work={work}
          Content={Content}
          CanvasComponent={CanvasComponent}
        />
      )}

      {work.type === 'photography' && (
        <PhotographyWorkView
          work={work}
          Content={Content}
          onImageClick={(index) => {
            setLightboxIndex(index);
            setLightboxOpen(true);
          }}
        />
      )}

      {work.type === 'writing' && (
        <WritingWorkView work={work} Content={Content} />
      )}

      {/* Lightbox for photography */}
      {work.type === 'photography' && work.images && (
        <Lightbox
          images={work.images}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={handleLightboxNext}
          onPrev={handleLightboxPrev}
        />
      )}
    </div>
  );
};

// Generative Work View
const GenerativeWorkView: React.FC<{
  work: CreativeWork;
  Content: React.ComponentType | null;
  CanvasComponent: React.ComponentType<{ onBack?: () => void }> | null;
}> = ({ work, Content, CanvasComponent }) => {
  const [showCanvas, setShowCanvas] = useState(false);

  return (
    <div className="pt-24">
      {/* Hero with thumbnail */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={work.thumbnail}
          alt={work.title}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute bottom-12 left-0 right-0 px-8 md:px-24">
          <span className="font-mono text-xs text-red-500 uppercase tracking-widest mb-4 block">
            {work.category} // {work.date}
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter">
            {work.title}
          </h1>
        </div>
      </div>

      {/* Interactive toggle */}
      {work.interactive && CanvasComponent && (
        <div className="px-8 md:px-24 py-12 border-y border-gray-800">
          <button
            onClick={() => setShowCanvas(!showCanvas)}
            className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            <Palette className="w-5 h-5" />
            {showCanvas ? 'HIDE INTERACTIVE' : 'LAUNCH INTERACTIVE'}
          </button>
        </div>
      )}

      {/* Canvas */}
      {showCanvas && CanvasComponent && (
        <div className="h-screen">
          <CanvasComponent onBack={() => setShowCanvas(false)} />
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-8 md:px-12 py-16">
        <MDXProvider components={creativeMdxComponents}>
          <Suspense fallback={<div className="font-mono text-gray-500">Loading...</div>}>
            {Content && <Content />}
          </Suspense>
        </MDXProvider>
      </article>
    </div>
  );
};

// Photography Work View
const PhotographyWorkView: React.FC<{
  work: CreativeWork;
  Content: React.ComponentType | null;
  onImageClick: (index: number) => void;
}> = ({ work, Content, onImageClick }) => {
  return (
    <div className="pt-24">
      {/* Title */}
      <div className="px-8 md:px-24 py-12">
        <span className="font-mono text-xs text-red-500 uppercase tracking-widest mb-4 block">
          {work.category} // {work.date}
        </span>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8">
          {work.title}
        </h1>
      </div>

      {/* Image gallery */}
      {work.images && work.images.length > 0 && (
        <div className="px-4 md:px-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {work.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onImageClick(idx)}
                className="relative aspect-[4/3] overflow-hidden group cursor-pointer"
              >
                <img
                  src={img}
                  alt={`${work.title} - Image ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-8 md:px-12 py-16">
        <MDXProvider components={creativeMdxComponents}>
          <Suspense fallback={<div className="font-mono text-gray-500">Loading...</div>}>
            {Content && <Content />}
          </Suspense>
        </MDXProvider>
      </article>
    </div>
  );
};

// Writing Work View
const WritingWorkView: React.FC<{
  work: CreativeWork;
  Content: React.ComponentType | null;
}> = ({ work, Content }) => {
  return (
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 md:px-12 py-16 border-b border-gray-800">
        <span className="font-mono text-xs text-red-500 uppercase tracking-widest mb-6 block">
          {work.category} // {work.date}
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
          {work.title}
        </h1>
        {work.readTime && (
          <div className="mt-8 flex items-center gap-2 text-sm font-mono text-gray-500">
            <Clock className="w-4 h-4" />
            {work.readTime}
          </div>
        )}
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-8 md:px-12 py-16">
        <MDXProvider components={creativeMdxComponents}>
          <Suspense fallback={<div className="font-mono text-gray-500">Loading...</div>}>
            {Content && <Content />}
          </Suspense>
        </MDXProvider>
      </article>
    </div>
  );
};

export default CreativeWorkPage;
