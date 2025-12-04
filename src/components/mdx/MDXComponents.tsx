import type { MDXComponents } from 'mdx/types';
import CodeBlock from '../blog-blocks/CodeBlock';
import DiagramBlock from '../blog-blocks/DiagramBlock';

// Custom components available in all MDX files
export const mdxComponents: MDXComponents = {
  // Override default elements
  h1: ({ children }) => (
    <h2 className="text-4xl md:text-5xl font-display font-bold mt-16 mb-8 tracking-tight">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="text-2xl md:text-3xl font-display font-bold mt-12 mb-6 tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base md:text-lg leading-relaxed text-gray-400 font-mono mb-6">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-400 font-mono mb-6 space-y-2">
      {children}
    </ul>
  ),
  li: ({ children }) => <li className="text-base md:text-lg">{children}</li>,

  // Code blocks - handle both inline and block
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children).replace(/\n$/, '');
    const isBlock = codeContent.includes('\n') || match;

    if (match && isBlock) {
      const lang = match[1];
      const ext = lang === 'typescript' ? 'ts' : lang === 'javascript' ? 'js' : lang;
      return (
        <CodeBlock
          language={lang}
          code={codeContent}
          filename={`example.${ext}`}
        />
      );
    }

    return (
      <code
        className="bg-gray-900 text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Custom components (imported explicitly in MDX)
  CodeBlock,
  DiagramBlock,
};
