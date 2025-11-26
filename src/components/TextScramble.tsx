import React, { useState, useEffect, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  hoverTrigger?: boolean;
  duration?: number;
}

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

const TextScramble: React.FC<TextScrambleProps> = ({ 
  text, 
  className = "", 
  hoverTrigger = true,
  duration = 1000
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<any>(null);

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
    scramble(); // Scramble on mount
    return () => clearInterval(intervalRef.current);
  }, [text]);

  return (
    <span 
      className={className}
      onMouseEnter={() => hoverTrigger && scramble()}
    >
      {displayText}
    </span>
  );
};

export default TextScramble;