# EDINAR Staking Contract Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
1. **MetaMask** with Sepolia testnet configured
2. **Sepolia ETH** for gas fees
3. **EDINAR tokens** for testing
4. **Private key** from your wallet

### Step 1: Install Dependencies
```bash
# Install contract dependencies
npm install --save-dev @nomicfoundation/hardhat-toolbox hardhat
npm install @openzeppelin/contracts dotenv
```

### Step 2: Set Up Environment
Add your private key to `.env` file:
```env
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Step 3: Deploy Contract
```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 4: Update Frontend
After deployment, update your `.env` file with the new staking address:
```env
REACT_APP_STAKING_CONTRACT_ADDRESS=NEW_STAKING_CONTRACT_ADDRESS
```

## 📋 Contract Features

### ✅ **Core Functions**
- **Stake**: Lock EDINAR tokens for rewards
- **Unstake**: Withdraw staked tokens
- **Claim Rewards**: Collect earned rewards
- **Referral System**: 0.5% referral rewards

### ✅ **Staking Parameters**
- **Minimum Stake**: 1 EDINAR
- **APY**: 10% annual yield
- **Referral Reward**: 0.5% of staked amount
- **No Lock Period**: Unstake anytime

### ✅ **Security Features**
- **Reentrancy Protection**: Prevents attack vectors
- **Ownable**: Admin controls
- **Emergency Withdraw**: Owner can withdraw funds
- **Safe Math**: Overflow protection

## 🔧 Contract Addresses

### Current Configuration
- **Token Contract**: `0x6dfF40fB1B7db2b75a12EC3d837aCAe953C4fC88`
- **Staking Contract**: `[Will be generated after deployment]`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111

## 🎯 Testing the Contract

### 1. **Fund the Contract**
After deployment, transfer some EDINAR tokens to the staking contract for rewards:
```javascript
// Transfer tokens to staking contract for rewards
await tokenContract.transfer(stakingAddress, ethers.parseEther("1000"));
```

### 2. **Test Staking**
```javascript
// Approve tokens
await tokenContract.approve(stakingAddress, ethers.parseEther("10"));

// Stake tokens
await stakingContract.stake(ethers.parseEther("10"), ethers.ZeroAddress);
```

### 3. **Test Rewards**
```javascript
// Wait some time, then claim rewards
await stakingContract.claimRewards();
```

## 🔍 Verification

### Etherscan Verification
```bash
npx hardhat verify --network sepolia STAKING_CONTRACT_ADDRESS TOKEN_CONTRACT_ADDRESS
```

### Contract Functions
- `stake(uint256 amount, address referrer)`
- `unstake(uint256 amount)`
- `claimRewards()`
- `getStakedBalance(address user)`
- `getPendingRewards(address user)`
- `getTotalValueLocked()`
- `getStakingAPY()`
- `getActiveStakers()`

## ⚠️ Important Notes

1. **Gas Fees**: Ensure you have enough Sepolia ETH for deployment
2. **Token Approval**: Users must approve tokens before staking
3. **Minimum Stake**: 1 EDINAR minimum required
4. **Rewards**: 10% APY paid in EDINAR tokens
5. **Security**: Contract includes reentrancy protection

## 🆘 Troubleshooting

### Common Issues
1. **Insufficient Gas**: Add more Sepolia ETH
2. **Wrong Network**: Ensure MetaMask is on Sepolia
3. **Token Balance**: Ensure you have EDINAR tokens
4. **Approval**: Approve tokens before staking

### Support
- Check deployment logs in `deployment-info.json`
- Verify contract on Etherscan
- Test with small amounts first
