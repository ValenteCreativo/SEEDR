'use client';

import Link from 'next/link';
import { useRef, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, Zap, Shield, Users, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js scene to avoid SSR issues
const NorthStarScene = dynamic(
  () => import('@/components/seedr/NorthStarScene').then(m => ({ default: m.NorthStarScene })),
  { ssr: false }
);

const STATS = [
  { value: '6', label: 'Projects live' },
  { value: 'SOL', label: 'On-chain currency' },
  { value: '∞', label: 'Ideas waiting' },
];

export default function LandingPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    setScrollProgress(el.scrollLeft / max);
  }, []);

  return (
    <>
      {/* Three.js background — fixed fullscreen */}
      <NorthStarScene scrollProgress={scrollProgress} />

      {/* Hide scrollbars globally for this page */}
      <style>{`
        .h-scroll-container::-webkit-scrollbar { display: none; }
        .h-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounceX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .bounce-x { animation: bounceX 1.2s ease-in-out infinite; }
      `}</style>

      {/* Horizontal scroll wrapper */}
      <div
        ref={scrollRef}
        className="h-scroll-container h-screen w-screen"
        style={{
          display: 'flex',
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
        }}
        onScroll={handleScroll}
      >
        {/* ── PAGE 1: Hero ────────────────────────────────────────── */}
        <section
          style={{ scrollSnapAlign: 'start', minWidth: '100vw', height: '100vh' }}
          className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        >
          {/* Subtle radial glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.07) 0%, transparent 70%)',
              zIndex: 1,
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo mark */}
            <div className="mb-8 relative">
              <div className="w-20 h-20 rounded-2xl bg-seedGreen/10 border border-seedGreen/20 flex items-center justify-center mx-auto">
                <img src="/favicon.png" alt="Seedr" className="w-10 h-10 object-contain" />
              </div>
              <div className="absolute inset-0 rounded-2xl blur-2xl bg-seedGreen/10 mx-auto w-20 h-20" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-3 leading-none tracking-tight">
              Swipe ideas.
            </h1>
            <h1
              className="text-5xl sm:text-7xl font-bold mb-6 leading-none tracking-tight"
              style={{
                WebkitTextFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                backgroundImage: 'linear-gradient(90deg, #22c55e, #86efac)',
              }}
            >
              Back builders.
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl max-w-lg mb-2 leading-relaxed">
              Find what&apos;s next before it&apos;s everywhere.
            </p>
            <p className="text-gray-500 text-base max-w-md mb-10">
              Your support goes straight to the builder — confirmed on-chain, zero middlemen.
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
          </div>

          {/* Scroll hint arrow — bottom-right */}
          <div
            className="absolute bottom-8 right-8 z-10 flex items-center gap-2 text-gray-500 text-sm select-none"
            style={{ pointerEvents: 'none' }}
          >
            <span>Scroll</span>
            <ChevronRight className="w-5 h-5 bounce-x" />
          </div>
        </section>

        {/* ── PAGE 2: Features + Backer Benefits ──────────────────── */}
        <section
          style={{ scrollSnapAlign: 'start', minWidth: '100vw', height: '100vh' }}
          className="relative flex flex-col items-center justify-center px-4 overflow-y-auto"
        >
          <div className="relative z-10 w-full max-w-4xl mx-auto py-16 space-y-10">

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Zap,
                  title: 'Swipe to discover',
                  desc: 'Browse early-stage projects like you scroll your feed. Save what sparks something.',
                },
                {
                  icon: Shield,
                  title: 'SOL goes straight to builders',
                  desc: "No escrow theater. Your support lands in the builder's wallet, confirmed on-chain.",
                },
                {
                  icon: Users,
                  title: 'Builder or backer — or both',
                  desc: 'Launch your project. Support someone else\'s. One wallet covers everything.',
                },
              ].map(f => (
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
            </div>

            {/* What backers get */}
            <div
              className="rounded-2xl border border-seedGreen/20 p-8"
              style={{ background: 'rgba(34,197,94,0.04)', backdropFilter: 'blur(12px)' }}
            >
              <h2 className="text-lg font-bold text-white mb-1">What backers get</h2>
              <p className="text-gray-500 text-sm mb-6">
                Supporting a builder is not charity — it is early access to what comes next.
              </p>
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

            {/* Footer */}
            <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
              Seedr — Plant early. Grow together. Built on{' '}
              <span className="text-seedGreen">Solana Devnet</span>.
              <br />
              <span className="text-gray-500">From México, with 🩵</span>
            </footer>
          </div>
        </section>
      </div>
    </>
  );
}
