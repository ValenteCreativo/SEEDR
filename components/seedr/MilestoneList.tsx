'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export function MilestoneList({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Milestones
      </h3>
      {milestones.map((ms) => (
        <div key={ms.id} className="flex items-start gap-3">
          {ms.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-seedGreen mt-0.5 shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
          )}
          <div>
            <p
              className={
                ms.status === 'completed'
                  ? 'text-sm text-white'
                  : 'text-sm text-gray-400'
              }
            >
              {ms.title}
            </p>
            {ms.description && (
              <p className="text-xs text-gray-500 mt-0.5">{ms.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
