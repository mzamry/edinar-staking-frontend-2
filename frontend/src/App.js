import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Contract ABIs (simplified for demo)
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

const STAKING_ABI = [
  "function stake(uint256 amount, address referrer) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getStakedBalance(address user) view returns (uint256)",
  "function getPendingRewards(address user) view returns (uint256)",
  "function getTotalValueLocked() view returns (uint256)",
  "function getStakingAPY() view returns (uint256)",
  "function getActiveStakers() view returns (uint256)",
  "function getReferralCount(address user) view returns (uint256)",
  "function getReferralRewards(address user) view returns (uint256)"
];

function App() {
  // Debug: Log environment variables
  console.log('Token Address:', process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS);
  console.log('Staking Address:', process.env.REACT_APP_STAKING_CONTRACT_ADDRESS);
  // Disconnect wallet handler
  const disconnectWallet = () => {
    setAccount('');
    setProvider(null);
    setSigner(null);
    setTokenContract(null);
    setStakingContract(null);
  };
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  
  // State for balances and data
  const [tokenBalance, setTokenBalance] = useState('0');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [pendingRewards, setPendingRewards] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [totalValueLocked, setTotalValueLocked] = useState('0');
  const [stakingAPY, setStakingAPY] = useState('0');
  const [activeStakers, setActiveStakers] = useState('0');
  const [isRewardsLive, setIsRewardsLive] = useState(false);
  const [rewardRatePerSecond, setRewardRatePerSecond] = useState('0');

  
  // Form states
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Contract addresses from environment
  const TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS;
  const STAKING_ADDRESS = process.env.REACT_APP_STAKING_CONTRACT_ADDRESS;
  const LOGO_URL = process.env.REACT_APP_LOGO_URL;

  useEffect(() => {
    initializeWeb3();
  }, []);

  useEffect(() => {
    if (account && tokenContract && stakingContract) {
      loadData();
    }
  }, [account, tokenContract, stakingContract]);

  // Real-time rewards update every second
  useEffect(() => {
    let rewardsInterval;
    
    if (account && stakingContract && stakedBalance !== '0') {
      // Update rewards immediately
      updateRewardsRealTime();
      
      // Set up interval to update rewards every second
      rewardsInterval = setInterval(() => {
        updateRewardsRealTime();
      }, 1000);
    } else {
      setIsRewardsLive(false);
    }
    
    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (rewardsInterval) {
        clearInterval(rewardsInterval);
      }
    };
  }, [account, stakingContract, stakedBalance]);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const connectWallet = async () => {
    try {
      // Create provider if not exists
      if (!provider) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
      }
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const account = accounts[0];
      setAccount(account);
      
      // Get the current provider (either existing or newly created)
      const currentProvider = provider || new ethers.BrowserProvider(window.ethereum);
      const signer = await currentProvider.getSigner();
      setSigner(signer);
      
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      
      setTokenContract(tokenContract);
      setStakingContract(stakingContract);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

     const loadData = async () => {
     try {
       if (!tokenContract) {
         console.log('Token contract not available');
         return;
       }
       
       // Load token balance
       const balance = await tokenContract.balanceOf(account);
       setTokenBalance(ethers.formatEther(balance));
       
       // Load allowance
       const allowance = await tokenContract.allowance(account, STAKING_ADDRESS);
       setAllowance(ethers.formatEther(allowance));
       
       if (stakingContract) {
         try {
           // Load staked balance
           const staked = await stakingContract.getStakedBalance(account);
           setStakedBalance(ethers.formatEther(staked));
           
           // Load pending rewards
           const rewards = await stakingContract.getPendingRewards(account);
           setPendingRewards(ethers.formatEther(rewards));
           
           // Load platform stats
           const tvl = await stakingContract.getTotalValueLocked();
           setTotalValueLocked(ethers.formatEther(tvl));
           
                                   const apy = await stakingContract.getStakingAPY();
            console.log('Raw APY from contract:', apy.toString()); // Debug log
            const apyPercentage = (parseFloat(apy) / 10).toString(); // Convert basis points to percentage (200 -> 20%)
            console.log('Calculated APY percentage:', apyPercentage); // Debug log
            setStakingAPY(apyPercentage);
            
            // Calculate reward rate per second
            if (staked !== '0') {
              const rewardRatePerSec = (parseFloat(ethers.formatEther(staked)) * parseFloat(apyPercentage) / 100) / (365 * 24 * 3600);
              setRewardRatePerSecond(rewardRatePerSec.toString());
            } else {
              setRewardRatePerSecond('0');
            }
            
            const stakers = await stakingContract.getActiveStakers();
            setActiveStakers(stakers.toString());
         } catch (stakingError) {
           console.log('Staking contract not available or not deployed yet');
           setStakedBalance('0');
           setPendingRewards('0');
           setTotalValueLocked('0');
           setStakingAPY('0');
           setActiveStakers('0');
         }
       } else {
         setStakedBalance('0');
         setPendingRewards('0');
         setTotalValueLocked('0');
         setStakingAPY('0');
         setActiveStakers('0');
       }
       
     } catch (error) {
       console.error('Error loading data:', error);
     }
   };

       // Real-time rewards update function
    const updateRewardsRealTime = async () => {
      try {
        if (!stakingContract || !account || stakedBalance === '0') {
          setIsRewardsLive(false);
          return;
        }
        
        // Only update pending rewards (faster than full data load)
        const rewards = await stakingContract.getPendingRewards(account);
        setPendingRewards(ethers.formatEther(rewards));
        
        // Update reward rate per second in real-time
        if (parseFloat(stakingAPY) > 0) {
          const rewardRatePerSec = (parseFloat(stakedBalance) * parseFloat(stakingAPY) / 100) / (365 * 24 * 3600);
          setRewardRatePerSecond(rewardRatePerSec.toString());
        }
        
        setIsRewardsLive(true);
      } catch (error) {
        // Silently handle errors for real-time updates
        console.log('Real-time rewards update error:', error.message);
        setIsRewardsLive(false);
      }
    };

  const approveTokens = async () => {
    try {
      if (!tokenContract) {
        alert('Please connect your wallet first!');
        return;
      }
      
      const amount = ethers.parseEther(stakeAmount);
      const tx = await tokenContract.approve(STAKING_ADDRESS, amount);
      await tx.wait();
      await loadData();
      alert('Approval successful!');
    } catch (error) {
      console.error('Error approving tokens:', error);
      alert('Error approving tokens: ' + error.message);
    }
  };

     const stakeTokens = async () => {
     try {
       if (!tokenContract || !stakingContract) {
         alert('Please connect your wallet first!');
         return;
       }
       
       const amount = ethers.parseEther(stakeAmount);
       
       // First check if we need to approve tokens
       const currentAllowance = await tokenContract.allowance(account, STAKING_ADDRESS);
       if (currentAllowance < amount) {
         alert('Please approve tokens first!');
         return;
       }
       
       const tx = await stakingContract.stake(amount, ethers.ZeroAddress);
       await tx.wait();
       
       setStakeAmount('');
       await loadData();
       alert('Staking successful!');
     } catch (error) {
       console.error('Error staking tokens:', error);
       if (error.message.includes('execution reverted')) {
         alert('Contract error: Please make sure you have approved tokens and the contract is deployed on Sepolia testnet.');
       } else {
         alert('Error staking tokens: ' + error.message);
       }
     }
   };

  const unstakeTokens = async () => {
    try {
      const amount = ethers.parseEther(unstakeAmount);
      const tx = await stakingContract.unstake(amount);
      await tx.wait();
      
      setUnstakeAmount('');
      await loadData();
      alert('Unstaking successful!');
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      alert('Error unstaking tokens');
    }
  };

  const claimRewards = async () => {
    try {
      const tx = await stakingContract.claimRewards();
      await tx.wait();
      
      await loadData();
      alert('Rewards claimed successfully!');
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Error claiming rewards');
    }
  };

  

  return (
    <div className="min-h-screen bg-black text-gold">
      {/* Header */}
      <header className="bg-black border-b border-gold p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          <h1 className="text-3xl font-bold text-gold">E-DINAR Staking Platform</h1>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={LOGO_URL} 
              alt="E-DINAR Logo" 
              className="w-24 h-24 rounded-full border-2 border-gold logo-animated"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={connectWallet}
              className="btn-gold text-lg px-8 py-3"
            >
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </button>
            {account && (
              <button
                onClick={disconnectWallet}
                className="btn-gold text-lg px-8 py-3 bg-red-600 hover:bg-red-700"
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 pt-12">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black border-gold rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Total Value Locked</h3>
            <p className="text-2xl font-bold">${(parseFloat(totalValueLocked) * 1.2).toFixed(2)}M</p>
          </div>
                     <div className="bg-black border-gold rounded-lg p-6 text-center">
             <h3 className="text-lg font-semibold mb-2">Staking APY</h3>
             <p className="text-2xl font-bold">{parseFloat(stakingAPY)}%</p>
           </div>
          <div className="bg-black border-gold rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Active Stakers</h3>
            <p className="text-2xl font-bold">{parseInt(activeStakers).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staking Operations */}
          <div className="bg-black border-gold rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Staking Operations</h2>
            
            {/* Stake Tokens */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Stake Tokens</h3>
              <div className="space-y-4">
                                 <input
                   type="number"
                   placeholder="Amount to stake"
                   value={stakeAmount}
                   onChange={(e) => setStakeAmount(e.target.value)}
                   className="input-gold w-full"
                 />
                                 <div className="space-y-2">
                   <button 
                     onClick={approveTokens}
                     className="btn-gold w-full"
                     disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                   >
                     Approve EDINAR
                   </button>
                   <button 
                     onClick={stakeTokens}
                     className="btn-gold w-full"
                     disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                   >
                     Stake EDINAR
                   </button>
                 </div>
              </div>
            </div>

            {/* Unstake Tokens */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Unstake Tokens</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Amount to unstake"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="input-gold w-full"
                />
                <button 
                  onClick={unstakeTokens}
                  className="btn-gold w-full"
                  disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0}
                >
                  Unstake
                </button>
              </div>
            </div>

            {/* Claim Rewards */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Claim Rewards</h3>
              <div className="space-y-4">
                <div className="bg-green-900 border-green-500 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-green-300">Pending Rewards: {parseFloat(pendingRewards).toFixed(6)} EDINAR</p>
                    {isRewardsLive && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm font-medium">LIVE</span>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={claimRewards}
                  className="btn-gold w-full"
                  disabled={parseFloat(pendingRewards) <= 0}
                >
                  Claim Rewards
                </button>
              </div>
            </div>
          </div>

          {/* Your Stake Information */}
          <div className="bg-black border-gold rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Your Stake Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Token Name:</span>
                <span>e-Dinar</span>
              </div>
              <div className="flex justify-between">
                <span>Token Symbol:</span>
                <span>EDINAR</span>
              </div>
              <div className="flex justify-between">
                <span>Staked Amount:</span>
                <span>{parseFloat(stakedBalance).toFixed(6)} EDINAR</span>
              </div>
              <div className="flex justify-between">
                <span>Wallet Balance:</span>
                <span>{parseFloat(tokenBalance).toFixed(6)} EDINAR</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Rewards:</span>
                <div className="flex items-center space-x-2">
                  <span>{parseFloat(pendingRewards).toFixed(6)} EDINAR</span>
                  {isRewardsLive && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs">LIVE</span>
                    </div>
                  )}
                </div>
              </div>
                             <div className="flex justify-between">
                 <span>Reward Rate:</span>
                 <span>{parseFloat(rewardRatePerSecond).toFixed(8)} EDINAR/sec</span>
               </div>
                             <div className="flex justify-between">
                 <span>APY:</span>
                 <span>{parseFloat(stakingAPY)}%</span>
               </div>
              <div className="flex justify-between">
                <span>Last Claim Time:</span>
                <span>Never</span>
              </div>
              <div className="flex justify-between">
                <span>Total Value Locked:</span>
                <span>{parseFloat(totalValueLocked).toFixed(6)} EDINAR</span>
              </div>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  );
}

export default App;
