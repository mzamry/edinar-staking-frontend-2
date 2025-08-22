const { ethers } = require("hardhat");

async function main() {
  const stakingAddress = "0x0448753a4F2502EAbC78e6Abb38C2158Da83Fa4E";
  
  // Get the contract
  const stakingContract = await ethers.getContractAt("EDINARStaking", stakingAddress);
  
  // Get the APY
  const apy = await stakingContract.getStakingAPY();
  console.log("Raw APY from contract:", apy.toString());
  
  // Calculate percentage
  const apyPercentage = parseFloat(apy) / 10;
  console.log("Calculated APY percentage:", apyPercentage + "%");
  
  // Also check the REWARD_RATE constant
  const rewardRate = await stakingContract.REWARD_RATE();
  console.log("REWARD_RATE constant:", rewardRate.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
