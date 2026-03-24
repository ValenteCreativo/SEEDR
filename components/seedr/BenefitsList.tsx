'use client';

import { Gift } from 'lucide-react';

interface Benefit {
  id: string;
  title: string;
  description?: string;
  tier_label: string;
}

export function BenefitsList({ benefits }: { benefits: Benefit[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Supporter Benefits
      </h3>
      {benefits.map((b) => (
        <div
          key={b.id}
          className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
        >
          <Gift className="w-4 h-4 text-seedGreen mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">{b.title}</p>
            {b.description && (
              <p className="text-xs text-gray-400 mt-0.5">{b.description}</p>
            )}
            <span className="text-[10px] text-seedGreen/70 mt-1 inline-block">
              {b.tier_label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
