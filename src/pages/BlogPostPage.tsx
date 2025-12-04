import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { MDXProvider } from '@mdx-js/react';
import { mdxComponents } from '../components/mdx/MDXComponents';
import { getPostBySlug } from '../generated/blog-manifest';
import type { BlogPost } from '../types/blog';

// Dynamic import map for MDX files
const postModules = import.meta.glob('../content/posts/*.mdx');

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Omit<BlogPost, 'content'> | null>(null);
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    // Get metadata from manifest
    const metadata = getPostBySlug(slug);
    if (!metadata) {
      setError('Post not found');
      setLoading(false);
      return;
    }

    setPost({ ...metadata, id: slug });

    // Dynamic import of MDX content
    const importPath = `../content/posts/${slug}.mdx`;
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        LOADING TRANSMISSION...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display mb-4">404: TRANSMISSION NOT FOUND</h1>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-mono text-gray-500 hover:text-white transition-colors"
          >
            RETURN TO BASE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-[#e0e0e0] font-sans">
      {/* Scanline Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 3px)',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[10px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO TRANSMISSIONS
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                <Tag className="w-3 h-3" />
                <span>{post.category}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                <Clock className="w-3 h-3" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-6 py-16">
          {/* Meta */}
          <div className="mb-8">
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
              {post.date} // TRANSMISSION #{post.id}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-16 leading-none tracking-tight">
            {post.title}
          </h1>

          {/* MDX Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <MDXProvider components={mdxComponents}>
              <Suspense fallback={<div className="font-mono text-gray-500">Loading content...</div>}>
                {Content && <Content />}
              </Suspense>
            </MDXProvider>
          </div>

          {/* Footer Navigation */}
          <div className="mt-24 pt-12 border-t border-gray-800">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              RETURN TO INDEX
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;
