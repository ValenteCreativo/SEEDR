'use client';

import { formatSOL } from '@/lib/utils';

export function ProgressBar({
  current,
  goal,
}: {
  current: number;
  goal: number;
}) {
  const pct = Math.min((current / goal) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{formatSOL(current)} SOL raised</span>
        <span>{formatSOL(goal)} SOL goal</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-seedGreen rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
