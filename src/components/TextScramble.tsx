import React, { useState, useEffect, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  hoverTrigger?: boolean;
  duration?: number;
  autoPlay?: boolean;
}

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

const TextScramble: React.FC<TextScrambleProps> = ({ 
  text, 
  className = "", 
  hoverTrigger = true,
  duration = 1000,
  autoPlay = false
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<any>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const scramble = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    let iteration = 0;
    
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(prev => 
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) { 
        clearInterval(intervalRef.current);
        setIsAnimating(false);
      }

      iteration += 1 / 3; // Speed of decoding
    }, 30);
  };

  useEffect(() => {
    if (autoPlay) {
      scramble();
    }
    return () => clearInterval(intervalRef.current);
  }, [text, autoPlay]);

  return (
    <span 
      ref={spanRef}
      className={className}
      onMouseEnter={() => hoverTrigger && scramble()}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'bottom' // Ensures alignment with surrounding text
      }}
    >
      {displayText}
    </span>
  );
};

export default TextScramble;