import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export function MagicCard({
  children,
  className,
  gradientColor = "#D9D9D955",
  gradientOpacity = 0.8,
  ...props
}) {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (card) {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Magic gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovering ? gradientOpacity : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 40%)`,
        }}
      />
      
      {/* Magic border effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 197, 253, 0.4), transparent 40%)`,
          maskImage: "linear-gradient(transparent, transparent, transparent, black, black, black, transparent, transparent, transparent)",
          WebkitMaskImage: "linear-gradient(transparent, transparent, transparent, black, black, black, transparent, transparent, transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}