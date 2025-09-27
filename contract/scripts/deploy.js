const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SimpleJobPortal contract...");

  // Get the contract factory
  const SimpleJobPortal = await ethers.getContractFactory("SimpleJobPortal");

  // Deploy the contract
  const jobPortal = await SimpleJobPortal.deploy();
  
  // Wait for deployment to finish
  await jobPortal.waitForDeployment();

  const address = await jobPortal.getAddress();
  console.log("SimpleJobPortal deployed to:", address);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Verify contract deployment by calling some view functions
  console.log("\n--- Contract Verification ---");
  console.log("Owner:", await jobPortal.owner());
  console.log("Job ID Counter:", await jobPortal.jobIdCounter());
  console.log("Application ID Counter:", await jobPortal.applicationIdCounter());
  console.log("Backend Address:", await jobPortal.backendAddress());

  return jobPortal;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });