# Job Portal Smart Contract Integration Setup

This document explains how to set up and use the Job Portal smart contract integration.

## Prerequisites

1. **MetaMask Wallet**: Install MetaMask browser extension
2. **Contract Deployment**: Deploy the SimpleJobPortal.sol contract to your preferred network
3. **Network Configuration**: Configure your wallet to connect to the correct network

## Configuration Steps

### 1. Deploy the Smart Contract

First, deploy the SimpleJobPortal.sol contract:

```bash
cd contract
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network <your-network>
```

### 2. Update Contract Address

After deployment, update the contract address in `frontend/src/utils/contract.ts`:

```typescript
// Replace this with your deployed contract address
export const JOB_PORTAL_CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

### 3. Network Configuration

Make sure your MetaMask is connected to the same network where you deployed the contract.

## Usage Guide

### For Job Recruiters

1. **Connect Wallet**: Click the MetaMask connect button when prompted
2. **Register as User**: If first time, register as an Employer or Both
3. **Access Job Management**: Click "Job Management" in the sidebar
4. **Post New Job**: Click "Post New Job" and fill out the 3-step form:
   - **Step 1**: Basic job information (title, description, deadline)
   - **Step 2**: Job details (category, skills, location)
   - **Step 3**: Additional details (salary, job type, metadata)

### Job Posting Workflow

The system follows the smart contract's multi-step approach:

1. **postJobBasic()**: Creates the job with basic information
2. **setJobDetails()**: Adds category, skills, and location
3. **setJobMoreDetails()**: Completes with salary and job type

### Managing Posted Jobs

- **View Jobs**: See all your posted jobs with status, applications count, and details
- **Edit Jobs**: Update job information (future feature)
- **Close Jobs**: Mark jobs as closed when no longer accepting applications
- **View Applications**: See who applied to your jobs (future feature)

## Smart Contract Features

### User Types
- **JobSeeker (0)**: Can apply for jobs
- **Employer (1)**: Can post jobs
- **Both (2)**: Can both post and apply for jobs

### Job Status
- **Active (0)**: Accepting applications
- **Closed (1)**: No longer accepting applications

### Key Functions Used

- `registerUserBasic()`: Register new users
- `postJobBasic()`: Create new job posting
- `setJobDetails()`: Add job category and requirements
- `setJobMoreDetails()`: Add salary and employment type
- `getUserJobs()`: Get jobs posted by user
- `getCompleteJob()`: Get full job information
- `closeJob()`: Close job to applications

## Error Handling

The interface handles common errors:

- **Wallet Connection**: Prompts to connect MetaMask
- **Transaction Failures**: Shows error messages with retry options
- **Network Issues**: Guides users to correct network
- **Validation Errors**: Highlights missing required fields

## Future Enhancements

- Job editing functionality
- Application management system
- Advanced job search and filtering
- Job analytics and statistics
- Email notifications
- IPFS integration for larger job descriptions

## Troubleshooting

### Common Issues

1. **"Contract not initialized"**: Make sure contract address is correctly set
2. **"MetaMask not installed"**: Install MetaMask browser extension
3. **Transaction failures**: Ensure sufficient gas and correct network
4. **Loading issues**: Check network connectivity and contract deployment

### Support

For technical issues:
1. Check browser console for detailed error messages
2. Verify MetaMask connection and network
3. Confirm contract address and deployment status
4. Check transaction status on blockchain explorer