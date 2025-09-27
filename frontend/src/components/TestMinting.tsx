import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sbtContract } from '@/utils/sbtContract';
import { ethers } from 'ethers';
import { SBTUNI_ABI, SBTUNI_CONTRACT_ADDRESS } from '@/config/contract';

interface TestMintingProps {
  onCertificateMinted?: () => void;
}

export const TestMinting: React.FC<TestMintingProps> = ({ onCertificateMinted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const address = await sbtContract.getConnectedAddress();
      const info = {
        connectedAddress: address,
        contractAddress: SBTUNI_CONTRACT_ADDRESS,
        network: 'Unknown'
      };

      if (window.ethereum && address) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          info.network = `${network.name} (${network.chainId})`;
        } catch (netError) {
          console.log('Could not get network info');
        }
      }

      setDebugInfo(info);
    } catch (error) {
      console.error('Failed to load debug info:', error);
    }
  };

  const mintTestCertificate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(SBTUNI_CONTRACT_ADDRESS, SBTUNI_ABI, signer);

      // Get current user address
      const address = await signer.getAddress();

      // Test certificate data
      const testData = {
        to: address,
        metadataUri: "https://example.com/metadata/1",
        certificateType: "Computer Science Degree",
        studentName: "John Doe",
        courseName: "Bachelor of Computer Science",
        grade: "A+"
      };

      console.log('🎓 Minting test certificate:', testData);

      // Note: This will only work if the connected wallet is the owner of the contract
      const tx = await contract.mintCertificate(
        testData.to,
        testData.metadataUri,
        testData.certificateType,
        testData.studentName,
        testData.courseName,
        testData.grade
      );

      console.log('🎓 Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('🎓 Transaction confirmed:', receipt);

      setSuccess(`Certificate minted successfully! Token ID: ${receipt.logs[0]?.topics[2] || 'N/A'}`);
      
      // Callback to refresh certificates
      if (onCertificateMinted) {
        setTimeout(onCertificateMinted, 1000);
      }

    } catch (error: any) {
      console.error('Failed to mint certificate:', error);
      setError(error.message || 'Failed to mint certificate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Information */}
      <Card className="bg-white/5 border-gray-800 p-6">
        <h3 className="text-white font-medium mb-4">Debug Information</h3>
        {debugInfo ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Connected Address:</span>
              <span className="text-gray-300 font-mono text-xs">
                {debugInfo.connectedAddress ? 
                  `${debugInfo.connectedAddress.substring(0, 8)}...${debugInfo.connectedAddress.substring(debugInfo.connectedAddress.length - 6)}` 
                  : 'Not connected'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contract Address:</span>
              <span className="text-gray-300 font-mono text-xs">
                {debugInfo.contractAddress.substring(0, 8)}...{debugInfo.contractAddress.substring(debugInfo.contractAddress.length - 6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-gray-300">{debugInfo.network}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Loading debug info...</p>
        )}
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-4 border-gray-600 text-gray-300"
          onClick={loadDebugInfo}
        >
          Refresh Debug Info
        </Button>
      </Card>

      {/* Test Minting */}
      <Card className="bg-white/5 border-gray-800 p-6">
        <h3 className="text-white font-medium mb-4">Test Certificate Minting</h3>
        <p className="text-gray-400 text-sm mb-4">
          Click below to mint a test certificate. Note: This only works if your wallet is the contract owner.
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        
        <Button 
          onClick={mintTestCertificate} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Minting...' : 'Mint Test Certificate'}
        </Button>
      </Card>
    </div>
  );
};