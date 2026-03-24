'use client';

import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { MilestoneList } from './MilestoneList';
import { BenefitsList } from './BenefitsList';
import { SupportModal } from './SupportModal';
import { shortenAddress } from '@/lib/utils';
import type { MockProject } from '@/lib/mock-data';

export function ProjectDetailModal({
  project,
  onClose,
}: {
  project: MockProject;
  onClose: () => void;
}) {
  const [showSupport, setShowSupport] = useState(false);

  if (showSupport) {
    return (
      <SupportModal project={project} onClose={() => setShowSupport(false)} />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm bg-[#1a1a1e] border border-white/10 rounded-2xl relative overflow-y-auto" style={{ maxHeight: '80vh' }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-seedGreen/20 text-seedGreen mb-3">
            {project.category}
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            {project.title}
          </h2>
          <p className="text-gray-400 text-sm">{project.tagline}</p>
          <div className="mt-3 text-xs text-gray-500">
            by {shortenAddress(project.creator_wallet_address)}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <ProgressBar
            current={project.current_backed_sol}
            goal={project.funding_goal_sol}
          />

          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              About
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {project.description}
            </p>
          </div>

          <MilestoneList milestones={project.milestones} />
          <BenefitsList benefits={project.benefits} />

          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-seedGreen text-sm hover:underline"
            >
              Visit project <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={() => setShowSupport(true)}
            className="w-full py-3 rounded-xl bg-seedGreen text-black font-semibold text-sm hover:bg-green-400 transition-colors"
          >
            Support This Project
          </button>
        </div>
      </div>
    </div>
  );
}
