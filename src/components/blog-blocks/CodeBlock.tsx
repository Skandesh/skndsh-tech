import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 border border-gray-800 bg-black/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-green-500" />
          {filename && (
            <span className="text-[10px] font-mono text-gray-400">{filename}</span>
          )}
          <span className="text-[9px] font-mono text-gray-600 uppercase">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[9px] font-mono text-gray-500 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              COPIED
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              COPY
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>

      {/* Bottom border effect */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>
    </div>
  );
};

export default CodeBlock;
