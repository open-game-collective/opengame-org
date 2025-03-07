import { 
  getOrCreateAssociatedTokenAccount,
  transfer 
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { loadConfig } from './config';

interface VestingSchedule {
  recipient: string;
  totalAmount: number;
  cliff: number; // seconds
  duration: number; // seconds
  releaseFrequency: number; // seconds
}

export async function setupVesting(schedule: VestingSchedule) {
  const config = loadConfig();
  
  if (!config.mint) throw new Error('Token mint not configured');
  
  const recipientPublicKey = new PublicKey(schedule.recipient);
  
  // Create vesting account
  const vestingAccount = await getOrCreateAssociatedTokenAccount(
    config.connection,
    config.adminKeypair,
    config.mint,
    recipientPublicKey
  );

  // Transfer initial tokens to vesting
  await transfer(
    config.connection,
    config.adminKeypair,
    config.adminTokenAccount!,
    vestingAccount.address,
    config.adminKeypair,
    schedule.totalAmount
  );

  // Save vesting schedule
  // Note: In production, this should be stored in a secure database
  const vestingInfo = {
    account: vestingAccount.address.toBase58(),
    schedule
  };

  console.log('Vesting setup complete:', vestingInfo);
} 