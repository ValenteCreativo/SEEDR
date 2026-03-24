import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const DEVNET_RPC = 'https://api.devnet.solana.com';

// Seedr treasury — 0.5% protocol fee on every backing tx
export const SEEDR_TREASURY = 'GSit7oLxyt69vUX3Pbf5TbEanH23ZMkT9KwJNYjNn5dK';
export const SEEDR_FEE_BPS  = 50; // 0.5% = 50 basis points

export function getConnection() {
  return new Connection(DEVNET_RPC, 'confirmed');
}

/**
 * Transfer SOL from backer to builder + 0.5% protocol fee to Seedr treasury.
 * Both transfers are atomic in a single transaction — one sig, two instructions.
 *
 * @param amountSol  — total amount user confirms (builder gets 99.5%, treasury 0.5%)
 * @returns tx signature
 */
export async function transferSOL(
  wallet: any,
  toAddress: string,
  amountSol: number
): Promise<string> {
  const connection  = getConnection();
  const totalLamports   = Math.floor(amountSol * LAMPORTS_PER_SOL);
  const feeLamports     = Math.max(1, Math.floor(totalLamports * SEEDR_FEE_BPS / 10000));
  const builderLamports = totalLamports - feeLamports;

  const builderKey  = new PublicKey(toAddress);
  const treasuryKey = new PublicKey(SEEDR_TREASURY);

  const { blockhash } = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: wallet.publicKey,
  })
    .add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey:   builderKey,
        lamports:   builderLamports,
      })
    )
    .add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey:   treasuryKey,
        lamports:   feeLamports,
      })
    );

  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}

/** Helper: compute fee breakdown for UI display */
export function computeFee(amountSol: number) {
  const fee     = amountSol * SEEDR_FEE_BPS / 10000;
  const builder = amountSol - fee;
  return { fee: +fee.toFixed(6), builder: +builder.toFixed(6), bps: SEEDR_FEE_BPS };
}

export { LAMPORTS_PER_SOL };
