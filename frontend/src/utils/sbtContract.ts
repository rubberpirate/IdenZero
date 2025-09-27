import { ethers } from 'ethers';
import { SBTUNI_ABI, SBTUNI_CONTRACT_ADDRESS } from '@/config/contract';

export interface Certificate {
  tokenId: number;
  metadataURI: string;
  issuedAt: number;
  certificateType: string;
  studentName: string;
  courseName: string;
  grade: string;
  revoked: boolean;
  isValid: boolean;
}

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

export class SBTContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.contract = new ethers.Contract(SBTUNI_CONTRACT_ADDRESS, SBTUNI_ABI, this.provider);
      } catch (error) {
        console.error('Failed to initialize SBT contract:', error);
      }
    }
  }

  async getConnectedAddress(): Promise<string | null> {
    if (!this.provider) return null;
    
    try {
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0 ? accounts[0].address : null;
    } catch (error) {
      console.error('Failed to get connected address:', error);
      return null;
    }
  }

  async getUserCertificates(address: string): Promise<Certificate[]> {
    if (!this.contract) {
      await this.initializeProvider();
      if (!this.contract) throw new Error('Contract not initialized');
    }

    try {
      console.log('🎓 Fetching certificates for address:', address);
      
      // Use event-based approach to find certificates
      const certificates = await this.getUserCertificatesFromEvents(address);
      
      // Try to enrich with detailed information if we're authorized
      const enrichedCertificates: Certificate[] = [];
      
      for (const cert of certificates) {
        try {
          // Try to get full details if we're authorized (owner of token or contract owner)
          const details = await this.contract.getCertificateDetails(cert.tokenId);
          
          const enrichedCertificate: Certificate = {
            ...cert,
            metadataURI: details[0] || cert.metadataURI,
            issuedAt: Number(details[1]) || cert.issuedAt,
            certificateType: details[2] || cert.certificateType,
            studentName: details[3] || cert.studentName,
            courseName: details[4] || cert.courseName,
            grade: details[5] || cert.grade || 'Not specified',
            revoked: details[6] !== undefined ? details[6] : cert.revoked
          };
          
          enrichedCertificates.push(enrichedCertificate);
          console.log('🎓 Enriched certificate with full details:', enrichedCertificate);
        } catch (authError) {
          // If not authorized, use the basic certificate data we already have
          console.log('🎓 Using public data for certificate:', cert.tokenId);
          // Ensure grade has a fallback value
          const publicCert: Certificate = {
            ...cert,
            grade: cert.grade || 'Not available'
          };
          enrichedCertificates.push(publicCert);
        }
      }
      
      return enrichedCertificates;
    } catch (error) {
      console.error('Failed to get user certificates:', error);
      return [];
    }
  }

  private async getUserCertificatesFromEvents(address: string): Promise<Certificate[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      console.log('🎓 Trying to fetch certificates from events for:', address);
      
      const certificates: Certificate[] = [];
      
      // Try Attest events first
      try {
        const attestFilter = this.contract.filters.Attest(address);
        const attestEvents = await this.contract.queryFilter(attestFilter);
        
        console.log('🎓 Found', attestEvents.length, 'Attest events');
        
        for (const event of attestEvents) {
          if ('args' in event) {
            const tokenId = event.args?.[1];
            if (tokenId) {
              const cert = await this.processTokenId(Number(tokenId));
              if (cert) certificates.push(cert);
            }
          }
        }
      } catch (attestError) {
        console.log('🎓 Attest events failed, trying Transfer events');
        
        // Fallback to Transfer events (ERC721 standard)
        const transferFilter = this.contract.filters.Transfer(null, address);
        const transferEvents = await this.contract.queryFilter(transferFilter);
        
        console.log('🎓 Found', transferEvents.length, 'Transfer events');
        
        for (const event of transferEvents) {
          if ('args' in event) {
            const tokenId = event.args?.[2]; // tokenId is the 3rd argument in Transfer
            if (tokenId) {
              const cert = await this.processTokenId(Number(tokenId));
              if (cert) certificates.push(cert);
            }
          }
        }
      }

      // Remove duplicates based on tokenId
      const uniqueCertificates = certificates.filter((cert, index, self) => 
        index === self.findIndex(c => c.tokenId === cert.tokenId)
      );

      console.log('🎓 Processed', uniqueCertificates.length, 'unique certificates');
      return uniqueCertificates;
    } catch (error) {
      console.error('Failed to get certificates from events:', error);
      return [];
    }
  }

  private async processTokenId(tokenId: number): Promise<Certificate | null> {
    if (!this.contract) return null;

    try {
      console.log('🎓 Processing tokenId:', tokenId);
      
      // Use the public verification function
      const verification = await this.contract.verifyCertificateDetailed(tokenId);
      const isValid = await this.contract.isValid(tokenId);
      
      // Get tokenURI if available
      let metadataURI = '';
      try {
        metadataURI = await this.contract.tokenURI(tokenId);
      } catch (uriError) {
        console.log('🎓 Could not fetch tokenURI for token:', tokenId);
      }
      
      const certificate: Certificate = {
        tokenId: tokenId,
        metadataURI: metadataURI,
        issuedAt: Number(verification[4]), // issued timestamp
        certificateType: verification[1], // certType
        studentName: verification[2], // student
        courseName: verification[3], // course
        grade: '', // Not available in public verification, will be enriched later if authorized
        revoked: !verification[5], // valid flag inverted
        isValid: isValid
      };
      
      console.log('🎓 Successfully processed certificate:', certificate);
      return certificate;
    } catch (error) {
      console.error('🎓 Failed to process tokenId', tokenId, ':', error);
      return null;
    }
  }

  async verifyCertificate(tokenId: number) {
    if (!this.contract) {
      await this.initializeProvider();
      if (!this.contract) throw new Error('Contract not initialized');
    }

    try {
      const result = await this.contract.verifyCertificateDetailed(tokenId);
      return {
        owner: result[0],
        certificateType: result[1],
        studentName: result[2],
        courseName: result[3],
        issuedAt: Number(result[4]),
        valid: result[5]
      };
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      throw error;
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  formatTokenId(tokenId: number): string {
    return `#${tokenId.toString().padStart(4, '0')}`;
  }

  getShortTokenId(tokenId: number): string {
    const hex = tokenId.toString(16).padStart(8, '0');
    return `0x...${hex.slice(-6)}`;
  }
}

// Export singleton instance
export const sbtContract = new SBTContract();