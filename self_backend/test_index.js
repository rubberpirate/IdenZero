import express from 'express';
import cors from 'cors';
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";
import { ethers } from 'ethers';

// Smart Contract Configuration
const CONTRACT_ADDRESS = "0x99f8caa1dE1a8E71612E2F9868B5beF2dCd58B30";
const PRIVATE_KEY = "f59d95f9f80ff9170d28a955c2c0c17a3807f724baf39ed560ac8902ec8fd5db";
const RPC_URL = "https://rpc.sepolia.org"; // Public Sepolia RPC endpoint

// Contract ABI - only the functions we need
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "markVerified",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "UserVerified",
    "type": "event"
  }
];

// Initialize ethers provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

const app = express();

// Enable CORS for frontend requests
app.use(cors());

const selfBackendVerifier = new SelfBackendVerifier(
  "self-zkverify-workshop",
  "https://308955f37013.ngrok-free.app/verify",
  true, // mockPassport: true for testing with mock passport
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [], // Empty array for mock passport testing
    ofac: false, // Disable OFAC for testing
  }),
  "uuid" // userIdentifierType
);

app.use(express.json());


app.get('/', (req,res) => {
    res.send("Hello world!");
})


app.post('/verify', async (req,res) => {
    try {
     const { attestationId, proof, publicSignals, userContextData } =  req.body;
     if (!proof || !publicSignals || !attestationId || !userContextData) {
      return res.status(404).json(
        {
          message: "Proof, publicSignals, attestationId and userContextData are required",
        }
      );
    }

    const result = await selfBackendVerifier.verify(
      attestationId,    // Document type (1 = passport, 2 = EU ID card, 3 = Aadhaar)
      proof,            // The zero-knowledge proof
      publicSignals,    // Public signals array
      userContextData   // User context data (hex string)
    );

    // Check if verification was successful
    if (result.isValidDetails.isValid) {
      // Verification successful - process the result
      
      // Call smart contract markVerified function
      try {
        // Extract user address from request body or userContextData
        let userAddress;
        
        // Check if userAddress is provided in the request body
        if (req.body.userAddress && ethers.isAddress(req.body.userAddress)) {
          userAddress = req.body.userAddress;
        } else if (typeof userContextData === 'string' && ethers.isAddress(userContextData)) {
          userAddress = userContextData;
        } else {
          console.warn('No valid user address found for blockchain verification');
          throw new Error('User address not provided or invalid');
        }
        
        console.log(`Marking user ${userAddress} as verified on blockchain...`);
        
        // Call the markVerified function on the smart contract
        const tx = await contract.markVerified(userAddress);
        console.log(`Transaction sent: ${tx.hash}`);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
        console.log(`User ${userAddress} successfully marked as verified on blockchain`);
        
      } catch (contractError) {
        console.error('Error calling markVerified on contract:', contractError);
        // Continue with response even if contract call fails
        // This ensures the verification API still works even if blockchain interaction fails
      }
      
      return res.json({
        status: "success",
        result: true,
        credentialSubject: result.discloseOutput,
      });
    } else {
      // Verification failed
      return res.json(
        {
          status: "error",
          result: false,
          reason: "Verification failed",
          error_code: "VERIFICATION_FAILED",
          details: result.isValidDetails,
        },
        { status: 200 }
      );
    }

} catch(err) {
    return res.status(500).json(
      {
        status: "error",
        result: false,
        reason: err instanceof Error ? err.message : "Unknown error",
        error_code: "UNKNOWN_ERROR"
      },
    );
}
})

app.listen(3000, () => {
    console.log("Running at port 3000");
})