# SBT Certificate Minting Interface

This is a React-based web interface for minting Soulbound Token (SBT) certificates using your deployed SBTUNI contract.

**Contract Address:** `0xcdee5DB9E9e04c33448428E0a29f7823EC74B2f8`

## Features

- 🎓 **Certificate Minting**: Mint individual soulbound certificates with full details
- 🔐 **MetaMask Integration**: Connect with MetaMask for secure transactions
- 📝 **Form Validation**: Comprehensive form validation for all required fields
- 🎨 **Modern UI**: Clean, responsive design with loading states and feedback
- ⚠️ **Error Handling**: Clear error messages and transaction feedback

## Quick Start

### 1. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

### 2. Access the Minting Interface

Navigate to: **`http://localhost:5173/minting`**

## Usage

### Prerequisites

1. **MetaMask installed** in your browser
2. **Connected to the correct network** where your contract is deployed
3. **Contract owner account** - only the contract owner can mint certificates
4. **Sufficient ETH** for gas fees

### Minting a Certificate

1. **Connect MetaMask**: The interface will prompt you to connect MetaMask
2. **Fill in the form**:
   - **Recipient Address**: The Ethereum address that will receive the certificate
   - **Certificate Type**: Select from diploma, degree, certificate, transcript, or achievement
   - **Student Name**: Full name of the student
   - **Course Name**: Name of the course or program
   - **Grade**: Academic grade or result
   - **Metadata URI**: IPFS or HTTP URL containing certificate metadata/image

3. **Submit Transaction**: Click "Mint Certificate" and confirm in MetaMask
4. **Wait for Confirmation**: The interface will show transaction hash and wait for blockchain confirmation

### Form Validation

The form includes comprehensive validation:

- ✅ Valid Ethereum address format
- ✅ All required fields filled
- ✅ Contract address configured
- ✅ MetaMask connection

### Transaction Feedback

- 🔄 **Loading States**: Shows spinner during transaction processing
- ✅ **Success Messages**: Displays transaction hash and token ID upon success
- ❌ **Error Handling**: Clear error messages for various failure scenarios
- 📋 **Transaction Hash**: Clickable link to view transaction on block explorer

## Certificate Structure

Each minted certificate contains:

```solidity
struct Certificate {
    string metadataURI;      // IPFS/HTTP link to certificate image/metadata
    uint256 issuedAt;        // Block timestamp of issuance
    string certificateType;  // Type of certificate (diploma, degree, etc.)
    string studentName;      // Student's full name
    string courseName;       // Course/program name
    string grade;            // Academic grade
    bool revoked;            // Revocation status
}
```

## Contract Functions Used

- `mintCertificate(address to, string metadataUri, string certificateType, string studentName, string courseName, string grade)`

## Security Features

- 🔒 **Soulbound**: Certificates cannot be transferred once minted
- 👥 **Owner Only**: Only contract owner can mint certificates
- 🛡️ **Reentrancy Protection**: Built-in protection against reentrancy attacks
- ✅ **Input Validation**: Comprehensive validation on both frontend and contract

## Network Support

The interface supports multiple networks:

- Ethereum Mainnet
- Ethereum Testnets (Sepolia, Goerli)
- Local Development (Hardhat/Ganache)
- Other EVM-compatible networks

Update the `NETWORK_CONFIG` in `contract.ts` to add support for additional networks.

## Troubleshooting

### Common Issues

1. **"Contract Not Configured"**: Update the contract address in `src/config/contract.ts`
2. **"MetaMask Not Connected"**: Click connect button and approve in MetaMask
3. **"Transaction Failed"**: 
   - Ensure you're the contract owner
   - Check you have sufficient ETH for gas
   - Verify you're on the correct network
4. **"Invalid Address"**: Make sure recipient address is a valid Ethereum address

### Development Tips

- Use browser developer tools to debug MetaMask interactions
- Check the console for detailed error messages
- Test with small amounts first
- Verify contract deployment on a block explorer

## Customization

### Styling
- Modify Tailwind CSS classes in the component
- Update the color scheme in `tailwind.config.ts`

### Form Fields
- Add/remove certificate types in the select dropdown
- Modify grade options as needed
- Add additional form fields if required

### Contract Integration
- Update the ABI in `contract.ts` if you modify the contract
- Add support for additional contract functions as needed

## License

This project is part of the ETH-SS project and follows the same licensing terms.