import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Coffee, 
  Briefcase, 
  Users, 
  Home, 
  Heart, 
  BookOpen,
  Dumbbell,
  Music,
  Car,
  Phone
} from 'lucide-react';
import { cn } from "../../lib/utils";

const ActivityTokens = ({ className }) => {
  const [containerSize, setContainerSize] = useState({ width: 800, height: 256 });

  useEffect(() => {
    const updateContainerSize = () => {
      // Get responsive container dimensions based on screen size
      const screenWidth = window.innerWidth;
      let width, height;
      
      if (screenWidth < 640) { // Mobile
        width = screenWidth - 32; // Account for padding
        height = 256;
      } else if (screenWidth < 1024) { // Tablet
        width = Math.min(screenWidth * 0.8, 800);
        height = 256;
      } else { // Desktop
        width = Math.min(screenWidth * 0.7, 1000);
        height = 256;
      }
      
      setContainerSize({ width, height });
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  const activities = [
    { icon: Briefcase, label: 'Work', color: 'bg-blue-100 border-blue-300 text-blue-700', delay: 0 },
    { icon: Users, label: 'Meetings', color: 'bg-purple-100 border-purple-300 text-purple-700', delay: 0.5 },
    { icon: Coffee, label: 'Breaks', color: 'bg-amber-100 border-amber-300 text-amber-700', delay: 1 },
    { icon: Home, label: 'Personal', color: 'bg-green-100 border-green-300 text-green-700', delay: 1.5 },
    { icon: Heart, label: 'Health', color: 'bg-red-100 border-red-300 text-red-700', delay: 2 },
    { icon: BookOpen, label: 'Learning', color: 'bg-indigo-100 border-indigo-300 text-indigo-700', delay: 2.5 },
    { icon: Dumbbell, label: 'Exercise', color: 'bg-orange-100 border-orange-300 text-orange-700', delay: 3 },
    { icon: Music, label: 'Leisure', color: 'bg-pink-100 border-pink-300 text-pink-700', delay: 3.5 },
    { icon: Car, label: 'Commute', color: 'bg-gray-100 border-gray-300 text-gray-700', delay: 4 },
    { icon: Phone, label: 'Social', color: 'bg-teal-100 border-teal-300 text-teal-700', delay: 4.5 },
  ];

  // Calculate responsive path coordinates
  const { width, height } = containerSize;
  const centerY = height / 2;
  const quarterHeight = height / 4;
  
  // Generate responsive connecting paths
  const getResponsivePaths = () => {
    const segments = 6; // Number of path segments
    const segmentWidth = width / segments;
    
    return {
      mainPath: `M ${segmentWidth * 0.5} ${centerY} Q ${segmentWidth * 1.5} ${centerY - quarterHeight} ${segmentWidth * 2.5} ${centerY} Q ${segmentWidth * 3.5} ${centerY + quarterHeight} ${segmentWidth * 4.5} ${centerY} Q ${segmentWidth * 5.5} ${centerY - quarterHeight} ${width - segmentWidth * 0.5} ${centerY}`,
      
      topPath: `M ${segmentWidth} ${centerY - quarterHeight} Q ${segmentWidth * 2} ${centerY} ${segmentWidth * 3} ${centerY - quarterHeight} Q ${segmentWidth * 4} ${centerY - quarterHeight * 1.5} ${segmentWidth * 5} ${centerY - quarterHeight}`,
      
      bottomPath: `M ${segmentWidth * 0.75} ${centerY + quarterHeight} Q ${segmentWidth * 2} ${centerY} ${segmentWidth * 3} ${centerY + quarterHeight} Q ${segmentWidth * 4} ${centerY + quarterHeight * 1.5} ${segmentWidth * 5.25} ${centerY + quarterHeight}`
    };
  };

  const responsivePaths = getResponsivePaths();

  return (
    <div className={cn("relative w-full h-64 overflow-hidden", className)}>
      {/* Responsive Connection Lines SVG */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main connecting path */}
        <path
          d={responsivePaths.mainPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 connection-line opacity-60"
        />
        {/* Top connecting path */}
        <path
          d={responsivePaths.topPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 connection-line opacity-40"
        />
        {/* Bottom connecting path */}
        <path
          d={responsivePaths.bottomPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 connection-line opacity-40"
        />
      </svg>

      {/* Activity Tokens - Positions remain stable */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-4 p-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const positions = [
            { left: '5%', top: '30%' },
            { left: '20%', top: '10%' },
            { left: '35%', top: '50%' },
            { left: '50%', top: '15%' },
            { left: '65%', top: '40%' },
            { left: '80%', top: '20%' },
            { left: '15%', top: '70%' },
            { left: '45%', top: '75%' },
            { left: '75%', top: '65%' },
            { left: '90%', top: '50%' },
          ];

          return (
            <div
              key={activity.label}
              className={cn(
                "absolute activity-token flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-110",
                activity.color
              )}
              style={{
                left: positions[index]?.left || '50%',
                top: positions[index]?.top || '50%',
                animationDelay: `${activity.delay}s`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">
                {activity.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating particles for ambient effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gray-200 rounded-full opacity-30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export { ActivityTokens };