const hre = require("hardhat");

async function main() {
  console.log("Deploying SBTUNI contract...");

  // Get the contract factory
  const SBTUNI = await hre.ethers.getContractFactory("SBTUNI");

  // Deploy the contract
  const universityName = "Harvard University";
  const universitySymbol = "HARVARD";
  
  console.log(`Deploying with name: "${universityName}" and symbol: "${universitySymbol}"`);
  
  const sbtuni = await SBTUNI.deploy(universityName, universitySymbol);
  
  await sbtuni.deployed();
  
  console.log(`SBTUNI deployed to: ${sbtuni.address}`);
  
  // Verify deployment
  console.log("\nVerifying deployment...");
  const name = await sbtuni.name();
  const symbol = await sbtuni.symbol();
  const owner = await sbtuni.owner();
  const totalSupply = await sbtuni.totalSupply();
  
  console.log(`Contract Name: ${name}`);
  console.log(`Contract Symbol: ${symbol}`);
  console.log(`Contract Owner: ${owner}`);
  console.log(`Total Supply: ${totalSupply}`);
  
  return sbtuni;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });