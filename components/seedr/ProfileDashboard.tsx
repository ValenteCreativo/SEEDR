'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, Zap, Award, Clock } from 'lucide-react';

// Recharts — lazy loaded (client only)
const AreaChart    = dynamic(() => import('recharts').then(m => m.AreaChart),    { ssr: false });
const Area         = dynamic(() => import('recharts').then(m => m.Area),         { ssr: false });
const BarChart     = dynamic(() => import('recharts').then(m => m.BarChart),     { ssr: false });
const Bar          = dynamic(() => import('recharts').then(m => m.Bar),          { ssr: false });
const XAxis        = dynamic(() => import('recharts').then(m => m.XAxis),        { ssr: false });
const YAxis        = dynamic(() => import('recharts').then(m => m.YAxis),        { ssr: false });
const Tooltip      = dynamic(() => import('recharts').then(m => m.Tooltip),      { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

interface Support {
  id: string;
  amount_sol: number;
  tx_signature: string;
  created_at: string;
  project?: { title: string; category: string; };
}

interface Props {
  backedProjects: Support[];
  savedCount: number;
  builderCount: number;
  walletAddress: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ProfileDashboard({ backedProjects, savedCount, builderCount, walletAddress }: Props) {
  const totalSOL   = backedProjects.reduce((s, b) => s + Number(b.amount_sol || 0), 0);
  const avgSOL     = backedProjects.length ? (totalSOL / backedProjects.length) : 0;

  // Activity chart — SOL backed grouped by day (last 14 days)
  const activityData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    backedProjects.forEach(b => {
      const d = new Date(b.created_at || now);
      const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      if (key in days) days[key] += Number(b.amount_sol || 0);
    });
    return Object.entries(days).map(([date, sol]) => ({ date, sol }));
  }, [backedProjects]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    backedProjects.forEach(b => {
      const cat = b.project?.category || 'Other';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats).map(([name, count]) => ({ name: name.slice(0, 8), count }));
  }, [backedProjects]);

  const stats = [
    { label: 'Total Backed', value: `${totalSOL.toFixed(2)} SOL`, icon: TrendingUp, color: 'text-seedGreen' },
    { label: 'Projects',     value: backedProjects.length,         icon: Zap,        color: 'text-blue-400' },
    { label: 'Saved',        value: savedCount,                    icon: Award,      color: 'text-purple-400' },
    { label: 'Avg / Project',value: `${avgSOL.toFixed(2)} SOL`,   icon: Clock,      color: 'text-orange-400' },
  ];

  const tooltipStyle = {
    background: 'rgba(20,20,24,0.95)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 11,
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-white/5"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
            <p className="text-white font-bold text-lg leading-none">{s.value}</p>
            <p className="text-gray-600 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid sm:grid-cols-3 gap-3">
        {/* Backing activity — area chart (2/3 width) */}
        <div className="sm:col-span-2 p-4 rounded-xl border border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Backing Activity · 14d</p>
          <div style={{ height: 90 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="solGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false}
                  interval={3} />
                <YAxis tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(74,222,128,0.2)' }}
                  formatter={(v: any) => [`${Number(v).toFixed(2)} SOL`, '']} />
                <Area type="monotone" dataKey="sol" stroke="#4ade80" strokeWidth={1.5}
                  fill="url(#solGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown (1/3 width) */}
        <div className="p-4 rounded-xl border border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">By Category</p>
          {categoryData.length === 0
            ? <p className="text-gray-700 text-xs pt-6 text-center">Back projects to see breakdown</p>
            : (
              <div style={{ height: 90 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#4b5563' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(v: any) => [v, 'projects']} />
                    <Bar dataKey="count" fill="#4ade80" radius={[3, 3, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      </div>

      {/* Activity feed */}
      {backedProjects.length > 0 && (
        <div className="p-4 rounded-xl border border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Recent Activity</p>
          <div className="space-y-2">
            {backedProjects.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-seedGreen" />
                  <div>
                    <span className="text-white text-xs font-medium">
                      Backed {b.project?.title || b.id}
                    </span>
                    {b.tx_signature && (
                      <a href={`https://solscan.io/tx/${b.tx_signature}?cluster=devnet`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-gray-700 hover:text-seedGreen text-[10px] ml-2 transition-colors">
                        {b.tx_signature.slice(0, 8)}…↗
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-seedGreen text-xs font-semibold">+{b.amount_sol} SOL</span>
                  <p className="text-gray-700 text-[10px]">{b.created_at ? timeAgo(b.created_at) : 'recently'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet chip */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 w-fit">
        <div className="w-1.5 h-1.5 rounded-full bg-seedGreen animate-pulse" />
        <span className="text-gray-600 text-[10px] font-mono">
          {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
        </span>
        <span className="text-gray-700 text-[10px]">· Solana Devnet</span>
      </div>
    </div>
  );
}
