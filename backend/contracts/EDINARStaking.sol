// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EDINARStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable stakingToken;
    
    // Staking info
    struct Staker {
        uint256 stakedAmount;
        uint256 lastClaimTime;
        uint256 accumulatedRewards;
        uint256 referralRewards;
        uint256 referralCount;
    }
    
    // Staking parameters
    uint256 public constant REWARD_RATE = 200; // 20% APY (200 basis points = 20%)
    uint256 public constant REWARD_PRECISION = 10000;
    uint256 public constant MINIMUM_STAKE = 1e18; // 1 EDINAR minimum
    
    // State variables
    mapping(address => Staker) public stakers;
    address[] public activeStakers;
    uint256 public totalValueLocked;
    uint256 public totalRewardsDistributed;
    
    // Events
    event Staked(address indexed user, uint256 amount, address indexed referrer);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ReferralReward(address indexed referrer, address indexed referee, uint256 amount);
    
    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }
    
    // Staking function
    function stake(uint256 amount, address referrer) external nonReentrant {
        require(amount >= MINIMUM_STAKE, "Minimum stake not met");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        Staker storage staker = stakers[msg.sender];
        
        // Claim existing rewards before staking
        if (staker.stakedAmount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Update staker info
        staker.stakedAmount += amount;
        staker.lastClaimTime = block.timestamp;
        
        // Add to active stakers if first time
        if (staker.stakedAmount == amount) {
            activeStakers.push(msg.sender);
        }
        
        // Handle referral
        if (referrer != address(0) && referrer != msg.sender && stakers[referrer].stakedAmount > 0) {
            uint256 referralReward = amount * 50 / 10000; // 0.5% referral reward
            stakers[referrer].referralRewards += referralReward;
            stakers[referrer].referralCount += 1;
            emit ReferralReward(referrer, msg.sender, referralReward);
        }
        
        totalValueLocked += amount;
        emit Staked(msg.sender, amount, referrer);
    }
    
    // Unstaking function
    function unstake(uint256 amount) external nonReentrant {
        Staker storage staker = stakers[msg.sender];
        require(staker.stakedAmount >= amount, "Insufficient staked amount");
        
        // Claim rewards before unstaking
        _claimRewards(msg.sender);
        
        // Update staker info
        staker.stakedAmount -= amount;
        
        // Remove from active stakers if no longer staking
        if (staker.stakedAmount == 0) {
            _removeFromActiveStakers(msg.sender);
        }
        
        totalValueLocked -= amount;
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }
    
    // Claim rewards function
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    // Internal function to claim rewards
    function _claimRewards(address user) internal {
        Staker storage staker = stakers[user];
        uint256 pendingRewards = getPendingRewards(user);
        
        if (pendingRewards > 0) {
            staker.accumulatedRewards += pendingRewards;
            staker.lastClaimTime = block.timestamp;
            totalRewardsDistributed += pendingRewards;
            
            require(stakingToken.transfer(user, pendingRewards), "Reward transfer failed");
            emit RewardsClaimed(user, pendingRewards);
        }
    }
    
    // View functions
    function getStakedBalance(address user) external view returns (uint256) {
        return stakers[user].stakedAmount;
    }
    
    function getPendingRewards(address user) public view returns (uint256) {
        Staker storage staker = stakers[user];
        if (staker.stakedAmount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - staker.lastClaimTime;
        return (staker.stakedAmount * REWARD_RATE * timeElapsed) / (365 days * REWARD_PRECISION);
    }
    
    function getTotalValueLocked() external view returns (uint256) {
        return totalValueLocked;
    }
    
    function getStakingAPY() external pure returns (uint256) {
        return REWARD_RATE; // Annual percentage yield in basis points
    }
    
    function getActiveStakers() external view returns (uint256) {
        return activeStakers.length;
    }
    
    function getReferralCount(address user) external view returns (uint256) {
        return stakers[user].referralCount;
    }
    
    function getReferralRewards(address user) external view returns (uint256) {
        return stakers[user].referralRewards;
    }
    
    // Helper function to remove from active stakers
    function _removeFromActiveStakers(address user) internal {
        for (uint256 i = 0; i < activeStakers.length; i++) {
            if (activeStakers[i] == user) {
                activeStakers[i] = activeStakers[activeStakers.length - 1];
                activeStakers.pop();
                break;
            }
        }
    }
    
    // Emergency functions (owner only)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        require(stakingToken.transfer(owner(), balance), "Emergency withdrawal failed");
    }
    
    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Rate too high"); // Max 10% APY
        // This would require additional state variable for dynamic rate
    }
}
