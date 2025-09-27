# SBTUNI - Soulbound Token for University Certificates

A comprehensive implementation of Soulbound Tokens (SBT) specifically designed for university certificate management using Ethereum blockchain technology.

## 🎓 Overview

SBTUNI is a smart contract that implements the ERC-721 Non-Fungible Token standard with soulbound characteristics, making certificates non-transferable and permanently linked to the recipient's address. This ensures the authenticity and permanence of academic achievements.

## ✨ Features

### Core Soulbound Properties
- **Non-transferable**: Certificates cannot be transferred between addresses
- **Non-approvable**: Approval mechanisms are disabled
- **Permanent**: Certificates are permanently bound to the recipient
- **Revokable**: Universities can revoke certificates if needed
- **Burnable**: Recipients or university can burn certificates

### Certificate Management
- **Single Certificate Minting**: Issue individual certificates with detailed metadata
- **Batch Certificate Minting**: Efficiently mint multiple certificates at once
- **Certificate Details**: Store comprehensive information including:
  - Metadata URI
  - Certificate type (Bachelor, Master, PhD, etc.)
  - Student name
  - Course name
  - Grade
  - Issue timestamp
  - Revocation status

### Verification System
- **Certificate Verification**: Public verification of certificate authenticity
- **Detailed Verification**: Access to comprehensive certificate information
- **Type-based Queries**: Search certificates by type (owner-only feature)

### Access Control
- **Ownable**: Only university (owner) can mint certificates
- **Access Restrictions**: Certificate details accessible only to owner and token holder
- **Batch Limits**: Protection against excessive batch operations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn
- Git

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Compile contracts**
```bash
npx hardhat compile
```

3. **Run tests**
```bash
npx hardhat test
```

## 🧪 Testing

The project includes comprehensive tests covering:

### Test Categories
- **Deployment Tests**: Contract initialization
- **Minting Tests**: Single and batch certificate minting
- **Soulbound Behavior**: Transfer and approval restrictions
- **Certificate Management**: Revocation and burning
- **Verification System**: Certificate verification functions
- **Access Control**: Permission restrictions
- **Edge Cases**: Error handling and boundary conditions
- **Gas Optimization**: Performance testing

### Running Tests
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/SBTUNI.test.js
```

### Test Results
```
SBTUNI
  ✔ Should deploy with correct name and symbol
  ✔ Should mint certificates successfully
  ✔ Should prevent transfers (soulbound property)
  ✔ Should allow certificate revocation
  ✔ Should handle batch minting efficiently
  ... and 23 more tests

28 passing (2s)
```

## 🌐 Local Development

### Start Local Network
```bash
npx hardhat node
```

### Deploy to Local Network
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Interact with Contract
```bash
npx hardhat run scripts/interact.js
```

## 📋 Smart Contract API

### Main Functions

#### Minting Functions
```solidity
function mintCertificate(
    address to,
    string memory metadataURI,
    string memory certificateType,
    string memory studentName,
    string memory courseName,
    string memory grade
) external onlyOwner
```

#### Verification Functions
```solidity
function verifyCertificate(uint256 tokenId) 
    external view returns (address owner, string memory certificateType, bool isValid)

function isValid(uint256 tokenId) external view returns (bool)
```

#### Management Functions
```solidity
function revokeCertificate(uint256 tokenId) external onlyOwner
function burnCertificate(uint256 tokenId) external
```

## 📊 Gas Usage Analysis

| Function | Gas Usage | Notes |
|----------|-----------|-------|
| Single Mint | ~200,000 | Individual certificate minting |
| Batch Mint (50) | ~7.7M | Efficient batch processing |
| Verify Certificate | ~30,000 | Read-only verification |
| Revoke Certificate | ~50,000 | State change operation |

## 🔐 Security Features

### Access Control
- **Ownable Pattern**: Critical functions restricted to contract owner
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Input Validation**: Comprehensive parameter validation

### Soulbound Security
- **Transfer Prevention**: All transfer functions revert
- **Approval Blocking**: Approval mechanisms disabled
- **Permanent Binding**: Certificates permanently linked to recipients

## 📝 Usage Examples

### University Deployment
```javascript
const SBTUNI = await ethers.getContractFactory("SBTUNI");
const sbtuni = await SBTUNI.deploy("Harvard University", "HARVARD");
await sbtuni.deployed();
```

### Certificate Minting
```javascript
await sbtuni.mintCertificate(
    studentAddress,
    "https://ipfs.io/metadata/1",
    "Bachelor of Science",
    "John Doe",
    "Computer Science",
    "A"
);
```

### Certificate Verification
```javascript
const [owner, certType, isValid] = await sbtuni.verifyCertificate(tokenId);
console.log(`Certificate ${tokenId}: Owner=${owner}, Type=${certType}, Valid=${isValid}`);
```

---

Built with ❤️ for the future of digital credentials.
