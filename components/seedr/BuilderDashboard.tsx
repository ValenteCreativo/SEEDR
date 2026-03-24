'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ProgressBar } from './ProgressBar';
import { CreateProjectForm } from './CreateProjectForm';
import { Plus, ArrowLeft } from 'lucide-react';
import { formatSOL } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  tagline: string;
  category: string;
  funding_goal_sol: number;
  current_backed_sol: number;
  status: string;
}

export function BuilderDashboard() {
  const wallet = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet.publicKey) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [wallet.publicKey]);

  async function fetchData() {
    try {
      const res = await fetch(
        `/api/users/me?walletAddress=${wallet.publicKey!.toBase58()}`
      );
      const data = await res.json();
      setProjects(data.builderProjects || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  if (!wallet.connected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">Builder Dashboard</h2>
        <p className="text-gray-400">Connect your wallet to get started</p>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div>
        <button
          onClick={() => setShowCreate(false)}
          className="mb-4 text-sm text-gray-400 hover:text-white inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h2 className="text-xl font-bold text-white mb-6">Create New Project</h2>
        <CreateProjectForm
          onCreated={() => {
            setShowCreate(false);
            fetchData();
          }}
        />
      </div>
    );
  }

  const totalRaised = projects.reduce(
    (sum, p) => sum + (p.current_backed_sol || 0),
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Builder Dashboard</h2>
          {projects.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              Total raised: {formatSOL(totalRaised)} SOL across{' '}
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-seedGreen text-black text-sm font-medium hover:bg-green-400 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-400 mb-4">
            You haven&apos;t created any projects yet
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl bg-seedGreen text-black text-sm font-medium hover:bg-green-400 transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-400">{p.tagline}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-seedGreen/20 text-seedGreen">
                  {p.status}
                </span>
              </div>
              <ProgressBar
                current={p.current_backed_sol}
                goal={p.funding_goal_sol}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
