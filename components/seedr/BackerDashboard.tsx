'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ExternalLink } from 'lucide-react';
import { formatSOL, solscanTxUrl } from '@/lib/utils';
import Link from 'next/link';

interface BackedProject {
  id: string;
  project_id: string;
  project_title: string;
  amount_sol: number;
  tx_signature: string;
  created_at: string;
}

export function BackerDashboard() {
  const wallet = useWallet();
  const [backed, setBacked] = useState<BackedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet.publicKey) {
      setLoading(false);
      return;
    }
    fetch(`/api/users/me?walletAddress=${wallet.publicKey.toBase58()}`)
      .then((r) => r.json())
      .then((data) => setBacked(data.backedProjects || []))
      .catch(() => setBacked([]))
      .finally(() => setLoading(false));
  }, [wallet.publicKey]);

  if (!wallet.connected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">Backer Dashboard</h2>
        <p className="text-gray-400">Connect your wallet to see your supported projects</p>
      </div>
    );
  }

  const totalBacked = backed.reduce((sum, b) => sum + (b.amount_sol || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Backer Dashboard</h2>
        {backed.length > 0 && (
          <p className="text-sm text-gray-400 mt-1">
            Total backed: {formatSOL(totalBacked)} SOL across{' '}
            {backed.length} project{backed.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : backed.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-400 mb-4">
            You haven&apos;t backed any projects yet
          </p>
          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-xl bg-seedGreen text-black text-sm font-medium hover:bg-green-400 transition-colors inline-block"
          >
            Discover Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {backed.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-semibold">
                  {b.project_title || 'Project'}
                </h3>
                <p className="text-sm text-gray-400">
                  {formatSOL(b.amount_sol)} SOL
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(b.created_at).toLocaleDateString()}
                </p>
              </div>
              {b.tx_signature && (
                <a
                  href={solscanTxUrl(b.tx_signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-seedGreen hover:underline text-sm inline-flex items-center gap-1"
                >
                  TX <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
