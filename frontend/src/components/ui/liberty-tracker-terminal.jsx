import React from 'react';
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "./terminal";

export function LibertyTrackerTerminal() {
  return (
    <div className="relative terminal-dissolve">
      {/* Full terminal with dissolving effect */}
      <Terminal className="transform translate-y-0">
        <TypingAnimation className="text-blue-600 font-semibold">
          📊 &gt; liberty-tracker analyze --schedule daily
        </TypingAnimation>

        <AnimatedSpan delay={1500} className="text-purple-600">
          <span>🔍 Scanning your daily schedule...</span>
        </AnimatedSpan>

        <AnimatedSpan delay={2000} className="text-green-600">
          <span>✨ Found 8 meetings scheduled</span>
        </AnimatedSpan>

        <AnimatedSpan delay={2500} className="text-green-600">
          <span>🚗 Detected 2.5 hours of commute time</span>
        </AnimatedSpan>

        <AnimatedSpan delay={3000} className="text-green-600">
          <span>💼 Identified 6 focus work blocks</span>
        </AnimatedSpan>

        <AnimatedSpan delay={3500} className="text-green-600">
          <span>☕ Analyzing break patterns...</span>
        </AnimatedSpan>

        <AnimatedSpan delay={4000} className="text-amber-600">
          <span>⚡ Processing calendar data...</span>
        </AnimatedSpan>

        <AnimatedSpan delay={4500} className="text-blue-600">
          <span>🧮 Calculating freedom percentage...</span>
        </AnimatedSpan>

        <AnimatedSpan delay={5000} className="text-purple-600">
          <div className="space-y-1">
            <div>🎉 ANALYSIS COMPLETE</div>
            <div className="pl-4 text-gray-800">
              → Time Freedom: <span className="text-green-600 font-bold">67% 🎯</span>
            </div>
            <div className="pl-4 text-gray-800">
              → Longest free block: <span className="text-blue-600 font-semibold">3.5 hours ⏰</span>
            </div>
            <div className="pl-4 text-gray-800">
              → Busiest period: <span className="text-red-600 font-semibold">2PM - 5PM 📈</span>
            </div>
          </div>
        </AnimatedSpan>

        <AnimatedSpan delay={6000} className="text-cyan-600">
          <div className="space-y-1">
            <div>💡 OPTIMIZATION SUGGESTIONS:</div>
            <div className="pl-4 text-gray-700">🏃‍♀️ Move morning workout to 6:30 AM</div>
            <div className="pl-4 text-gray-700">📅 Batch meetings on Tuesday/Thursday</div>
            <div className="pl-4 text-gray-700">🎯 Block 9-11 AM for deep work</div>
            <div className="pl-4 text-gray-700">🍽️ Schedule lunch breaks consistently</div>
          </div>
        </AnimatedSpan>

        <TypingAnimation delay={7000} className="text-green-600 font-semibold">
          🚀 Success! You could gain 2.3 hours of free time per day.
        </TypingAnimation>

        <TypingAnimation delay={7500} className="text-gray-600">
          🗽 Ready to reclaim your liberty? Start your journey today! 🌟
        </TypingAnimation>

        {/* Additional content that will be dissolved */}
        <AnimatedSpan delay={8000} className="text-blue-600">
          <div className="space-y-1 mt-4">
            <div>📈 WEEKLY TRENDS:</div>
            <div className="pl-4 text-gray-700">Monday: 45% free time</div>
            <div className="pl-4 text-gray-700">Tuesday: 72% free time</div>
            <div className="pl-4 text-gray-700">Wednesday: 58% free time</div>
          </div>
        </AnimatedSpan>

        <AnimatedSpan delay={8500} className="text-gray-500">
          <div className="mt-4 text-center">
            Continue scrolling to explore activity tracking...
          </div>
        </AnimatedSpan>
      </Terminal>
    </div>
  );
}