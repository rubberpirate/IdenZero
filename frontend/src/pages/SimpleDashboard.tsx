import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  Wallet, 
  Send, 
  History, 
  Shield,
  Menu,
  UserPlus,
  FileText,
  ArrowLeft
} from 'lucide-react';

const SimpleDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('wallet');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleBackToHome = () => {
    navigate('/');
  };

  const sidebarItems = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'send', label: 'Send', icon: Send },
    { id: 'history', label: 'History', icon: History },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'profile', label: 'Profile', icon: UserPlus },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'wallet':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Wallet Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Balance</h3>
                <p className="text-3xl font-bold text-green-400">$0.00</p>
                <p className="text-gray-400 text-sm mt-2">Available balance</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Total Transactions</h3>
                <p className="text-3xl font-bold text-green-400">0</p>
                <p className="text-gray-400 text-sm mt-2">All time</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                <p className="text-lg font-semibold text-green-400">Active</p>
                <p className="text-gray-400 text-sm mt-2">Wallet status</p>
              </div>
            </div>
          </div>
        );
      case 'send':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Send Money</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter recipient address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <Button className="w-full">Send Transaction</Button>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Backup Phrase</h3>
                <p className="text-gray-400 mb-4">Securely backup your wallet recovery phrase</p>
                <Button variant="outline">View Backup Phrase</Button>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                  />
                </div>
                <Button className="w-full">Update Profile</Button>
              </div>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Documents</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-center py-8">No documents available</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
            <p className="text-gray-400">Welcome to your dashboard</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-700 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white capitalize">
              {activeSection}
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Content */}
        <main className="bg-black min-h-[calc(100vh-73px)]">
          {renderContent()}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SimpleDashboard;