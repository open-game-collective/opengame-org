# Discord Bot Implementation for OGC Token

## Overview
This document outlines the implementation of Discord bot commands for the OGC token system, focusing on wallet connection and token distribution functionality.

## Core Components

### 1. Environment Variables Required
```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
```

### 2. Storage Interface
```typescript
interface WalletMapping {
  discordId: string;
  walletAddress: string;
  roles: string[];
  mappingDate: Date;
  lastAirdropDate?: Date;
}

interface WalletMappingStorage {
  set(discordId: string, mapping: WalletMapping): Promise<void>;
  get(discordId: string): Promise<WalletMapping | null>;
  list(): Promise<WalletMapping[]>;
}
```

## Commands Implementation

### 1. Connect Wallet Command
- **Command**: `/connect-wallet <wallet_address>`
- **Description**: Links a user's Discord account to their Solana wallet
- **Security Measures**:
  - Validates Solana address format
  - Prevents duplicate wallet connections
  - Prevents multiple wallets per Discord user
  - Stores role information at time of connection

### 2. Claim Airdrop Command
- **Command**: `/claim-airdrop`
- **Description**: Allows users to claim tokens based on their roles
- **Features**:
  - Role-based token allocation
  - Weekly cooldown period
  - Automatic amount calculation
  - Transaction verification

## Installation Steps

1. **Install Dependencies**
```bash
npm install @discordjs/builders discord.js @solana/web3.js @solana/spl-token
```

2. **Register Commands**
```bash
# Run the registration script
node scripts/discord/register-commands.ts
```

## Usage Examples

### Connecting a Wallet
```typescript
// User interaction
/connect-wallet 7fB6c6jmUhm8fQhZxkP2WEzNxBKJbr7BgbJqz8FhL1X9

// Success response
✅ Successfully connected wallet 7fB6c6jmUhm8fQhZxkP2WEzNxBKJbr7BgbJqz8FhL1X9
```

### Claiming Airdrop
```typescript
// User interaction
/claim-airdrop

// Success response
✅ Successfully sent 100,000 OGC tokens to your wallet!
```

## Error Handling

### Common Error Scenarios
1. Invalid wallet address
2. Duplicate wallet connection
3. Rate limit exceeded
4. Insufficient role permissions
5. Failed transactions

### Error Response Examples
```typescript
// Invalid wallet
❌ Invalid Solana wallet address provided.

// Duplicate wallet
❌ This wallet address is already connected to another Discord account.

// Rate limit
❌ You can only claim an airdrop once per week.
```

## Security Considerations

### 1. Input Validation
- All wallet addresses are validated against Solana's PublicKey format
- Role verification before processing airdrops
- Transaction amount validation

### 2. Rate Limiting
- Weekly cooldown on airdrops
- Transaction amount caps based on roles
- Monitoring for suspicious activity

### 3. Data Storage
- Secure storage of wallet mappings
- Role snapshot at time of connection
- Audit trail of distributions

## Monitoring and Maintenance

### 1. Health Checks
- Bot connection status
- Command response times
- Storage system availability

### 2. Metrics to Track
```typescript
interface BotMetrics {
  totalWalletsConnected: number;
  totalAirdropsProcessed: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
}
```

### 3. Logging
```typescript
// Example logging implementation
function logTransaction(type: 'CONNECT' | 'AIRDROP', data: any) {
  console.log({
    timestamp: new Date(),
    type,
    data,
    userId: data.discordId,
    status: 'SUCCESS'
  });
}
```

## Testing Strategy

### 1. Unit Tests
```typescript
describe('Wallet Connection', () => {
  it('should validate wallet address');
  it('should prevent duplicates');
  it('should store role information');
});

describe('Airdrop Claims', () => {
  it('should respect cooldown periods');
  it('should calculate correct amounts');
  it('should handle failed transactions');
});
```

### 2. Integration Tests
- End-to-end command testing
- Role-based permission testing
- Transaction verification
- Storage system integration

## Deployment Checklist

1. Environment Setup
   - [ ] Configure environment variables
   - [ ] Set up storage system
   - [ ] Configure Solana connection

2. Bot Configuration
   - [ ] Register bot application
   - [ ] Set up required permissions
   - [ ] Register slash commands

3. Testing
   - [ ] Run unit tests
   - [ ] Perform integration testing
   - [ ] Verify error handling

4. Monitoring
   - [ ] Set up logging
   - [ ] Configure alerts
   - [ ] Establish backup procedures

## Troubleshooting Guide

### Common Issues and Solutions

1. **Bot Not Responding**
   - Check Discord token validity
   - Verify bot permissions
   - Check connection status

2. **Failed Transactions**
   - Verify wallet balance
   - Check network status
   - Validate transaction parameters

3. **Storage Issues**
   - Check storage connection
   - Verify data integrity
   - Monitor storage capacity

## Future Improvements

1. **Feature Enhancements**
   - Multi-wallet support
   - Advanced role management
   - Transaction history command

2. **Security Updates**
   - Multi-factor authentication
   - Enhanced rate limiting
   - Fraud detection system

3. **Performance Optimizations**
   - Caching implementation
   - Batch processing
   - Response time improvements 