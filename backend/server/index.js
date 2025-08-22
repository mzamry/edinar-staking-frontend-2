const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_RPC_URL);

// Contract addresses
const TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS;
const STAKING_ADDRESS = process.env.REACT_APP_STAKING_CONTRACT_ADDRESS;

// Contract ABIs (simplified)
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

const STAKING_ABI = [
  "function getTotalValueLocked() view returns (uint256)",
  "function getStakingAPY() view returns (uint256)",
  "function getActiveStakers() view returns (uint256)",
  "function getStakedBalance(address user) view returns (uint256)",
  "function getPendingRewards(address user) view returns (uint256)"
];

// Initialize contracts
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
const stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, provider);

// API Routes
app.get('/api/platform-stats', async (req, res) => {
  try {
    const [tvl, apy, stakers] = await Promise.all([
      stakingContract.getTotalValueLocked(),
      stakingContract.getStakingAPY(),
      stakingContract.getActiveStakers()
    ]);

    res.json({
      totalValueLocked: ethers.formatEther(tvl),
      stakingAPY: ethers.formatEther(apy),
      activeStakers: stakers.toString()
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

app.get('/api/user-stats/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const [balance, staked, rewards] = await Promise.all([
      tokenContract.balanceOf(address),
      stakingContract.getStakedBalance(address),
      stakingContract.getPendingRewards(address)
    ]);

    res.json({
      tokenBalance: ethers.formatEther(balance),
      stakedBalance: ethers.formatEther(staked),
      pendingRewards: ethers.formatEther(rewards)
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

app.get('/api/token-info', async (req, res) => {
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);

    res.json({
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.formatEther(totalSupply)
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Platform: E-DINAR Staking Platform`);
  console.log(`Network: ${process.env.REACT_APP_NETWORK_NAME}`);
  console.log(`Token Contract: ${TOKEN_ADDRESS}`);
  console.log(`Staking Contract: ${STAKING_ADDRESS}`);
});
