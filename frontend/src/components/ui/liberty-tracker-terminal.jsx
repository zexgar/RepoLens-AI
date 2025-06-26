import React from 'react';
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "./terminal";

export function LibertyTrackerTerminal() {
  return (
    <Terminal>
      <TypingAnimation className="text-blue-400">
        &gt; liberty-tracker analyze --schedule daily
      </TypingAnimation>

      <AnimatedSpan delay={1500} className="text-green-400">
        <span>🔍 Scanning your daily schedule...</span>
      </AnimatedSpan>

      <AnimatedSpan delay={2000} className="text-green-400">
        <span>✔ Found 8 meetings scheduled</span>
      </AnimatedSpan>

      <AnimatedSpan delay={2500} className="text-green-400">
        <span>✔ Detected 2.5 hours of commute time</span>
      </AnimatedSpan>

      <AnimatedSpan delay={3000} className="text-green-400">
        <span>✔ Identified 6 focus work blocks</span>
      </AnimatedSpan>

      <AnimatedSpan delay={3500} className="text-green-400">
        <span>✔ Analyzing break patterns...</span>
      </AnimatedSpan>

      <AnimatedSpan delay={4000} className="text-yellow-400">
        <span>⚡ Processing calendar data...</span>
      </AnimatedSpan>

      <AnimatedSpan delay={4500} className="text-blue-400">
        <span>📊 Calculating freedom percentage...</span>
      </AnimatedSpan>

      <AnimatedSpan delay={5000} className="text-purple-400">
        <div className="space-y-1">
          <div>📈 ANALYSIS COMPLETE</div>
          <div className="pl-4 text-white">
            → Time Freedom: <span className="text-green-400 font-bold">67%</span>
          </div>
          <div className="pl-4 text-white">
            → Longest free block: <span className="text-blue-400">3.5 hours</span>
          </div>
          <div className="pl-4 text-white">
            → Busiest period: <span className="text-red-400">2PM - 5PM</span>
          </div>
        </div>
      </AnimatedSpan>

      <AnimatedSpan delay={6000} className="text-cyan-400">
        <div className="space-y-1">
          <div>💡 OPTIMIZATION SUGGESTIONS:</div>
          <div className="pl-4 text-gray-300">• Move morning workout to 6:30 AM</div>
          <div className="pl-4 text-gray-300">• Batch meetings on Tuesday/Thursday</div>
          <div className="pl-4 text-gray-300">• Block 9-11 AM for deep work</div>
        </div>
      </AnimatedSpan>

      <TypingAnimation delay={7000} className="text-green-400">
        🎯 Success! You could gain 2.3 hours of free time per day.
      </TypingAnimation>

      <TypingAnimation delay={7500} className="text-gray-400">
        Ready to reclaim your liberty? Start your journey today.
      </TypingAnimation>
    </Terminal>
  );
}