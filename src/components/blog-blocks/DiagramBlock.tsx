import React from 'react';

interface DiagramBlockProps {
  content?: React.ReactNode;
  children?: React.ReactNode;
  caption?: string;
}

const DiagramBlock: React.FC<DiagramBlockProps> = ({ content, children, caption }) => {
  const diagramContent = children || content;
  return (
    <div className="my-12">
      <div className="border border-gray-800 bg-black/60 p-8 relative overflow-hidden">
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center">
          {diagramContent}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500/30"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500/30"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500/30"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500/30"></div>
      </div>

      {caption && (
        <p className="text-[10px] font-mono text-gray-500 text-center mt-3 uppercase tracking-wider">
          {caption}
        </p>
      )}
    </div>
  );
};

export default DiagramBlock;
