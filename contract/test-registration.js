const { ethers } = require("hardhat");

async function main() {
  // Get the deployed contract
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const SimpleJobPortal = await ethers.getContractFactory("SimpleJobPortal");
  const contract = SimpleJobPortal.attach(contractAddress);
  
  // Get signers
  const [owner] = await ethers.getSigners();
  
  console.log("Testing contract at:", contractAddress);
  console.log("Using account:", owner.address);
  
  try {
    // Test registration
    console.log("\n=== Testing User Registration ===");
    const tx = await contract.registerUserBasic(
      "Test User",
      "test@example.com",
      0 // JobSeeker
    );
    
    console.log("Registration transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction mined! Gas used:", receipt.gasUsed.toString());
    
    // Check if user was registered
    const user = await contract.users(owner.address);
    console.log("\nUser details:");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("UserType:", user.userType.toString());
    console.log("IsActive:", user.isActive);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });