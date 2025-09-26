# TrustHire Platform - Sitemap & Technical Integration Guide

## 🗺️ Website Sitemap

### Public Pages
```
/
├── /home                           # Landing page
├── /about                          # About TrustHire
├── /how-it-works                   # Platform explanation
├── /pricing                        # Subscription plans
├── /blog                           # News and updates
│   ├── /blog/[slug]               # Individual blog posts
│   └── /blog/categories/[category] # Blog categories
├── /careers                        # Join our team
├── /contact                        # Contact form
├── /privacy                        # Privacy policy
├── /terms                          # Terms of service
└── /whitepaper                     # Technical documentation
```

### Authentication
```
/auth/
├── /auth/connect-wallet           # Wallet connection
├── /auth/verify-identity          # Aadhaar/ID verification
├── /auth/onboarding              # First-time setup wizard
├── /auth/logout                  # Logout confirmation
└── /auth/recovery                # Account recovery
```

### User Dashboard
```
/dashboard/
├── /dashboard/overview           # Main dashboard
├── /dashboard/profile            # Profile management
│   ├── /dashboard/profile/edit   # Edit profile
│   ├── /dashboard/profile/verify # Verify credentials
│   └── /dashboard/profile/karma  # Karma breakdown
├── /dashboard/credentials        # Manage certificates
│   ├── /dashboard/credentials/upload    # Upload new
│   ├── /dashboard/credentials/pending   # Pending verification
│   └── /dashboard/credentials/verified  # Verified docs
├── /dashboard/skills             # Skill analysis
│   ├── /dashboard/skills/github       # GitHub analysis
│   ├── /dashboard/skills/tournaments  # Skill tournaments
│   └── /dashboard/skills/assessments  # Take assessments
├── /dashboard/jobs               # Job applications
│   ├── /dashboard/jobs/browse         # Browse jobs
│   ├── /dashboard/jobs/applied        # Applied jobs
│   ├── /dashboard/jobs/saved          # Saved jobs
│   └── /dashboard/jobs/recommended    # AI recommendations
├── /dashboard/wallet             # Wallet & staking
│   ├── /dashboard/wallet/balance      # Token balance
│   ├── /dashboard/wallet/stakes       # Active stakes
│   └── /dashboard/wallet/history      # Transaction history
├── /dashboard/network            # Professional network
│   ├── /dashboard/network/connections # Connections
│   ├── /dashboard/network/endorsements # Endorsements
│   └── /dashboard/network/referrals   # Referral program
└── /dashboard/settings           # Account settings
    ├── /dashboard/settings/profile    # Profile settings
    ├── /dashboard/settings/privacy    # Privacy controls
    ├── /dashboard/settings/notifications # Notification prefs
    └── /dashboard/settings/security   # Security settings
```

### Company Portal
```
/company/
├── /company/dashboard            # Company dashboard
├── /company/jobs                 # Job management
│   ├── /company/jobs/post        # Post new job
│   ├── /company/jobs/active      # Active postings
│   ├── /company/jobs/draft       # Draft postings
│   └── /company/jobs/closed      # Closed postings
├── /company/applications         # Manage applications
│   ├── /company/applications/pending    # Pending review
│   ├── /company/applications/shortlist  # Shortlisted
│   ├── /company/applications/interview  # Interview stage
│   └── /company/applications/hired      # Hired candidates
├── /company/talent               # Talent search
│   ├── /company/talent/search          # Advanced search
│   ├── /company/talent/saved           # Saved profiles
│   └── /company/talent/recommendations # AI matches
├── /company/verification         # Company verification
├── /company/analytics            # Hiring analytics
├── /company/billing              # Billing & payments
└── /company/settings             # Company settings
```

### Public Profiles
```
/profile/
├── /profile/[address]            # Public profile view
├── /profile/[address]/credentials # Verified credentials
├── /profile/[address]/portfolio   # Portfolio showcase
└── /profile/[address]/endorsements # Public endorsements
```

### Platform Features
```
/features/
├── /tournaments                  # Skills tournaments
│   ├── /tournaments/active       # Active tournaments
│   ├── /tournaments/upcoming     # Upcoming events
│   ├── /tournaments/leaderboard  # Global rankings
│   └── /tournaments/[id]         # Individual tournament
├── /leaderboard                  # Global karma rankings
├── /verification                 # Verification services
└── /analytics                    # Platform analytics
```

### Developer & API
```
/developers/
├── /developers/docs              # API documentation
├── /developers/guides            # Integration guides
├── /developers/playground        # API testing
└── /developers/keys              # API key management
```

---

## 🔧 Technical Integration Work

### 1. Blockchain Infrastructure Setup

#### Smart Contract Development
```solidity
// Priority Order of Contract Development

1. IdentityRegistry.sol
   - User registration and identity linking
   - Aadhaar hash storage
   - Identity verification status tracking
   
2. KarmaSystem.sol
   - Karma point calculation and storage
   - Karma transfer and staking logic
   - Reputation decay mechanisms
   
3. CredentialSBT.sol
   - Mint SBTs for verified credentials
   - Metadata management for certificates
   - Transfer restrictions (soulbound)
   
4. StakingManager.sol
   - Application stake management
   - Escrow for job applications
   - Stake slashing and rewards
   
5. JobMarketplace.sol
   - Job posting and application logic
   - Company verification requirements
   - Fee distribution mechanisms
```

#### Deployment Strategy
```javascript
// deployment/deploy.js
const deploymentOrder = [
  'IdentityRegistry',
  'KarmaSystem', 
  'CredentialSBT',
  'StakingManager',
  'JobMarketplace'
];

// Network Configuration
const networks = {
  polygon: {
    rpc: 'https://polygon-rpc.com',
    chainId: 137,
    gasPrice: 30000000000 // 30 gwei
  },
  mumbai: {
    rpc: 'https://rpc-mumbai.matic.today',
    chainId: 80001,
    gasPrice: 1000000000 // 1 gwei
  }
};
```

### 2. Identity Verification Integration

#### Self.xyz Integration
```typescript
// services/identity/selfxyz.service.ts
class SelfXYZService {
  async initiateVerification(userAddress: string) {
    // Step 1: Create verification session
    const session = await this.selfxyz.createSession({
      userAddress,
      requiredCredentials: ['email', 'phone', 'government_id'],
      callback: `${process.env.BASE_URL}/auth/verify-callback`
    });
    
    return session;
  }
  
  async handleCallback(sessionId: string, proofs: any) {
    // Step 2: Verify proofs and update identity registry
    const isValid = await this.selfxyz.verifyProofs(proofs);
    if (isValid) {
      await this.identityRegistry.markAsVerified(userAddress);
    }
    return isValid;
  }
}
```

#### Aadhaar Integration (India)
```typescript
// services/identity/aadhaar.service.ts
class AadhaarService {
  async verifyAadhaar(aadhaarNumber: string, otp: string) {
    // Step 1: UIDAI API integration
    const response = await fetch('https://api.uidai.gov.in/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UIDAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        aadhaar: aadhaarNumber,
        otp: otp,
        timestamp: Date.now()
      })
    });
    
    const result = await response.json();
    
    if (result.verified) {
      // Step 2: Store hash on-chain (not actual number)
      const aadhaarHash = this.hashAadhaar(aadhaarNumber);
      await this.identityRegistry.setAadhaarHash(userAddress, aadhaarHash);
    }
    
    return result.verified;
  }
  
  private hashAadhaar(aadhaarNumber: string): string {
    return ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(aadhaarNumber + process.env.SALT)
    );
  }
}
```

### 3. GitHub Integration & AI Analysis

#### GitHub API Integration
```typescript
// services/ai/github.service.ts
class GitHubService {
  async analyzeProfile(githubUsername: string) {
    // Step 1: Fetch user repositories
    const repos = await this.github.repos.listForUser({
      username: githubUsername,
      sort: 'updated',
      per_page: 100
    });
    
    // Step 2: Analyze commits for each repo
    const analysis = [];
    for (const repo of repos.data) {
      const commits = await this.analyzeCommits(repo.full_name);
      const languages = await this.analyzeLanguages(repo.full_name);
      
      analysis.push({
        repo: repo.name,
        commits: commits,
        languages: languages,
        stars: repo.stargazers_count,
        forks: repo.forks_count
      });
    }
    
    return this.generateSkillProfile(analysis);
  }
  
  async analyzeCommits(repoFullName: string) {
    const commits = await this.github.repos.listCommits({
      owner: repoFullName.split('/')[0],
      repo: repoFullName.split('/')[1],
      per_page: 100
    });
    
    return {
      count: commits.data.length,
      frequency: this.calculateCommitFrequency(commits.data),
      codeQuality: await this.analyzeCodeQuality(commits.data)
    };
  }
}
```

