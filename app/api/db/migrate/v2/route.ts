import { NextResponse } from 'next/server';
import { query, MIGRATIONS_V2 } from '@/lib/db';

export async function POST() {
  const statements = MIGRATIONS_V2
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  const results: string[] = [];
  const errors: string[] = [];

  for (const stmt of statements) {
    try {
      await query(stmt + ';');
      results.push(stmt.slice(0, 60));
    } catch (e: any) {
      errors.push(e.message.slice(0, 80));
    }
  }

  return NextResponse.json({ success: true, applied: results.length, errors });
}

export async function GET() {
  return NextResponse.json({ message: 'POST to run v2 migrations' });
}
