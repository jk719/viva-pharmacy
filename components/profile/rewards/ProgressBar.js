'use client';

const REWARD_MILESTONES = [
  { points: 100, amount: 5 },
  { points: 200, amount: 15 },
  { points: 400, amount: 30 },
  { points: 600, amount: 50 },
  { points: 800, amount: 75 },
  { points: 1000, amount: 100 }
];

export default function ProgressBar({ 
  currentPoints, 
  nextMilestone,
  animate = false,
  compact = false
}) {
  const progress = (currentPoints / nextMilestone) * 100;

  if (compact) {
    return (
      <div className="absolute inset-x-0 top-0">
        {/* Dollar amounts */}
        <div className="flex justify-between mb-2 px-1">
          {REWARD_MILESTONES.map((milestone) => (
            <div 
              key={milestone.points}
              className="text-sm text-gray-500"
            >
              ${milestone.amount}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-orange-500 rounded-full ${
              animate ? 'transition-all duration-500 ease-out' : ''
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Point markers */}
        <div className="flex justify-between mt-2 px-1">
          {REWARD_MILESTONES.map((milestone) => (
            <div 
              key={milestone.points}
              className="text-xs text-gray-500"
            >
              {milestone.points}p
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full version (for dashboard)
  return (
    <div className="space-y-6">
      <div className="relative pt-8 pb-4">
        {/* Reward markers above bar */}
        <div className="absolute w-full flex justify-between -top-2">
          {REWARD_MILESTONES.map((milestone) => {
            const isReached = currentPoints >= milestone.points;
            return (
              <div 
                key={milestone.points}
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isReached 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                ${milestone.amount}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-orange-500 rounded-full ${
              animate ? 'transition-all duration-500 ease-out' : ''
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Point markers below bar */}
        <div className="absolute w-full flex justify-between mt-2">
          {REWARD_MILESTONES.map((milestone) => {
            const isReached = currentPoints >= milestone.points;
            return (
              <div 
                key={milestone.points}
                className={`text-sm font-medium ${
                  isReached ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {milestone.points}p
              </div>
            );
          })}
        </div>
      </div>

      {/* Points summary */}
      <div className="flex justify-between text-sm">
        <div>
          <span className="font-medium">Current Points:</span> {currentPoints}
        </div>
        <div>
          <span className="font-medium">Next Reward:</span> {nextMilestone - currentPoints} points needed
        </div>
      </div>
    </div>
  );
} 