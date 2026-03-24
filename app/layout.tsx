import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientShell } from '@/components/ClientShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seedr — Swipe Ideas. Back Builders.',
  description:
    'Discover and support early-stage projects on Solana. Swipe to find your next favorite project.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
