'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Sprout, ArrowRight, Zap, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="mb-6 w-16 h-16 rounded-2xl bg-seedGreen/10 flex items-center justify-center">
          <Sprout className="w-8 h-8 text-seedGreen" />
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 leading-tight">
          Swipe ideas.
          <br />
          <span className="text-seedGreen">Back builders.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mb-8">
          Discover early-stage projects and support builders on Solana. One swipe
          at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {connected ? (
            <Link
              href="/discover"
              className="px-8 py-3.5 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-colors inline-flex items-center gap-2"
            >
              Start Discovering <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="px-8 py-3.5 rounded-xl bg-seedGreen text-black font-semibold hover:bg-green-400 transition-colors"
            >
              Connect Wallet to Start
            </button>
          )}
          <Link
            href="/discover"
            className="px-8 py-3.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            Browse Projects
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 pb-20 grid sm:grid-cols-3 gap-6">
        {[
          {
            icon: Zap,
            title: 'Swipe to Discover',
            desc: 'Browse early-stage projects with an intuitive swipe interface. Save the ones that inspire you.',
          },
          {
            icon: Shield,
            title: 'Direct SOL Support',
            desc: 'Send SOL directly to builders on Solana devnet. No middlemen, fully on-chain.',
          },
          {
            icon: Users,
            title: 'Build & Back',
            desc: 'Create your own project or support others. Be a builder, a backer, or both.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur"
          >
            <f.icon className="w-8 h-8 text-seedGreen mb-3" />
            <h3 className="text-white font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
        Seedr — Built on Solana Devnet
      </footer>
    </div>
  );
}
