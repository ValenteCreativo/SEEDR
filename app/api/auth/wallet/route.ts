import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getMockUser } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }

    // Try DB upsert
    const rows = await query(
      `INSERT INTO users (wallet_address)
       VALUES ($1)
       ON CONFLICT (wallet_address) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [walletAddress]
    );

    if (rows && rows.length > 0) {
      return NextResponse.json({ user: rows[0] });
    }

    // Fallback to mock
    return NextResponse.json({ user: getMockUser(walletAddress) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
