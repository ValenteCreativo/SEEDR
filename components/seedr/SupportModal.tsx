'use client';

import { useState } from 'react';
import { X, ExternalLink, Loader2, PartyPopper } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { transferSOL, computeFee } from '@/lib/solana';
import { solscanTxUrl } from '@/lib/utils';
import type { MockProject } from '@/lib/mock-data';

export function SupportModal({
  project,
  onClose,
}: {
  project: MockProject;
  onClose: () => void;
}) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [amount, setAmount] = useState('0.1');
  const [status, setStatus] = useState<
    'idle' | 'signing' | 'confirming' | 'success' | 'error'
  >('idle');
  const [txSig, setTxSig] = useState('');
  const [error, setError] = useState('');

  async function handleSupport() {
    if (!wallet.connected || !wallet.publicKey) {
      setVisible(true);
      return;
    }

    const amountSol = parseFloat(amount);
    if (isNaN(amountSol) || amountSol <= 0) {
      setError('Enter a valid SOL amount');
      return;
    }

    try {
      setStatus('signing');
      setError('');
      const signature = await transferSOL(
        wallet,
        project.creator_wallet_address,
        amountSol
      );
      setTxSig(signature);
      setStatus('confirming');

      // Record support in backend
      await fetch(`/api/projects/${project.id}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.publicKey.toBase58(),
          amountSol,
          txSignature: signature,
          amountLamports: Math.floor(amountSol * 1e9),
          builderWalletAddress: project.creator_wallet_address,
        }),
      });

      setStatus('success');
    } catch (e: any) {
      setError(e?.message || 'Transaction failed');
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1a1a1e] border border-white/10 rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <PartyPopper className="w-12 h-12 text-seedGreen mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              You backed {project.title}!
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {amount} SOL sent successfully
            </p>
            {txSig && (
              <a
                href={solscanTxUrl(txSig)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-seedGreen text-sm hover:underline"
              >
                View transaction <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="block w-full mt-6 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-1">
              Support {project.title}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Send SOL directly to the builder on Solana devnet
            </p>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1.5">
                Amount (SOL)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-seedGreen"
              />
              <div className="flex gap-2 mt-2">
                {['0.1', '0.5', '1', '5'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className="px-3 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {v} SOL
                  </button>
                ))}
              </div>
            </div>


            {/* Fee breakdown */}
            {(() => {
              const { fee, builder } = computeFee(parseFloat(amount) || 0);
              return (
                <div className="flex justify-between text-xs text-gray-600 mb-3 px-1">
                  <span>Builder receives</span>
                  <span className="text-gray-400">{builder.toFixed(4)} SOL</span>
                </div>
              );
            })()}
            <div className="flex justify-between text-xs text-gray-600 mb-1 px-1">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-seedGreen/40 inline-block" />
                Seedr fee (0.5%)
              </span>
              <span>{((parseFloat(amount) || 0) * 0.005).toFixed(4)} SOL</span>
            </div>

            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-5">
              <p className="text-xs text-yellow-400/80">
                This is not equity. Your support helps builders bring their
                vision to life. Benefits are at the builder&apos;s discretion.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}

            <button
              onClick={handleSupport}
              disabled={status === 'signing' || status === 'confirming'}
              className="w-full py-3 rounded-xl bg-seedGreen text-black font-semibold text-sm hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'signing' || status === 'confirming' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {status === 'signing'
                    ? 'Waiting for wallet...'
                    : 'Confirming...'}
                </>
              ) : wallet.connected ? (
                `Send ${amount} SOL`
              ) : (
                'Connect Wallet to Support'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
