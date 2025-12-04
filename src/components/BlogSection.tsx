import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Terminal } from 'lucide-react';
import { blogManifest } from '../generated/blog-manifest';

const BlogSection = () => {
  // Posts are now statically imported from generated manifest
  const posts = blogManifest;

  return (
    <section id="blog" className="py-32 border-l border-r border-white/5 bg-[#050505]/90 backdrop-blur-sm">
      <div className="px-6 md:px-12">
        <div className="mb-16 flex items-end justify-between">
            <div>
                <span className="text-[10px] font-mono border border-gray-700 px-2 py-1 text-gray-400">03 / TRANSMISSIONS</span>
                <h3 className="text-3xl md:text-5xl font-display mt-8 max-w-2xl leading-tight">
                    ENGINEERING <span className="text-gray-500">LOGS</span>
                </h3>
                <p className="text-sm font-mono text-gray-500 mt-4 uppercase tracking-wider">
                    first principled thinking
                </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-gray-500">
                <Terminal className="w-4 h-4" />
                <span>SYS.LOG.STREAM</span>
            </div>
        </div>

        <div className="border-t border-gray-800">
            {posts.map((post) => (
                <Link 
                    key={post.slug} 
                    to={`/blog/${post.slug}`}
                    className="group border-b border-gray-800 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors px-4 -mx-4 cursor-pointer"
                >
                    <div className="flex items-center gap-8 md:w-1/3">
                        <span className="text-[10px] font-mono text-gray-600 group-hover:text-green-500 transition-colors">
                            {post.date}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 border border-gray-800 px-2 py-0.5 rounded-full">
                            {post.category}
                        </span>
                    </div>
                    
                    <div className="md:w-1/2">
                        <h4 className="text-xl md:text-2xl font-display group-hover:translate-x-2 transition-transform duration-300">
                            {post.title}
                        </h4>
                    </div>

                    <div className="flex items-center justify-end gap-4 md:w-1/6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-mono text-gray-500">{post.readTime}</span>
                        <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                </Link>
            ))}
        </div>
        
        <div className="mt-12 text-center">
            <button className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                View All Transmissions
            </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

