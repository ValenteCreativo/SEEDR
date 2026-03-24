'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Sprout, Wallet, Bookmark, BarChart2, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { ProgressBar } from '@/components/seedr/ProgressBar';
import { CreateProjectForm } from '@/components/seedr/CreateProjectForm';
import { BuilderDashboard } from '@/components/seedr/BuilderDashboard';
import Link from 'next/link';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { ProfileDashboard } from '@/components/seedr/ProfileDashboard';

type Tab = 'backed' | 'saved' | 'projects' | 'launch';

interface Project {
  id: string; title: string; tagline: string; category: string;
  funding_goal_sol: number; current_backed_sol: number; status: string;
}
interface Support {
  id: string; amount_sol: number; tx_signature: string; created_at: string; project: Project;
}

export default function ProfilePage() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [tab, setTab] = useState<Tab>('backed');
  const [loading, setLoading] = useState(false);
  const [backedProjects, setBackedProjects] = useState<Support[]>([]);
  const [builderProjects, setBuilderProjects] = useState<Project[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  // Load saved from localStorage
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('seedr-saved') || '[]');
      setSavedIds(ids);
    } catch {}
  }, []);

  useEffect(() => {
    if (!wallet.publicKey) return;
    setLoading(true);
    fetch(`/api/users/me?walletAddress=${wallet.publicKey.toBase58()}`)
      .then(r => r.json())
      .then(data => {
        setBackedProjects(data.backedProjects || []);
        setBuilderProjects(data.builderProjects || []);
      })
      .finally(() => setLoading(false));
  }, [wallet.publicKey]);

  const savedProjects = MOCK_PROJECTS.filter(p => savedIds.includes(p.id));
  const totalBacked = backedProjects.reduce((s, b) => s + (b.amount_sol || 0), 0);

  const tabs = [
    { id: 'backed'   as Tab, label: 'Backed',      icon: BarChart2, count: backedProjects.length },
    { id: 'saved'    as Tab, label: 'Saved',        icon: Bookmark,  count: savedProjects.length },
    { id: 'projects' as Tab, label: 'My Projects',  icon: Sprout,    count: builderProjects.length },
    { id: 'launch'   as Tab, label: 'Launch',       icon: Plus,      count: 0 },
  ];

  // ── Not connected ────────────────────────────────────────────────
  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-seedGreen/10 border border-seedGreen/20 flex items-center justify-center mb-6">
          <Wallet className="w-8 h-8 text-seedGreen" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Connect your wallet</h1>
        <p className="text-gray-400 mb-6 max-w-xs">You need a wallet to see your backed projects, saved ideas, and launch your own project.</p>
        <button
          onClick={() => setVisible(true)}
          className="px-6 py-3 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // ── Launch tab → CreateProjectForm ───────────────────────────────
  if (tab === 'launch' && showCreate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setShowCreate(false)}
          className="mb-4 text-sm text-gray-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-xl font-bold text-white mb-6">Create New Project</h2>
        <CreateProjectForm onCreated={() => { setShowCreate(false); setTab('projects'); }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 p-5 rounded-2xl border border-white/5"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-14 h-14 rounded-2xl bg-seedGreen/10 border border-seedGreen/20 flex items-center justify-center">
          <img src="/favicon.png" alt="Seedr" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold">My Profile</p>
          <p className="text-gray-500 text-xs font-mono truncate">{wallet.publicKey?.toBase58()}</p>
        </div>
      </div>


      {/* Dashboard */}
      <ProfileDashboard
        backedProjects={backedProjects}
        savedCount={savedProjects.length}
        builderCount={builderProjects.length}
        walletAddress={wallet.publicKey!.toBase58()}
      />

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 mb-6 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? 'bg-seedGreen text-black' : 'text-gray-400 hover:text-white'
            }`}>
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
            {t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/20' : 'bg-white/10'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>

      ) : tab === 'backed' ? (
        <div className="space-y-3">
          {backedProjects.length === 0
            ? <EmptyState icon="💸" title="No backed projects yet" desc="Go to Discover and support a builder." href="/discover" cta="Discover projects" />
            : backedProjects.map((s: Support) => (
              <div key={s.id} className="p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{s.project?.title}</p>
                    <p className="text-gray-500 text-xs">{s.project?.category}</p>
                  </div>
                  <span className="text-seedGreen font-bold">{s.amount_sol} SOL</span>
                </div>
                {s.project && <ProgressBar current={s.project.current_backed_sol} goal={s.project.funding_goal_sol} />}
                {s.tx_signature && (
                  <a href={`https://solscan.io/tx/${s.tx_signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-seedGreen mt-2 inline-flex items-center gap-1 transition-colors">
                    {s.tx_signature.slice(0, 12)}...↗
                  </a>
                )}
              </div>
            ))}
        </div>

      ) : tab === 'saved' ? (
        <div className="space-y-3">
          {savedProjects.length === 0
            ? <EmptyState icon="🔖" title="No saved projects" desc="Swipe right on projects you want to revisit." href="/discover" cta="Start swiping" />
            : savedProjects.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-white/5 hover:border-seedGreen/20 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{p.title}</p>
                    <p className="text-gray-500 text-xs">{p.tagline}</p>
                  </div>
                  {p.seed_tier && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-seedGreen/20 text-seedGreen border border-seedGreen/30">
                      🌱 {p.seed_tier}
                    </span>
                  )}
                </div>
                <ProgressBar current={p.current_backed_sol} goal={p.funding_goal_sol} />
              </div>
            ))}
        </div>

      ) : tab === 'projects' ? (
        <div className="space-y-3">
          <button onClick={() => { setTab('launch'); setShowCreate(true); }}
            className="w-full p-4 rounded-xl border border-dashed border-seedGreen/30 text-seedGreen hover:border-seedGreen/60 hover:bg-seedGreen/5 transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Launch a new project
          </button>
          {builderProjects.length === 0
            ? <EmptyState icon="🌱" title="No projects yet" desc="Ready to share your idea?" href="#" cta="" />
            : builderProjects.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-white/5 hover:border-seedGreen/20 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{p.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{p.tagline}</p>
                  </div>
                </div>
                <ProgressBar current={p.current_backed_sol} goal={p.funding_goal_sol} />
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span className="capitalize">{p.status}</span>
                  <span className="text-seedGreen">{p.current_backed_sol} / {p.funding_goal_sol} SOL</span>
                </div>
              </div>
            ))}
        </div>

      ) : tab === 'launch' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-seedGreen/10 border border-seedGreen/20 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-seedGreen" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Launch your project</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Share your idea with the world. Backers are waiting for the next great project.</p>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-all">
            Create Project
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ icon, title, desc, href, cta }: { icon: string; title: string; desc: string; href: string; cta: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-white font-semibold mb-2">{title}</p>
      <p className="text-gray-500 text-sm mb-6">{desc}</p>
      {cta && href !== '#' && (
        <Link href={href} className="px-5 py-2.5 rounded-xl bg-seedGreen text-black text-sm font-semibold hover:bg-green-400 transition-all">
          {cta}
        </Link>
      )}
    </div>
  );
}
