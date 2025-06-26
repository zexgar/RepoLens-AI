import React, { useState, useEffect } from 'react';
import { cn } from "../../lib/utils";

const Terminal = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-400 text-sm font-mono">
          Liberty Tracker Analysis Terminal
        </div>
        <div className="w-16"></div>
      </div>

      {/* Terminal Content */}
      <div className="p-6 font-mono text-sm leading-relaxed min-h-[400px] max-h-[500px] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

const TypingAnimation = ({ 
  children, 
  delay = 0, 
  speed = 50, 
  className = "", 
  ...props 
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const text = typeof children === 'string' ? children : '';
    let currentIndex = 0;

    const typingTimer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingTimer);
      }
    }, speed);

    return () => clearInterval(typingTimer);
  }, [isVisible, children, speed]);

  if (!isVisible) return null;

  return (
    <div className={cn("block", className)} {...props}>
      {displayedText}
      <span className="animate-pulse">│</span>
    </div>
  );
};

const AnimatedSpan = ({ 
  children, 
  delay = 0, 
  className = "", 
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn("block animate-fade-in", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export { Terminal, TypingAnimation, AnimatedSpan };