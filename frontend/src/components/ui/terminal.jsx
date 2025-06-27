import React, { useState, useEffect } from 'react';
import { cn } from "../../lib/utils";

const Terminal = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "relative w-full mx-auto bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Terminal Header - Responsive */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-700 text-xs sm:text-sm font-mono font-medium text-center flex-1 px-2">
          <span className="hidden sm:inline">🗽 Liberty Tracker Analysis Terminal 🎯</span>
          <span className="sm:hidden">🗽 Liberty Tracker 🎯</span>
        </div>
        <div className="w-12 sm:w-16"></div>
      </div>

      {/* Terminal Content - Responsive sizing */}
      <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed min-h-[250px] sm:min-h-[300px] max-h-[350px] sm:max-h-[400px] overflow-hidden bg-white">
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
      <span className="animate-pulse text-gray-800">│</span>
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