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
      <div className={`mt-auto pt-6 border-t border-zinc-800/30 ${className}`}>
        <div className="px-3 py-3 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-800/60 transition-all duration-300 shadow-lg">
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-transparent hover:bg-zinc-600/20 text-zinc-300 hover:text-zinc-100 border-0 h-8 text-xs font-medium transition-all duration-300 tracking-wide"
            size="sm"
          >
            {isConnecting ? (
              <>
                <div className="w-3 h-3 mr-2 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
                CONNECTING
              </>
            ) : (
              <>
                <Wallet className="w-3 h-3 mr-2" />
                CONNECT WALLET
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-auto pt-6 border-t border-zinc-800/30 ${className}`}>
      <div className="px-3 py-3 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 shadow-lg">
        {/* Sophisticated Address Display */}
        <div className="flex items-center justify-between mb-3 min-w-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-20" />
            </div>
            <span className="text-xs font-mono text-zinc-200 tracking-wide font-medium truncate">
              {formatAddress(walletAddress!)}
            </span>
          </div>
          <button
            onClick={copyAddress}
            className="text-zinc-400 hover:text-zinc-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-zinc-600/20 flex-shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sophisticated Actions */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => window.open(`https://sepolia.etherscan.io/address/${walletAddress}`, '_blank')}
            className="py-1.5 px-2 text-[10px] text-zinc-300 hover:text-zinc-100 bg-zinc-700/40 hover:bg-zinc-600/60 transition-all duration-300 text-center rounded-lg border border-zinc-600/30 hover:border-zinc-500/50 font-medium tracking-wide"
          >
            EXPLORER
          </button>
          <button
            onClick={disconnectWallet}
            className="py-1.5 px-2 text-[10px] text-zinc-400 hover:text-red-300 bg-zinc-700/40 hover:bg-red-900/20 transition-all duration-300 text-center rounded-lg border border-zinc-600/30 hover:border-red-500/30 font-medium tracking-wide"
          >
            DISCONNECT
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletStatus;