const { ethers, network } = require("hardhat");

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // EDINAR Token contract address (from your .env file)
  const EDINAR_TOKEN_ADDRESS = "0x6dfF40fB1B7db2b75a12EC3d837aCAe953C4fC88";

  // Deploy the staking contract
  const EDINARStaking = await ethers.getContractFactory("EDINARStaking");
  const stakingContract = await EDINARStaking.deploy(EDINAR_TOKEN_ADDRESS);
  await stakingContract.waitForDeployment();

  const stakingAddress = await stakingContract.getAddress();
  console.log("EDINAR Staking contract deployed to:", stakingAddress);

  // Verify the deployment
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Token Address:", EDINAR_TOKEN_ADDRESS);
  console.log("Staking Address:", stakingAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    tokenAddress: EDINAR_TOKEN_ADDRESS,
    stakingAddress: stakingAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment-info.json");

  // Instructions for next steps
  console.log("\nNext Steps:");
  console.log("============");
  console.log("1. Update your .env file with the new staking address:");
  console.log(`   REACT_APP_STAKING_CONTRACT_ADDRESS=${stakingAddress}`);
  console.log("\n2. Fund the staking contract with EDINAR tokens for rewards");
  console.log("3. Test the staking functionality on your frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
