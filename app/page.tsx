'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Sprout, ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { ParticleField } from '@/components/seedr/ParticleField';

const STATS = [
  { value: '6', label: 'Projects live' },
  { value: 'SOL', label: 'On-chain currency' },
  { value: '∞', label: 'Ideas waiting' },
];

export default function LandingPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Particles */}
      <ParticleField />

      {/* Subtle radial glow behind hero */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.07) 0%, transparent 70%)',
          zIndex: 1,
        }}
      />

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24" style={{ zIndex: 2 }}>
        {/* Logo mark */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 rounded-2xl bg-seedGreen/10 border border-seedGreen/20 flex items-center justify-center mx-auto">
            <Sprout className="w-10 h-10 text-seedGreen" />
          </div>
          <div className="absolute inset-0 rounded-2xl blur-2xl bg-seedGreen/10 mx-auto w-20 h-20" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-3 leading-none tracking-tight">
          Swipe ideas.
        </h1>
        <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-none tracking-tight"
          style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
            backgroundImage: 'linear-gradient(90deg, #22c55e, #86efac)' }}>
          Back builders.
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-lg mb-2 leading-relaxed">
          The earliest ideas need the bravest backers.
        </p>
        <p className="text-gray-500 text-base max-w-md mb-10">
          Support builders directly on Solana — no gatekeepers, no equity, just belief.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mb-14">
          {connected ? (
            <Link
              href="/discover"
              className="px-8 py-3.5 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-lg shadow-seedGreen/20"
            >
              Start Discovering <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="px-8 py-3.5 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-all hover:scale-105 shadow-lg shadow-seedGreen/20"
            >
              Connect Wallet to Start
            </button>
          )}
          <Link
            href="/discover"
            className="px-8 py-3.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all hover:border-white/20"
          >
            Browse Projects
          </Link>
        </div>

        {/* Stats strip */}
        <div className="flex gap-10 sm:gap-16">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-4xl mx-auto w-full px-4 pb-24 grid sm:grid-cols-3 gap-4" style={{ zIndex: 2 }}>
        {[
          {
            icon: Zap,
            title: 'Swipe to discover',
            desc: 'Browse early-stage projects like you scroll your feed. Save what sparks something.',
          },
          {
            icon: Shield,
            title: 'SOL goes straight to builders',
            desc: 'No escrow theater. Your support lands in the builder\'s wallet, confirmed on-chain.',
          },
          {
            icon: Users,
            title: 'Builder or backer — or both',
            desc: 'Launch your project. Support someone else\'s. One wallet covers everything.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl border border-white/5 hover:border-seedGreen/20 transition-colors group"
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)' }}
          >
            <div className="w-9 h-9 rounded-lg bg-seedGreen/10 flex items-center justify-center mb-4 group-hover:bg-seedGreen/20 transition-colors">
              <f.icon className="w-5 h-5 text-seedGreen" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>


      {/* What backers get */}
      <section className="relative max-w-4xl mx-auto w-full px-4 pb-12" style={{ zIndex: 2 }}>
        <div className="rounded-2xl border border-seedGreen/20 p-8"
          style={{ background: 'rgba(34,197,94,0.04)', backdropFilter: 'blur(12px)' }}>
          <h2 className="text-lg font-bold text-white mb-1">What backers get</h2>
          <p className="text-gray-500 text-sm mb-6">Supporting a builder is not charity — it is early access to what comes next.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: '🎟️', title: 'Early access', desc: 'Get in before public launch. Test, use, and shape the product from day one.' },
              { emoji: '🏅', title: 'Supporter recognition', desc: 'On-chain proof you backed this before it was cool. Your wallet address on the record.' },
              { emoji: '🌱', title: 'Milestone-based perks', desc: 'As the project hits milestones, backers unlock benefits defined by the builder.' },
            ].map(b => (
              <div key={b.title} className="flex gap-3">
                <span className="text-2xl">{b.emoji}</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{b.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-6 border-t border-white/5 pt-4">
            Supporting a project on Seedr is an on-chain contribution, not an equity investment. Benefits are defined by each builder and are not guaranteed financial returns.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-6 text-center text-xs text-gray-600" style={{ zIndex: 2 }}>
        Seedr — Plant early. Grow together. Built on{' '}
        <span className="text-seedGreen">Solana Devnet</span>.
      </footer>
    </div>
  );
}
