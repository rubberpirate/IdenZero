import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { jobPortalContract } from '@/utils/contract';
import UserRegistration from './UserRegistration';

interface WalletConnectionProps {
  children: React.ReactNode;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setUserAddress(null);
      setIsUserRegistered(false);
    } else {
      setUserAddress(accounts[0]);
      checkUserRegistration(accounts[0]);
    }
  };

  const checkConnection = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setIsConnected(true);
        setUserAddress(accounts[0]);
        await checkUserRegistration(accounts[0]);
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
      setError(error instanceof Error ? error.message : 'Failed to check wallet connection');
    }
  };

  const checkUserRegistration = async (address: string) => {
    setIsCheckingRegistration(true);
    try {
      const user = await jobPortalContract.getUser(address);
      if (user && user.isActive) {
        setIsUserRegistered(true);
      } else {
        setIsUserRegistered(false);
      }
    } catch (error) {
      console.error('Failed to check user registration:', error);
      setIsUserRegistered(false);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setIsConnected(true);
        setUserAddress(accounts[0]);
        await checkUserRegistration(accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    setIsUserRegistered(true);
  };

  const handleStartRegistration = () => {
    setShowRegistration(true);
  };

  // Show children if everything is ready
  if (isConnected && isUserRegistered && !isCheckingRegistration) {
    return <>{children}</>;
  }

  // Show registration form
  if (isConnected && !isUserRegistered && showRegistration) {
    return (
      <div className="p-8">
        <UserRegistration 
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowRegistration(false)}
        />
      </div>
    );
  }

  // Show connection/registration UI
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full">
        {!isConnected ? (
          <Card className="bg-white/5 border-gray-800 p-8 text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your Web3 wallet to access job management features
            </p>

            {error && (
              <Alert className="mb-6 border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-white text-black hover:bg-gray-200 mb-4"
            >
              {isConnecting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>

            <div className="text-sm text-gray-400">
              Don't have MetaMask?{' '}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                Install it here
              </a>
            </div>
          </Card>
        ) : isCheckingRegistration ? (
          <Card className="bg-white/5 border-gray-800 p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-semibold text-white mb-4">Checking Registration</h2>
            <p className="text-gray-400">
              Verifying your profile on the blockchain...
            </p>
          </Card>
        ) : (
          <Card className="bg-white/5 border-gray-800 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Wallet Connected</h2>
            <p className="text-gray-400 mb-6">
              Connected to: <code className="text-white text-sm">{userAddress}</code>
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-400 font-medium mb-1">Registration Required</p>
                  <p className="text-yellow-300">
                    You need to register your profile on the blockchain before using job management features.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStartRegistration}
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Register Profile
              </Button>
              
              <Button
                variant="outline"
                onClick={() => checkUserRegistration(userAddress!)}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;