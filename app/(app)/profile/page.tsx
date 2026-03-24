'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Sprout, Wallet, Bookmark, BarChart2, ChevronRight } from 'lucide-react';
import { ProgressBar } from '@/components/seedr/ProgressBar';
import { shortenAddress } from '@/lib/utils';
import Link from 'next/link';

type Tab = 'backed' | 'saved' | 'projects';

interface Project {
  id: string;
  title: string;
  tagline: string;
  category: string;
  funding_goal_sol: number;
  current_backed_sol: number;
  status: string;
}

interface Support {
  id: string;
  amount_sol: number;
  tx_signature: string;
  created_at: string;
  project: Project;
}

export default function ProfilePage() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [tab, setTab] = useState<Tab>('backed');
  const [loading, setLoading] = useState(false);
  const [backedProjects, setBackedProjects] = useState<Support[]>([]);
  const [builderProjects, setBuilderProjects] = useState<Project[]>([]);

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

  const totalBacked = backedProjects.reduce((s: number, b: Support) => s + (b.amount_sol || 0), 0);

  const tabs = [
    { id: 'backed' as Tab, label: 'Backed', icon: BarChart2, count: backedProjects.length },
    { id: 'saved' as Tab, label: 'Saved', icon: Bookmark, count: 0 },
    { id: 'projects' as Tab, label: 'My Projects', icon: Sprout, count: builderProjects.length },
  ];

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-seedGreen/10 border border-seedGreen/20 flex items-center justify-center mb-6">
          <Wallet className="w-8 h-8 text-seedGreen" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-gray-400 mb-6">Connect your wallet to see your backed projects, saved ideas, and published projects.</p>
        <button
          onClick={() => setVisible(true)}
          className="px-6 py-3 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl border border-white/5"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-14 h-14 rounded-2xl bg-seedGreen/10 border border-seedGreen/20 flex items-center justify-center">
          <Sprout className="w-7 h-7 text-seedGreen" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-lg">My Profile</p>
          <p className="text-gray-500 text-sm font-mono truncate">{wallet.publicKey?.toBase58()}</p>
        </div>
        <div className="text-right">
          <p className="text-seedGreen font-bold text-xl">{totalBacked.toFixed(2)} SOL</p>
          <p className="text-gray-500 text-xs">total backed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-seedGreen text-black' : 'text-gray-400 hover:text-white'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/20' : 'bg-white/10'}`}>
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
          {backedProjects.length === 0 ? (
            <EmptyState icon="💸" title="No backed projects yet" desc="Go to Discover and support a builder." href="/discover" cta="Discover projects" />
          ) : backedProjects.map((s: Support) => (
            <div key={s.id} className="p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{s.project?.title || 'Project'}</p>
                  <p className="text-gray-500 text-xs">{s.project?.category}</p>
                </div>
                <span className="text-seedGreen font-bold">{s.amount_sol} SOL</span>
              </div>
              {s.project && <ProgressBar current={s.project.current_backed_sol} goal={s.project.funding_goal_sol} />}
              {s.tx_signature && (
                <a href={`https://solscan.io/tx/${s.tx_signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-600 hover:text-seedGreen mt-2 inline-flex items-center gap-1 transition-colors">
                  {shortenAddress(s.tx_signature)} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      ) : tab === 'saved' ? (
        <EmptyState icon="🔖" title="No saved projects" desc="Swipe right on projects you want to come back to." href="/discover" cta="Start swiping" />
      ) : (
        <div className="space-y-3">
          {builderProjects.length === 0 ? (
            <EmptyState icon="🌱" title="No projects yet" desc="Ready to share your idea with the world?" href="/builder" cta="Create a project" />
          ) : builderProjects.map((p: Project) => (
            <div key={p.id} className="p-4 rounded-xl border border-white/5 hover:border-seedGreen/20 transition-colors group"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{p.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{p.tagline}</p>
                </div>
                <Link href={`/project/${p.id}`}
                  className="text-gray-600 group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <ProgressBar current={p.current_backed_sol} goal={p.funding_goal_sol} />
              <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                <span className="capitalize">{p.status}</span>
                <span className="text-seedGreen font-medium">{p.current_backed_sol} / {p.funding_goal_sol} SOL</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc, href, cta }: { icon: string; title: string; desc: string; href: string; cta: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-white font-semibold mb-2">{title}</p>
      <p className="text-gray-500 text-sm mb-6">{desc}</p>
      <Link href={href} className="px-5 py-2.5 rounded-xl bg-seedGreen text-black text-sm font-semibold hover:bg-green-400 transition-all">
        {cta}
      </Link>
    </div>
  );
}
