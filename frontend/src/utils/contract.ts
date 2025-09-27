import { ethers } from 'ethers';

// Contract ABI - generated from SimpleJobPortal.sol
export const JOB_PORTAL_ABI = [
  // Constructor
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
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
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "employer",
        "type": "address"
      }
    ],
    "name": "JobPosted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      }
    ],
    "name": "JobUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      }
    ],
    "name": "JobClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "applicationId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "ApplicationSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "applicationId",
        "type": "uint256"
      }
    ],
    "name": "ApplicationReviewed",
    "type": "event"
  },
  // State Variables (read-only)
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "backendAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jobIdCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "applicationIdCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // User Management Functions
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "enum SimpleJobPortal.UserType",
        "name": "_userType",
        "type": "uint8"
      }
    ],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_phone",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_profileHash",
        "type": "string"
      }
    ],
    "name": "setUserDetails",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Job Management Functions
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      }
    ],
    "name": "postJob",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_category",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_salaryRange",
        "type": "string"
      }
    ],
    "name": "setJobDetails",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_metadataHash",
        "type": "string"
      }
    ],
    "name": "setJobMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "updateJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_salaryRange",
        "type": "string"
      }
    ],
    "name": "updateJobSalary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      }
    ],
    "name": "closeJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Application Management Functions
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      }
    ],
    "name": "applyForJob",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_applicationId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_coverLetter",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_resumeHash",
        "type": "string"
      }
    ],
    "name": "setApplicationDetails",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_applicationId",
        "type": "uint256"
      }
    ],
    "name": "markApplicationReviewed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Verification Functions
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
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "removeVerification",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Admin Functions
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_backendAddress",
        "type": "address"
      }
    ],
    "name": "setBackendAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View Functions
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserJobs",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserApplications",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      }
    ],
    "name": "getJobApplications",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveJobs",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_category",
        "type": "string"
      }
    ],
    "name": "getJobsByCategory",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "isUserVerified",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBackendAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Public mappings
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "phone",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "profileHash",
        "type": "string"
      },
      {
        "internalType": "enum SimpleJobPortal.UserType",
        "name": "userType",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "totalJobsPosted",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "totalApplications",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "registrationDate",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "jobs",
    "outputs": [
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "category",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "salaryRange",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataHash",
        "type": "string"
      },
      {
        "internalType": "uint32",
        "name": "applicationsCount",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "createdAt",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "deadline",
        "type": "uint32"
      },
      {
        "internalType": "enum SimpleJobPortal.JobStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "applications",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "coverLetter",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "resumeHash",
        "type": "string"
      },
      {
        "internalType": "uint32",
        "name": "appliedAt",
        "type": "uint32"
      },
      {
        "internalType": "enum SimpleJobPortal.ApplicationStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract address - deployed to Sepolia testnet
export const JOB_PORTAL_CONTRACT_ADDRESS = "0x99f8caa1dE1a8E71612E2F9868B5beF2dCd58B30";

// User types enum
export enum UserType {
  JobSeeker = 0,
  Employer = 1,
  Both = 2
}

// Job status enum
export enum JobStatus {
  Active = 0,
  Closed = 1
}

// Application status enum
export enum ApplicationStatus {
  Pending = 0,
  Reviewed = 1
}

// Type definitions matching the actual contract
export interface Job {
  employer: string;
  title: string;
  description: string;
  category: string;
  location: string;
  salaryRange: string;
  metadataHash: string;
  applicationsCount: number;
  createdAt: number;
  deadline: number;
  status: JobStatus;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  profileHash: string;
  userType: UserType;
  totalJobsPosted: number;
  totalApplications: number;
  registrationDate: number;
  isActive: boolean;
  isVerified: boolean;
}

export interface Application {
  jobId: bigint;
  applicant: string;
  coverLetter: string;
  resumeHash: string;
  appliedAt: number;
  status: ApplicationStatus;
}

// Ethereum type declaration
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

// Web3 connection utilities
export class JobPortalContract {
  public contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connect(): Promise<boolean> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      
      // Check if we're on the correct network (Sepolia testnet)
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId.toString());
      
      if (network.chainId !== 11155111n) {
        throw new Error(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Currently on: ${network.name} (Chain ID: ${network.chainId})`);
      }
      
      this.signer = await this.provider.getSigner();
      
      this.contract = new ethers.Contract(
        JOB_PORTAL_CONTRACT_ADDRESS,
        JOB_PORTAL_ABI,
        this.signer
      );

      console.log('✅ Connected to Sepolia testnet successfully!');
      return true;
    } catch (error) {
      console.error('Failed to connect to Web3:', error);
      return false;
    }
  }

  async getConnectedAddress(): Promise<string | null> {
    try {
      if (!this.signer) {
        await this.connect();
      }
      return this.signer ? await this.signer.getAddress() : null;
    } catch (error) {
      console.error('Failed to get connected address:', error);
      return null;
    }
  }

  async registerUser(name: string, email: string, userType: UserType): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        const connected = await this.connect();
        if (!connected) {
          throw new Error('Failed to connect to wallet or network');
        }
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Validate inputs before making the call
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      
      if (!email.trim()) {
        throw new Error('Email is required');
      }

      console.log('Registering user:', { name, email, userType });
      
      // Check if user is already registered
      try {
        const existingUser = await this.contract.users(await this.signer!.getAddress());
        if (existingUser.isActive) {
          throw new Error('This wallet address is already registered');
        }
      } catch (checkError) {
        // If we can't check, continue with registration
        console.log('Could not check existing user, continuing with registration');
      }

      // Try gas estimation with proper error handling
      let gasLimit: bigint;
      try {
        const gasEstimate = await this.contract.registerUser.estimateGas(name, email, userType);
        console.log('Estimated gas:', gasEstimate.toString());
        gasLimit = gasEstimate + BigInt(20000); // Add buffer
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError);
        gasLimit = BigInt(300000); // Fallback gas limit
      }

      const tx = await this.contract.registerUser(name, email, userType, {
        gasLimit: gasLimit
      });
      
      console.log('Transaction sent:', tx.hash);
      return tx;
    } catch (error) {
      console.error('Failed to register user:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        // Network connectivity issues
        if (error.message.includes('network') || error.message.includes('connection')) {
          throw new Error('Network connection failed. Please check that you are connected to the Sepolia testnet in MetaMask.');
        }
        
        // Wrong network
        if (error.message.includes('Wrong network')) {
          throw new Error('Please switch to Sepolia testnet (Chain ID: 11155111) in MetaMask.');
        }
        
        // Contract specific errors
        if (error.message.includes('User already registered')) {
          throw new Error('This wallet address is already registered');
        }
        if (error.message.includes('Name cannot be empty')) {
          throw new Error('Name is required');
        }
        if (error.message.includes('Email cannot be empty')) {
          throw new Error('Email is required');
        }
        
        // MetaMask user rejection
        if (error.message.includes('user rejected') || error.message.includes('User denied')) {
          throw new Error('Transaction was rejected by user');
        }
        
        // Gas issues
        if (error.message.includes('gas') || error.message.includes('Gas')) {
          throw new Error('Transaction failed due to gas issues. Please try again.');
        }
        
        // RPC errors (often network configuration issues)
        if (error.message.includes('Internal JSON-RPC error') || error.message.includes('-32603')) {
          throw new Error('Network error: Please ensure MetaMask is connected to Sepolia testnet');
        }
      }
      
      throw new Error('Registration failed. Please check your network connection and try again.');
    }
  }

  async postJob(title: string, description: string, deadline: number): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.postJob(title, description, deadline);
      return tx;
    } catch (error) {
      console.error('Failed to post job:', error);
      return null;
    }
  }

  async setJobDetails(jobId: number, category: string, location: string, salaryRange: string): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.setJobDetails(jobId, category, location, salaryRange);
      return tx;
    } catch (error) {
      console.error('Failed to set job details:', error);
      return null;
    }
  }

  async setJobMetadata(jobId: number, metadataHash: string): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.setJobMetadata(jobId, metadataHash);
      return tx;
    } catch (error) {
      console.error('Failed to set job metadata:', error);
      return null;
    }
  }

  async getUserJobs(userAddress: string): Promise<number[]> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const jobIds = await this.contract.getUserJobs(userAddress);
      return jobIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get user jobs:', error);
      return [];
    }
  }

  async getJob(jobId: number): Promise<Job | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const job = await this.contract.jobs(jobId);
      return {
        employer: job.employer,
        title: job.title,
        description: job.description,
        category: job.category,
        location: job.location,
        salaryRange: job.salaryRange,
        metadataHash: job.metadataHash,
        applicationsCount: Number(job.applicationsCount),
        createdAt: Number(job.createdAt),
        deadline: Number(job.deadline),
        status: Number(job.status) as JobStatus
      };
    } catch (error) {
      console.error('Failed to get job:', error);
      return null;
    }
  }

  async getJobIdCounter(): Promise<number> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const counter = await this.contract.jobIdCounter();
      return Number(counter);
    } catch (error) {
      console.error('Failed to get job ID counter:', error);
      return 0;
    }
  }

  async getUser(address: string): Promise<User | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const user = await this.contract.users(address);
      
      // Check if user exists (isActive will be false for non-existent users)
      if (!user.isActive) {
        return null;
      }
      
      return user;
    } catch (error) {
      // If the call fails completely, the user doesn't exist
      console.log('User not found or not registered:', address);
      return null;
    }
  }

  async closeJob(jobId: number): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.closeJob(jobId);
      return tx;
    } catch (error) {
      console.error('Failed to close job:', error);
      return null;
    }
  }

  async updateJob(jobId: number, title: string, description: string): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.updateJob(jobId, title, description);
      return tx;
    } catch (error) {
      console.error('Failed to update job:', error);
      return null;
    }
  }

  async updateJobSalary(jobId: number, salaryRange: string): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.updateJobSalary(jobId, salaryRange);
      return tx;
    } catch (error) {
      console.error('Failed to update job salary:', error);
      return null;
    }
  }

  async applyForJob(jobId: number): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.applyForJob(jobId);
      return tx;
    } catch (error) {
      console.error('Failed to apply for job:', error);
      return null;
    }
  }

  async setApplicationDetails(applicationId: number, coverLetter: string, resumeHash: string): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.setApplicationDetails(applicationId, coverLetter, resumeHash);
      return tx;
    } catch (error) {
      console.error('Failed to set application details:', error);
      return null;
    }
  }

  async setUserDetails(phone: string, profileHash: string): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.setUserDetails(phone, profileHash);
      return tx;
    } catch (error) {
      console.error('Failed to set user details:', error);
      return null;
    }
  }

  async updateProfile(name: string, email: string): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.updateProfile(name, email);
      return tx;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  }

  async getActiveJobs(): Promise<number[]> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const jobIds = await this.contract.getActiveJobs();
      return jobIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get active jobs:', error);
      return [];
    }
  }

  async getJobsByCategory(category: string): Promise<number[]> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const jobIds = await this.contract.getJobsByCategory(category);
      return jobIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get jobs by category:', error);
      return [];
    }
  }

  async getUserApplications(userAddress: string): Promise<number[]> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const applicationIds = await this.contract.getUserApplications(userAddress);
      return applicationIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get user applications:', error);
      return [];
    }
  }

  async getJobApplications(jobId: number): Promise<number[]> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const applicationIds = await this.contract.getJobApplications(jobId);
      return applicationIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get job applications:', error);
      return [];
    }
  }

  async getApplication(applicationId: number): Promise<Application | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const app = await this.contract.applications(applicationId);
      return {
        jobId: app.jobId,
        applicant: app.applicant,
        coverLetter: app.coverLetter,
        resumeHash: app.resumeHash,
        appliedAt: Number(app.appliedAt),
        status: app.status
      };
    } catch (error) {
      console.error('Failed to get application:', error);
      return null;
    }
  }

  async isUserVerified(address: string): Promise<boolean> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.isUserVerified(address);
    } catch (error) {
      console.error('Failed to check if user is verified:', error);
      return false;
    }
  }

  async getContractStats(): Promise<{ totalJobs: number; totalApplications: number; activeJobs: number } | null> {
    try {
      if (!this.contract) {
        await this.connect();
      }
      
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [totalJobs, totalApplications, activeJobs] = await this.contract.getContractStats();
      return {
        totalJobs: Number(totalJobs),
        totalApplications: Number(totalApplications),
        activeJobs: Number(activeJobs)
      };
    } catch (error) {
      console.error('Failed to get contract stats:', error);
      return null;
    }
  }
}

// Network utilities
export const switchToSepoliaNetwork = async (): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Try to switch to Sepolia network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
    });
    return true;
  } catch (switchError: unknown) {
    const error = switchError as { code?: number };
    // If network doesn't exist, add it
    if (error.code === 4902) {
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed');
        }
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7', // 11155111 in hex
              chainName: 'Sepolia test network',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Sepolia network:', addError);
        return false;
      }
    } else {
      console.error('Failed to switch to Sepolia network:', switchError);
      return false;
    }
  }
};

export const checkNetwork = async (): Promise<{ isCorrect: boolean; currentNetwork: string; chainId: string }> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      return { isCorrect: false, currentNetwork: 'No wallet', chainId: '0' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    return {
      isCorrect: network.chainId === 11155111n,
      currentNetwork: network.name || 'Unknown',
      chainId: network.chainId.toString()
    };
  } catch (error) {
    console.error('Failed to check network:', error);
    return { isCorrect: false, currentNetwork: 'Error', chainId: '0' };
  }
};

// Utility functions
export const formatDeadline = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

export const formatSalary = (salaryRange: string): string => {
  if (!salaryRange) return 'Not specified';
  return salaryRange;
};

export const getJobStatusText = (status: JobStatus): string => {
  return status === JobStatus.Active ? 'Active' : 'Closed';
};

export const getUserTypeText = (userType: UserType): string => {
  switch (userType) {
    case UserType.JobSeeker:
      return 'Job Seeker';
    case UserType.Employer:
      return 'Employer';
    case UserType.Both:
      return 'Both';
    default:
      return 'Unknown';
  }
};

export const getApplicationStatusText = (status: ApplicationStatus): string => {
  return status === ApplicationStatus.Pending ? 'Pending' : 'Reviewed';
};

// Create a singleton instance
export const jobPortalContract = new JobPortalContract();