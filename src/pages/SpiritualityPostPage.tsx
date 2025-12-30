import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Circle } from 'lucide-react';
import { MDXProvider } from '@mdx-js/react';
import { getPostBySlug } from '../generated/spiritual-manifest';
import type { SpiritualPost } from '../types/spiritual';

// Dynamic import map for MDX files
const postModules = import.meta.glob('../content/spiritual/*.mdx');

// Spiritual-specific MDX components with meditative styling
const spiritualMdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-12 text-[#cd7f32]" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl md:text-3xl font-light tracking-wide mt-20 mb-8 text-[#e8dcc4]" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-light tracking-wide mt-16 mb-6 text-[#cd7f32]/80" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-lg leading-relaxed mb-8 text-[#e8dcc4]/80 font-light" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-16 py-8 border-y border-[#cd7f32]/20 text-2xl md:text-3xl font-light italic text-center text-[#e8dcc4]/90"
      {...props}
    />
  ),
  hr: () => (
    <div className="my-20 flex justify-center">
      <Circle className="w-3 h-3 text-[#cd7f32]/40" fill="currentColor" />
    </div>
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-8 space-y-4 text-[#e8dcc4]/70" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-4 text-lg font-light">
      <span className="text-[#cd7f32]/60 mt-2">·</span>
      <span {...props} />
    </li>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-normal text-[#cd7f32]" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-[#e8dcc4]" {...props} />
  ),
};

const SpiritualityPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<SpiritualPost | null>(null);
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    const metadata = getPostBySlug(slug);
    if (!metadata) {
      setError('Post not found');
      setLoading(false);
      return;
    }

    setPost(metadata);

    const importPath = `../content/spiritual/${slug}.mdx`;
    const loader = postModules[importPath];

    if (!loader) {
      setError('Post content not found');
      setLoading(false);
      return;
    }

    loader()
      .then((module: any) => {
        setContent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load post:', err);
        setError('Failed to load post');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0f0a] text-[#e8dcc4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Circle className="w-6 h-6 text-[#cd7f32] animate-pulse" />
          <span className="text-sm font-light tracking-widest uppercase opacity-60">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#1a0f0a] text-[#e8dcc4] flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-light">Not Found</h1>
          <button
            onClick={() => navigate('/spirituality')}
            className="text-sm font-light tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-[#e8dcc4] font-serif">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 md:p-12 flex justify-between items-center z-50">
        <button
          onClick={() => navigate('/spirituality')}
          className="flex items-center gap-3 text-[10px] font-sans tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Return
        </button>
        <div className="flex items-center gap-4 text-[10px] font-sans tracking-widest uppercase opacity-40">
          <Clock className="w-3 h-3" />
          <span>{post.readTime}</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-24 pb-12 relative">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#8d4004] blur-[150px]"></div>
        </div>

        <div className="z-10 text-center space-y-8 max-w-3xl">
          <div className="flex justify-center">
            <Circle className="w-4 h-4 text-[#cd7f32]/60" strokeWidth={1} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#cd7f32]/60">
              {post.category}
            </span>
            <span className="text-[10px] font-sans tracking-widest uppercase opacity-40 mx-4">·</span>
            <span className="text-[10px] font-sans tracking-widest uppercase opacity-40">
              {post.date}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-light tracking-wide leading-tight">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-lg md:text-xl font-light opacity-60 max-w-xl mx-auto">
              {post.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <article className="max-w-2xl mx-auto px-6 py-16">
        <MDXProvider components={spiritualMdxComponents}>
          <Suspense fallback={<div className="text-center opacity-40">Loading...</div>}>
            {Content && <Content />}
          </Suspense>
        </MDXProvider>
      </article>

      {/* Footer */}
      <div className="max-w-2xl mx-auto px-6 py-24 border-t border-[#cd7f32]/10">
        <button
          onClick={() => navigate('/spirituality')}
          className="flex items-center gap-3 text-sm font-light tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Stillness
        </button>
      </div>
    </div>
  );
};

export default SpiritualityPostPage;
