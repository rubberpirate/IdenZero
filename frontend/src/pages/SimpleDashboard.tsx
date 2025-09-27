import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, 
  Shield, 
  FileCheck, 
  Star,
  Menu,
  Github,
  Award,
  ArrowLeft,
  CheckCircle,
  Clock,
  X,
  Settings
} from 'lucide-react';

const SimpleDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleBackToHome = () => {
    navigate('/');
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="p-8 space-y-12">
            {/* Profile Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-light text-white mb-2">Professional Profile</h1>
                <p className="text-gray-400 text-sm">Complete overview of your verified professional identity</p>
              </div>
              
              {/* Identity Verification Badges */}
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <Badge className="bg-gray-800/50 text-gray-300 border-gray-700/50 text-xs px-2 py-1 cursor-pointer transition-all hover:bg-gray-700/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Blockchain ID
                  </Badge>
                  <div className="absolute top-8 right-0 w-64 p-3 bg-black border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-gray-300" />
                      <span className="text-gray-300 font-medium text-sm">Blockchain Identity</span>
                    </div>
                    <p className="text-gray-400 text-xs">Self.xyz verification complete</p>
                    <p className="text-gray-500 text-xs mt-1">Verified on-chain identity</p>
                  </div>
                </div>
                
                <div className="relative group">
                  <Badge className="bg-gray-800/50 text-gray-300 border-gray-700/50 text-xs px-2 py-1 cursor-pointer transition-all hover:bg-gray-700/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Gov ID Verified
                  </Badge>
                  <div className="absolute top-8 right-0 w-64 p-3 bg-black border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-gray-300" />
                      <span className="text-gray-300 font-medium text-sm">Government ID</span>
                    </div>
                    <p className="text-gray-400 text-xs">Aadhaar verification complete</p>
                    <p className="text-gray-500 text-xs mt-1">Verified through Self.xyz blockchain identity</p>
                  </div>
                </div>
                
                <div className="relative group">
                  <Badge className="bg-gray-900/50 text-gray-500 border-gray-800/50 text-xs px-2 py-1 cursor-pointer transition-all hover:bg-gray-800/50">
                    <X className="w-3 h-3 mr-1" />
                    Phone
                  </Badge>
                  <div className="absolute top-8 right-0 w-64 p-3 bg-black border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <X className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500 font-medium text-sm">Phone Verification</span>
                    </div>
                    <p className="text-gray-400 text-xs">Not started</p>
                    <p className="text-gray-500 text-xs mt-1">Click to begin verification</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Overview */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">John Doe</h3>
                      <p className="text-gray-400 text-sm">Full Stack Developer</p>
                      <Badge variant="outline" className="mt-2 border-gray-600 text-gray-300">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="text-center">
                    <div className="text-2xl font-light text-white">847</div>
                    <div className="text-gray-400 text-sm">Trust Score</div>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="text-center">
                    <div className="text-2xl font-light text-white">12</div>
                    <div className="text-gray-400 text-sm">Verified Skills</div>
                  </div>
                </Card>
              </div>
            </section>



            {/* Credentials */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Verified Credentials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">Computer Science Degree</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">MIT • 2020</p>
                    <p className="text-gray-400 text-xs">SBT: 0x...abc123</p>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">AWS Solutions Architect</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">Amazon Web Services • 2023</p>
                    <p className="text-gray-400 text-xs">SBT: 0x...def456</p>
                  </div>
                </Card>
              </div>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                Add New Credential
              </Button>
            </section>

            {/* Skills Analysis */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Skills Analysis</h2>
              <Card className="bg-white/5 border-gray-800 p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Github className="w-8 h-8 text-gray-400" />
                  <div>
                    <h3 className="text-white font-medium">GitHub Analysis</h3>
                    <p className="text-gray-400 text-sm">Last updated: 2 hours ago</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">JavaScript</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full">
                        <div className="w-20 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-white text-sm">Expert</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">React</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full">
                        <div className="w-18 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-white text-sm">Advanced</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Python</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full">
                        <div className="w-16 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-white text-sm">Intermediate</span>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Reputation System */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Reputation & Karma</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-gray-800 p-6 text-center">
                  <div className="text-3xl font-light text-white mb-2">847</div>
                  <div className="text-gray-400 text-sm">Total Karma</div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6 text-center">
                  <div className="text-3xl font-light text-white mb-2">23</div>
                  <div className="text-gray-400 text-sm">Endorsements</div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6 text-center">
                  <div className="text-3xl font-light text-white mb-2">95%</div>
                  <div className="text-gray-400 text-sm">Success Rate</div>
                </Card>
              </div>
              
              <Card className="bg-white/5 border-gray-800 p-6">
                <h3 className="text-white font-medium mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Completed project verification</span>
                    <span className="text-green-400">+50 karma</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Received peer endorsement</span>
                    <span className="text-green-400">+15 karma</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Skills tournament participation</span>
                    <span className="text-green-400">+25 karma</span>
                  </div>
                </div>
              </Card>
            </section>

            {/* Achievements */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-gray-800 p-6 text-center">
                  <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Early Adopter</h3>
                  <p className="text-gray-400 text-sm">First 1000 users on TrustHire</p>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6 text-center">
                  <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Identity Verified</h3>
                  <p className="text-gray-400 text-sm">Completed full identity verification</p>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6 text-center">
                  <Github className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Code Contributor</h3>
                  <p className="text-gray-400 text-sm">Active GitHub contributor</p>
                </Card>
              </div>
            </section>
          </div>
        );

      case 'settings':
        return (
          <div className="p-8 space-y-12">
            <div>
              <h1 className="text-2xl font-light text-white mb-2">Settings</h1>
              <p className="text-gray-400 text-sm">Manage your account preferences and security</p>
            </div>
            
            {/* Account Settings */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Account Settings</h2>
              <Card className="bg-white/5 border-gray-800 p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                        placeholder="John Doe"
                        defaultValue="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                        placeholder="Full Stack Developer"
                        defaultValue="Full Stack Developer"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="john@example.com"
                      defaultValue="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Tell others about yourself..."
                      defaultValue="Passionate full-stack developer with expertise in React, Node.js, and blockchain technologies. Always learning and building innovative solutions."
                    />
                  </div>
                  
                  <Button className="bg-white text-black hover:bg-gray-200">
                    Save Changes
                  </Button>
                </div>
              </Card>
            </section>

            {/* Privacy Settings */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Privacy Settings</h2>
              <div className="space-y-4">
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Profile Visibility</h3>
                      <p className="text-gray-400 text-sm">Make your profile visible to employers</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      Public
                    </Button>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Skill Analytics</h3>
                      <p className="text-gray-400 text-sm">Allow AI analysis of your GitHub repositories</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      Enabled
                    </Button>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Job Recommendations</h3>
                      <p className="text-gray-400 text-sm">Receive personalized job recommendations</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      Enabled
                    </Button>
                  </div>
                </Card>
              </div>
            </section>


            {/* Notification Settings */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Notifications</h2>
              <div className="space-y-4">
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Email Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive updates about your profile and opportunities</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      Enabled
                    </Button>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Job Alerts</h3>
                      <p className="text-gray-400 text-sm">Get notified about new job opportunities</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      Enabled
                    </Button>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Verification Updates</h3>
                      <p className="text-gray-400 text-sm">Updates on credential and identity verification</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      Enabled
                    </Button>
                  </div>
                </Card>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-red-400 border-b border-red-800 pb-2">Danger Zone</h2>
              <Card className="bg-red-500/5 border-red-800 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-red-400 font-medium">Export Data</h3>
                    <p className="text-gray-400 text-sm">Download all your personal data and verification records</p>
                    <Button variant="outline" size="sm" className="mt-2 border-red-600 text-red-400 hover:bg-red-500/10">
                      Export Data
                    </Button>
                  </div>
                  
                  <div className="border-t border-red-800 pt-4">
                    <h3 className="text-red-400 font-medium">Delete Account</h3>
                    <p className="text-gray-400 text-sm">Permanently delete your account and all associated data</p>
                    <Button variant="outline" size="sm" className="mt-2 border-red-600 text-red-400 hover:bg-red-500/10">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        );

      default:
        return (
          <div className="p-8">
            <h1 className="text-2xl font-light text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome to TrustHire</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -240 }}
        animate={{ x: sidebarOpen ? 0 : -240 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed left-0 top-0 h-full w-60 bg-black border-r border-gray-800 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-lg font-light text-white">TrustHire</h1>
              <p className="text-xs text-gray-500 mt-1">Dashboard</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="text-gray-500 hover:text-white p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-3 py-3 text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? 'text-white border-r-2 border-white bg-white/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="text-sm font-light">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'ml-60' : 'ml-0'}`}>
        {/* Minimal Header */}
        <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-white p-2"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/profile')}
                size="sm"
                className="bg-white text-black hover:bg-gray-200"
              >
                <User className="h-4 w-4 mr-2" />
                See Profile
              </Button>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </div>
              </div>
            </div>
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SimpleDashboard;