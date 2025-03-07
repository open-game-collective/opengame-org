import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { Client, GatewayIntentBits } from 'discord.js';

export interface TokenConfig {
  connection: Connection;
  adminKeypair: Keypair;
  mint?: PublicKey;
  adminTokenAccount?: PublicKey;
  discord: {
    client: Client;
    guildId: string;
    roleAllocations: {
      [roleId: string]: number; // Role ID -> token amount
    };
  };
}

// Load environment-specific configuration
export function loadConfig(): TokenConfig {
  // You'll need to create this JSON file securely
  const adminKeyfile = JSON.parse(
    readFileSync('admin-keypair.json', 'utf-8')
  );

  // Initialize Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages
    ]
  });

  // Discord role -> token allocation mapping
  const roleAllocations = {
    'founder': 250_000,      // Founder role ID -> 250k tokens
    'alpha_tester': 100_000, // Alpha tester role ID -> 100k tokens
    'beta_tester': 50_000,   // Beta tester role ID -> 50k tokens
    'community': 10_000      // Community role ID -> 10k tokens
  };

  return {
    connection: new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    ),
    adminKeypair: Keypair.fromSecretKey(
      new Uint8Array(adminKeyfile)
    ),
    discord: {
      client,
      guildId: process.env.DISCORD_GUILD_ID!,
      roleAllocations
    }
  };
} 