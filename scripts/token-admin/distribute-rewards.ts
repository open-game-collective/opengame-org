import { 
  getOrCreateAssociatedTokenAccount,
  transfer
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { loadConfig } from './config';

export async function distributeReward(
  recipientAddress: string,
  amount: number
) {
  const config = loadConfig();
  
  if (!config.mint) throw new Error('Token mint not configured');
  
  const recipientPublicKey = new PublicKey(recipientAddress);
  
  const recipientAccount = await getOrCreateAssociatedTokenAccount(
    config.connection,
    config.adminKeypair,
    config.mint,
    recipientPublicKey
  );

  await transfer(
    config.connection,
    config.adminKeypair,
    config.adminTokenAccount!,
    recipientAccount.address,
    config.adminKeypair,
    amount
  );

  console.log(`Transferred ${amount} tokens to ${recipientAddress}`);
} 