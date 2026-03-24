import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const {
      walletAddress,
      amountSol,
      txSignature,
      amountLamports,
      builderWalletAddress,
    } = body;

    if (!walletAddress || !amountSol || !txSignature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try DB
    const rows = await query(
      `INSERT INTO supports (project_id, supporter_wallet_address, builder_wallet_address, amount_sol, amount_lamports, tx_signature)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        walletAddress,
        builderWalletAddress || '',
        amountSol,
        amountLamports || Math.floor(amountSol * 1e9),
        txSignature,
      ]
    );

    if (rows && rows.length > 0) {
      // Update project's current_backed_sol
      await query(
        `UPDATE projects SET current_backed_sol = current_backed_sol + $1 WHERE id = $2`,
        [amountSol, id]
      );
      return NextResponse.json({ support: rows[0] });
    }

    // Fallback
    return NextResponse.json({
      support: {
        id: 'mock-support-' + Date.now(),
        project_id: id,
        supporter_wallet_address: walletAddress,
        amount_sol: amountSol,
        tx_signature: txSignature,
        status: 'confirmed',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
