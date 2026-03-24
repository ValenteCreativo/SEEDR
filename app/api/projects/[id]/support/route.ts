import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let amountSol: number = 0, txSignature: string = '';
  try {
    const body = await req.json();
    ({ amountSol, txSignature } = body);
    const { walletAddress, amountLamports, builderWalletAddress } = body;

    if (!walletAddress || !amountSol || !txSignature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Upsert user so they exist in DB
    await query(
      `INSERT INTO users (wallet_address, role_preference)
       VALUES ($1, 'backer')
       ON CONFLICT (wallet_address) DO NOTHING`,
      [walletAddress]
    );

    // 2. Upsert project so mock IDs are anchored (idempotent)
    await query(
      `INSERT INTO projects (id, title, creator_wallet_address, funding_goal_sol, current_backed_sol, status)
       VALUES ($1, $2, $3, 1, 0, 'active')
       ON CONFLICT (id) DO NOTHING`,
      [id, id, builderWalletAddress || walletAddress]
    );

    // 3. Record support
    const rows = await query(
      `INSERT INTO supports (project_id, supporter_wallet_address, builder_wallet_address, amount_sol, amount_lamports, tx_signature)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (tx_signature) DO UPDATE SET amount_sol = EXCLUDED.amount_sol
       RETURNING *`,
      [id, walletAddress, builderWalletAddress || '', amountSol, amountLamports || Math.floor(amountSol * 1e9), txSignature]
    );

    // 4. Update project funded amount
    await query(
      `UPDATE projects SET current_backed_sol = current_backed_sol + $1 WHERE id = $2`,
      [amountSol, id]
    );

    return NextResponse.json({ support: rows?.[0] || { id: 'ok', project_id: id, amount_sol: amountSol, tx_signature: txSignature } });
  } catch (e: any) {
    console.error('[support]', e.message);
    // Even on error, return success-ish so UI doesn't break — tx already went through on-chain
    return NextResponse.json({
      support: { id: 'fallback-' + Date.now(), project_id: id, amount_sol: amountSol, tx_signature: txSignature },
      warning: e.message,
    });
  }
}
