import { 
  getOrCreateAssociatedTokenAccount,
  transfer
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { loadConfig } from './config';
import { GuildMember } from 'discord.js';

interface DiscordWalletMapping {
  discordId: string;
  walletAddress: string;
}

// Load wallet mappings from database/file
async function getWalletMappings(): Promise<DiscordWalletMapping[]> {
  // TODO: Implement loading from your database
  return [];
}

async function calculateAirdropAmount(member: GuildMember): Promise<number> {
  const config = loadConfig();
  let totalAmount = 0;

  // Sum up tokens based on member's roles
  for (const role of member.roles.cache.values()) {
    if (config.discord.roleAllocations[role.id]) {
      totalAmount += config.discord.roleAllocations[role.id];
    }
  }

  return totalAmount;
}

export async function airdropToDiscordMembers() {
  const config = loadConfig();
  
  if (!config.mint) throw new Error('Token mint not configured');

  // Login to Discord
  await config.discord.client.login(process.env.DISCORD_BOT_TOKEN);
  
  // Get the guild
  const guild = await config.discord.client.guilds.fetch(config.discord.guildId);
  
  // Get all members
  const members = await guild.members.fetch();
  
  // Get wallet mappings
  const walletMappings = await getWalletMappings();
  
  // Process each member
  for (const [memberId, member] of members) {
    try {
      // Find wallet mapping
      const mapping = walletMappings.find(m => m.discordId === memberId);
      if (!mapping) {
        console.log(`No wallet mapped for Discord user ${memberId}`);
        continue;
      }

      // Calculate airdrop amount based on roles
      const amount = await calculateAirdropAmount(member);
      if (amount === 0) continue;

      // Create recipient token account
      const recipientPublicKey = new PublicKey(mapping.walletAddress);
      const recipientAccount = await getOrCreateAssociatedTokenAccount(
        config.connection,
        config.adminKeypair,
        config.mint,
        recipientPublicKey
      );

      // Transfer tokens
      await transfer(
        config.connection,
        config.adminKeypair,
        config.adminTokenAccount!,
        recipientAccount.address,
        config.adminKeypair,
        amount
      );

      console.log(`Airdropped ${amount} tokens to Discord user ${memberId}`);
    } catch (error) {
      console.error(`Error processing member ${memberId}:`, error);
    }
  }

  // Cleanup
  config.discord.client.destroy();
} 