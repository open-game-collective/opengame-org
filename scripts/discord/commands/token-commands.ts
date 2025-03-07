// import { SlashCommandBuilder } from '@discordjs/builders';
// import { CommandInteraction } from 'discord.js';
// import { PublicKey } from '@solana/web3.js';
// import { WalletMapping, WalletMappingStorage } from '../types';
// import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
// import { DEFAULT_CONFIG } from '../../token-admin/config';

// // Storage instance should be initialized at app startup
// let walletMappingStorage: WalletMappingStorage;

// export const connectWalletCommand = {
//   data: new SlashCommandBuilder()
//     .setName('connect-wallet')
//     .setDescription('Connect your Solana wallet to receive OGC tokens')
//     .addStringOption(option =>
//       option
//         .setName('wallet')
//         .setDescription('Your Solana wallet address')
//         .setRequired(true)
//     ),
//   async execute(interaction: CommandInteraction) {
//     await interaction.deferReply({ ephemeral: true });
    
//     try {
//       const walletAddress = interaction.options.getString('wallet', true);
      
//       // Validate Solana address
//       try {
//         new PublicKey(walletAddress);
//       } catch {
//         return await interaction.editReply('Invalid Solana wallet address provided.');
//       }

//       // Check for existing mapping
//       const existingMapping = await walletMappingStorage.get(interaction.user.id);
//       if (existingMapping) {
//         return await interaction.editReply('You have already connected a wallet. Please contact an admin to update your wallet address.');
//       }

//       // Check for duplicate wallet
//       const isDuplicate = await checkDuplicateWallet(walletAddress);
//       if (isDuplicate) {
//         return await interaction.editReply('This wallet address is already connected to another Discord account.');
//       }

//       // Create new mapping
//       const mapping: WalletMapping = {
//         discordId: interaction.user.id,
//         walletAddress,
//         roles: Array.from(interaction.member?.roles?.cache.keys() || []),
//         mappingDate: new Date()
//       };

//       await walletMappingStorage.set(interaction.user.id, mapping);
      
//       await interaction.editReply(`Successfully connected wallet ${walletAddress}`);
//     } catch (error) {
//       console.error('Error in connectWallet:', error);
//       await interaction.editReply('Failed to connect wallet. Please try again later.');
//     }
//   }
// };

// export const claimAirdropCommand = {
//   data: new SlashCommandBuilder()
//     .setName('claim-airdrop')
//     .setDescription('Claim your OGC token airdrop based on your roles'),
//   async execute(interaction: CommandInteraction) {
//     await interaction.deferReply({ ephemeral: true });

//     try {
//       // Get wallet mapping
//       const mapping = await walletMappingStorage.get(interaction.user.id);
//       if (!mapping) {
//         return await interaction.editReply('Please connect your wallet first using /connect-wallet');
//       }

//       // Check last airdrop date
//       if (mapping.lastAirdropDate) {
//         const daysSinceLastAirdrop = (Date.now() - mapping.lastAirdropDate.getTime()) / (1000 * 60 * 60 * 24);
//         if (daysSinceLastAirdrop < 7) { // Weekly cooldown
//           return await interaction.editReply('You can only claim an airdrop once per week.');
//         }
//       }

//       // Calculate airdrop amount based on roles
//       const amount = calculateAirdropAmount(mapping.roles);
//       if (amount <= 0) {
//         return await interaction.editReply('You do not have any eligible roles for an airdrop.');
//       }

//       // Perform the transfer
//       await transferTokens(mapping.walletAddress, amount);

//       // Update last airdrop date
//       mapping.lastAirdropDate = new Date();
//       await walletMappingStorage.set(interaction.user.id, mapping);

//       await interaction.editReply(`Successfully sent ${amount} OGC tokens to your wallet!`);
//     } catch (error) {
//       console.error('Error in claimAirdrop:', error);
//       await interaction.editReply('Failed to process airdrop. Please try again later.');
//     }
//   }
// };

// // Helper functions
// async function checkDuplicateWallet(walletAddress: string): Promise<boolean> {
//   const mappings = await walletMappingStorage.list();
//   return mappings.some(m => m.walletAddress === walletAddress);
// }

// function calculateAirdropAmount(roles: string[]): number {
//   let amount = 0;
//   const { roleAllocations } = DEFAULT_CONFIG.discord;
  
//   for (const role of roles) {
//     if (roleAllocations[role]) {
//       amount += roleAllocations[role];
//     }
//   }
  
//   return amount;
// }

// async function transferTokens(recipientWallet: string, amount: number) {
//   // Implementation will depend on your specific token transfer setup
//   // This is a placeholder for the actual transfer logic
//   const recipientPubkey = new PublicKey(recipientWallet);
  
//   // Get or create recipient's token account
//   const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
//     connection,
//     adminKeypair,
//     mint,
//     recipientPubkey
//   );

//   // Transfer tokens
//   await transfer(
//     connection,
//     adminKeypair,
//     adminTokenAccount.address,
//     recipientTokenAccount.address,
//     adminKeypair,
//     amount
//   );
// } 