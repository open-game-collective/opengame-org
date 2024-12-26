import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { connectWalletCommand, claimAirdropCommand } from './commands/token-commands';

const commands = [
  connectWalletCommand.data.toJSON(),
  claimAirdropCommand.data.toJSON()
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

export async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_GUILD_ID!
      ),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
} 