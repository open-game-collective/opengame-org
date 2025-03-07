import { loadConfig } from './config';

export async function getRoleStats() {
  const config = loadConfig();
  
  await config.discord.client.login(process.env.DISCORD_BOT_TOKEN);
  
  const guild = await config.discord.client.guilds.fetch(config.discord.guildId);
  const members = await guild.members.fetch();
  
  // Count members per role
  const roleCounts = new Map<string, number>();
  const potentialAirdropTotal = new Map<string, number>();
  
  for (const [roleId, amount] of Object.entries(config.discord.roleAllocations)) {
    const role = await guild.roles.fetch(roleId);
    if (role) {
      const memberCount = members.filter(m => m.roles.cache.has(roleId)).size;
      roleCounts.set(role.name, memberCount);
      potentialAirdropTotal.set(role.name, memberCount * amount);
    }
  }

  console.log('\nRole Distribution:');
  for (const [roleName, count] of roleCounts) {
    console.log(`${roleName}: ${count} members`);
    console.log(`Potential airdrop: ${potentialAirdropTotal.get(roleName)} tokens`);
  }

  const totalTokens = Array.from(potentialAirdropTotal.values())
    .reduce((a, b) => a + b, 0);
  console.log(`\nTotal potential airdrop: ${totalTokens} tokens`);

  config.discord.client.destroy();
} 