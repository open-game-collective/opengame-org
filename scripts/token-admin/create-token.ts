import { 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo 
} from '@solana/spl-token';
import { loadConfig } from './config';
import { writeFileSync } from 'fs';

async function createToken() {
  const config = loadConfig();
  
  console.log('Creating OGC token mint...');
  
  const mint = await createMint(
    config.connection,
    config.adminKeypair,
    config.adminKeypair.publicKey,
    config.adminKeypair.publicKey,
    9 // decimals
  );

  console.log('Token mint created:', mint.toBase58());

  const adminTokenAccount = await getOrCreateAssociatedTokenAccount(
    config.connection,
    config.adminKeypair,
    mint,
    config.adminKeypair.publicKey
  );

  console.log('Admin token account created:', adminTokenAccount.address.toBase58());

  // Mint initial supply
  await mintTo(
    config.connection,
    config.adminKeypair,
    mint,
    adminTokenAccount.address,
    config.adminKeypair,
    100_000_000_000_000_000 // 100M with 9 decimals
  );

  // Save mint and token account addresses
  const addresses = {
    mint: mint.toBase58(),
    adminTokenAccount: adminTokenAccount.address.toBase58()
  };

  writeFileSync(
    'token-addresses.json',
    JSON.stringify(addresses, null, 2)
  );

  console.log('Initial supply minted successfully');
}

createToken().catch(console.error); 