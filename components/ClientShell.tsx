'use client';

import { SeedrWalletProvider } from '@/components/wallet/WalletProvider';
import { Navigation } from '@/components/ui/Navigation';
import { WakuProvider } from '@/components/waku/WakuProvider';

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SeedrWalletProvider>
      <WakuProvider>
        <Navigation />
        <main className="pt-16 min-h-screen">{children}</main>
      </WakuProvider>
    </SeedrWalletProvider>
  );
}
