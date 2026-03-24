'use client';

import { ProgressBar } from './ProgressBar';
import type { MockProject } from '@/lib/mock-data';

const categoryColors: Record<string, string> = {
  EdTech: 'bg-blue-500/20 text-blue-400',
  Marketplace: 'bg-purple-500/20 text-purple-400',
  'Climate/IoT': 'bg-emerald-500/20 text-emerald-400',
  'Creative/AI': 'bg-pink-500/20 text-pink-400',
  Hardware: 'bg-orange-500/20 text-orange-400',
  Productivity: 'bg-cyan-500/20 text-cyan-400',
};


const tierColors: Record<string, string> = {
  'Sprouting': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Growing':   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Rooted':    'bg-seedGreen/20 text-seedGreen border-seedGreen/30',
};

const gradients = [
  'from-green-900/60 to-emerald-800/30',
  'from-purple-900/60 to-indigo-800/30',
  'from-blue-900/60 to-cyan-800/30',
  'from-pink-900/60 to-rose-800/30',
  'from-orange-900/60 to-amber-800/30',
  'from-teal-900/60 to-green-800/30',
];

export function ProjectCard({
  project,
  index = 0,
  onTap,
}: {
  project: MockProject;
  index?: number;
  onTap?: () => void;
}) {
  const gradient = gradients[index % gradients.length];
  const catColor =
    categoryColors[project.category] || 'bg-gray-500/20 text-gray-400';

  return (
    <div
      onClick={onTap}
      className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-[#15151a] cursor-pointer select-none"
    >
      {/* Cover image or gradient */}
      <div className={`h-44 relative flex items-end p-5 bg-gradient-to-br ${gradient}`}>
        {project.cover_image_url && (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="relative z-10">
          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full ${catColor} mb-2`}>
            {project.category}
          </span>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">{project.title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
        <p className="text-gray-300 text-sm leading-relaxed">
          {project.tagline}
        </p>
        <ProgressBar
          current={project.current_backed_sol}
          goal={project.funding_goal_sol}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-seedGreen" />
            {project.stage === 'early' ? 'Early Stage' : project.stage}
          </div>
          {project.seed_score && project.seed_tier && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierColors[project.seed_tier] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
              🌱 {project.seed_tier} · {project.seed_score}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
