'use client';

import { useEffect } from 'react';

/**
 * Static progress bar component for loyalty tier progression
 */
export default function ProgressBar({
  progress,
  currentPoints = 0,
  startPoints = 0,
  endPoints = 100
}) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(progress, 100));

  // No debugging logs needed anymore

  return (
    <div className="w-full py-2" data-testid="loyalty-progress-bar">
      {/* Start and End Points */}
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{startPoints.toLocaleString()}</span>
        <span>{endPoints.toLocaleString()}</span>
      </div>
      
      {/* Bar Container */}
      <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Filled Bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full overflow-hidden"
          style={{
            width: `${clampedProgress}%`,
            background: 'linear-gradient(90deg, #FFB347 0%, #FF6B00 100%)',
            boxShadow: '0 2px 8px rgba(255,107,0,0.4)'
          }}
          data-testid="loyalty-progress-bar-fill"
        >
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white font-bold text-xs drop-shadow">
            {currentPoints.toLocaleString()}
          </span>
        </div>
        
        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-full w-px bg-white opacity-30" />
          ))}
        </div>
      </div>
    </div>
  );
}