#### AI Skill Analysis Engine
```python
# services/ai/skill_analyzer.py
import tensorflow as tf
import numpy as np
from typing import Dict, List

class SkillAnalyzer:
    def __init__(self):
        self.model = tf.keras.models.load_model('models/skill_classifier.h5')
        self.language_weights = {
            'JavaScript': 1.2,
            'Python': 1.3,
            'Solidity': 2.0,
            'Rust': 1.8,
            'Go': 1.5
        }
    
    def analyze_commits(self, commits: List[Dict]) -> Dict:
        """Analyze commit quality and generate skill scores"""
        
        # Extract features from commits
        features = self.extract_commit_features(commits)
        
        # Run through ML model
        skill_scores = self.model.predict(features)
        
        # Apply domain-specific weights
        weighted_scores = self.apply_weights(skill_scores)
        
        return {
            'overall_score': float(np.mean(weighted_scores)),
            'language_breakdown': self.get_language_scores(commits),
            'consistency_score': self.calculate_consistency(commits),
            'complexity_score': self.calculate_complexity(commits)
        }
    
    def extract_commit_features(self, commits: List[Dict]) -> np.ndarray:
        """Extract ML features from commit data"""
        features = []
        
        for commit in commits:
            # Lines of code changed
            additions = commit.get('stats', {}).get('additions', 0)
            deletions = commit.get('stats', {}).get('deletions', 0)
            
            # Commit message quality (NLP analysis)
            message_score = self.analyze_commit_message(commit['message'])
            
            # File types touched
            file_diversity = len(set(self.extract_file_extensions(commit['files'])))
            
            features.append([
                additions,
                deletions,
                message_score,
                file_diversity,
                len(commit['message'])  # Message length
            ])
        
        return np.array(features)
```

### 4. Document Verification System

#### Digital Signature Verification
```typescript
// services/verification/certificate.service.ts
class CertificateVerificationService {
  async verifyCertificate(certificateFile: Buffer, metadata: any) {
    // Step 1: Extract digital signature
    const signature = await this.extractDigitalSignature(certificateFile);
    
    if (!signature) {
      return { verified: false, reason: 'No digital signature found' };
    }
    
    // Step 2: Verify against issuing authority
    const issuerPublicKey = await this.getIssuerPublicKey(metadata.issuer);
    const isValid = await this.verifySignature(signature, issuerPublicKey);
    
    if (isValid) {
      // Step 3: Mint SBT for verified credential
      await this.mintCredentialSBT(metadata.userAddress, {
        issuer: metadata.issuer,
        type: metadata.certificateType,
        issuedDate: metadata.issuedDate,
        ipfsHash: await this.uploadToIPFS(certificateFile)
      });
    }
    
    return { verified: isValid, signature, metadata };
  }
  
  private async uploadToIPFS(file: Buffer): Promise<string> {
    // Upload to Filecoin via IPFS
    const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    const result = await ipfs.add(file);
    return result.cid.toString();
  }
}
```

#### University Partnership Integration
```typescript
// services/verification/university.service.ts
class UniversityVerificationService {
  private universityAPIs = {
    'iit-delhi': {
      endpoint: 'https://api.iitd.ac.in/verify',
      apiKey: process.env.IITD_API_KEY
    },
    'iit-bombay': {
      endpoint: 'https://api.iitb.ac.in/verify',
      apiKey: process.env.IITB_API_KEY
    }
    // Add more universities
  };
  
  async verifyDegree(universityId: string, studentId: string, degreeDetails: any) {
    const university = this.universityAPIs[universityId];
    if (!university) {
      throw new Error(`University ${universityId} not supported`);
    }
    
    const response = await fetch(`${university.endpoint}/degree-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${university.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId,
        degreeType: degreeDetails.type,
        graduationYear: degreeDetails.year,
        department: degreeDetails.department
      })
    });
    
    return await response.json();
  }
}
```

### 5. The Graph Protocol Integration

#### Subgraph Schema Definition
```graphql
# schema.graphql
type User @entity {
  id: ID!
  address: Bytes!
  isVerified: Boolean!
  karmaScore: BigInt!
  credentials: [Credential!]! @derivedFrom(field: "owner")
  applications: [JobApplication!]! @derivedFrom(field: "applicant")
  createdAt: BigInt!
  updatedAt: BigInt!
}

type Credential @entity {
  id: ID!
  owner: User!
  tokenId: BigInt!
  issuer: String!
  credentialType: String!
  ipfsHash: String!
  issuedDate: BigInt!
  verified