import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Check for required environment variables
const requiredEnvVars = ['INFURA_API_KEY', 'PRIVATE_KEY', 'PUBLIC_RESOLVER_ADDRESS', 'ENS_DOMAIN_NAME', 'VERCEL_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please check your .env file and make sure all required variables are set.');
    process.exit(1);
  }
}

// Sepolia RPC (Infura/Alchemy or public one)
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);

// Your wallet (Sepolia ETH required for gas)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ENS registry & resolver addresses (Sepolia)
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"; // same as mainnet
const PUBLIC_RESOLVER = process.env.PUBLIC_RESOLVER_ADDRESS; // resolver address on Sepolia (get from ENS docs/etherscan)

// Example: update "url" text record for your ENS name
async function main() {
  const name = process.env.ENS_DOMAIN_NAME;
  const vercelURL = process.env.VERCEL_URL;

  // Get ENS resolver contract
  const resolverAbi = [
    "function setText(bytes32 node, string key, string value) external",
    "function namehash(string memory name) public pure returns (bytes32)"
  ];
  const resolver = new ethers.Contract(PUBLIC_RESOLVER, resolverAbi, wallet);

  // Compute ENS namehash
  const namehash = ethers.namehash(name);

  // Update text record
  const tx = await resolver.setText(namehash, "url", vercelURL);
  console.log("Transaction sent:", tx.hash);

  await tx.wait();
  console.log(`✅ ENS updated: ${name} now points to ${vercelURL}`);
}

main().catch(console.error);
