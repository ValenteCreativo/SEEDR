'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/builder', label: 'Builder' },
  { href: '/profile', label: 'Profile' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-graphite/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <Sprout className="w-6 h-6 text-seedGreen" />
            Seedr
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-seedGreen bg-seedGreen/10'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <ConnectWalletButton />
      </div>
    </nav>
  );
}
