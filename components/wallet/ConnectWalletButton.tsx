'use client';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '@/lib/utils';

export function ConnectWalletButton() {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect, connected } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 hidden sm:inline">
          {shortenAddress(publicKey.toBase58())}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm rounded-xl border border-gray-700 text-gray-300 hover:border-seedGreen hover:text-seedGreen transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="px-5 py-2.5 text-sm font-medium rounded-xl bg-seedGreen text-black hover:bg-green-400 transition-colors"
    >
      Connect Wallet
    </button>
  );
}
