import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const DEVNET_RPC = 'https://api.devnet.solana.com';

export function getConnection() {
  return new Connection(DEVNET_RPC, 'confirmed');
}

export async function transferSOL(
  wallet: any,
  toAddress: string,
  amountSol: number
): Promise<string> {
  const connection = getConnection();
  const toPubkey = new PublicKey(toAddress);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  const { blockhash } = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: wallet.publicKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey,
      lamports,
    })
  );

  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}

export { LAMPORTS_PER_SOL };
