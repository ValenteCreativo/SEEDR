'use client';

import { SeedrWalletProvider } from '@/components/wallet/WalletProvider';
import { Navigation } from '@/components/ui/Navigation';

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SeedrWalletProvider>
      <Navigation />
      <main className="pt-16 min-h-screen">{children}</main>
    </SeedrWalletProvider>
  );
}
