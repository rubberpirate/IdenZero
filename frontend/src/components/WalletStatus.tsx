import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { jobPortalContract } from '@/utils/contract';
import { toast } from "@/hooks/use-toast";

interface WalletStatusProps {
  className?: string;
}

const WalletStatus: React.FC<WalletStatusProps> = ({ className }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState<string>('Unknown Network');

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
      setWalletAddress(null);
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      loadNetworkInfo();
    }
  };

  const checkConnection = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setIsConnected(true);
        setWalletAddress(accounts[0]);
        await loadNetworkInfo();
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const loadNetworkInfo = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new (await import('ethers')).BrowserProvider(window.ethereum);
        
        // Get network info
        const network = await provider.getNetwork();
        const networkNames: { [key: string]: string } = {
          '11155111': 'Sepolia Testnet',
          '5': 'Goerli Testnet',
          '137': 'Polygon Mainnet',
          '80001': 'Polygon Mumbai',
        };
        setNetworkName(networkNames[network.chainId.toString()] || `Chain ID: ${network.chainId}`);
      }
    } catch (error) {
      console.error('Failed to load network info:', error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      if (typeof window.ethereum === 'undefined') {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        setIsConnected(true);
        setWalletAddress(accounts[0]);
        await loadNetworkInfo();
        
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask.",
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard.",
        });
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setNetworkName('Unknown Network');
    
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected from the application.",
    });
  };

  if (!isConnected) {
    return (
      <div className={`mt-auto pt-6 border-t border-gray-800 ${className}`}>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-white/10 hover:bg-white/15 text-white border border-gray-600 transition-colors"
          size="sm"
        >
          {isConnecting ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Connect to access Web3 features
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-auto pt-6 border-t border-gray-800 ${className}`}>
      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-xs text-gray-400">Connected</span>
          </div>
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>

        {/* Wallet Address */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Address</span>
            <Button
              onClick={copyAddress}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm font-mono text-white">
            {formatAddress(walletAddress!)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => window.open(`https://sepolia.etherscan.io/address/${walletAddress}`, '_blank')}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            View on Explorer
          </Button>
          
          <Button
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs border-gray-600 text-gray-400 hover:bg-red-900/20 hover:border-red-500 hover:text-red-400"
          >
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletStatus;