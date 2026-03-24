'use client';

import { useEffect, useState, use } from 'react';
import { ProgressBar } from '@/components/seedr/ProgressBar';
import { MilestoneList } from '@/components/seedr/MilestoneList';
import { BenefitsList } from '@/components/seedr/BenefitsList';
import { SupportModal } from '@/components/seedr/SupportModal';
import { shortenAddress } from '@/lib/utils';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { MockProject } from '@/lib/mock-data';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<MockProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => setProject(data.project || data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 text-seedGreen animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Project not found</p>
        <Link href="/discover" className="text-seedGreen text-sm hover:underline mt-2 inline-block">
          Back to discover
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/discover"
        className="text-sm text-gray-400 hover:text-white inline-flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-seedGreen/20 text-seedGreen mb-3">
        {project.category}
      </span>
      <h1 className="text-3xl font-bold text-white mb-1">{project.title}</h1>
      <p className="text-gray-400 mb-1">{project.tagline}</p>
      <p className="text-xs text-gray-500 mb-6">
        by {shortenAddress(project.creator_wallet_address)}
      </p>

      <div className="space-y-6">
        <ProgressBar
          current={project.current_backed_sol}
          goal={project.funding_goal_sol}
        />

        <p className="text-sm text-gray-400 leading-relaxed">
          {project.description}
        </p>

        {project.milestones && <MilestoneList milestones={project.milestones} />}
        {project.benefits && <BenefitsList benefits={project.benefits} />}

        <button
          onClick={() => setShowSupport(true)}
          className="w-full py-3 rounded-xl bg-seedGreen text-black font-semibold text-sm hover:bg-green-400 transition-colors"
        >
          Support This Project
        </button>
      </div>

      {showSupport && (
        <SupportModal
          project={project}
          onClose={() => setShowSupport(false)}
        />
      )}
    </div>
  );
}
