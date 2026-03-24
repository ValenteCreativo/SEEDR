import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatSOL(amount: number): string {
  return amount.toFixed(2);
}

export function solscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}
