import React, { useState, useEffect } from 'react';
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
import { GithubConnectDialog } from '@/components/ui/github-connect-dialog';
import { ContributionCalendar } from '@/components/ui/contribution-calendar';

const SimpleDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubUserData, setGithubUserData] = useState<any>(null);

  // Check for existing GitHub connection on mount
  React.useEffect(() => {
    const checkGithubConnection = () => {
      try {
        const storedUserData = localStorage.getItem('github_user_data');
        const storedToken = localStorage.getItem('github_access_token');
        
        if (storedUserData && storedToken) {
          const userData = JSON.parse(storedUserData);
          setGithubUserData(userData);
          setGithubUsername(userData.login);
          setGithubConnected(true);
        }
      } catch (error) {
        console.error('Error checking GitHub connection:', error);
        // Clear corrupted data
        localStorage.removeItem('github_user_data');
        localStorage.removeItem('github_access_token');
      }
    };

    checkGithubConnection();
    
    // Listen for OAuth callback
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state === 'github_oauth') {
        handleGithubOAuthCallback(code);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, []);

  // GitHub OAuth configuration
  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'demo_client_id';
  const GITHUB_REDIRECT_URI = `${window.location.origin}/dashboard`;
  const GITHUB_SCOPE = 'read:user,repo';

  // Handle GitHub OAuth callback
  const handleGithubOAuthCallback = async (code: string) => {
    setGithubLoading(true);
    setGithubError(null);

    try {
      // In a real app, you'd exchange the code for an access token on your backend
      // For demo purposes, we'll simulate this process
      const mockUserData = await simulateGithubOAuth(code);
      
      // Store user data and token
      localStorage.setItem('github_user_data', JSON.stringify(mockUserData));
      localStorage.setItem('github_access_token', mockUserData.access_token);
      
      setGithubUserData(mockUserData);
      setGithubUsername(mockUserData.login);
      setGithubConnected(true);
      
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      setGithubError('Failed to connect to GitHub. Please try again.');
    } finally {
      setGithubLoading(false);
    }
  };

  // Simulate GitHub OAuth flow (replace with real implementation)
  const simulateGithubOAuth = async (code: string): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful OAuth response
    return {
      access_token: `ghp_${Math.random().toString(36).substring(2, 15)}`,
      login: 'john-dev',
      avatar_url: 'https://github.com/identicons/john-dev.png',
      name: 'John Developer',
      bio: 'Full-stack developer passionate about open source',
      public_repos: 42,
      followers: 127,
      following: 89,
      created_at: '2020-01-15T10:00:00Z',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA'
    };
  };

  // Initiate GitHub OAuth flow
  const initiateGithubOAuth = () => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: GITHUB_SCOPE,
      state: 'github_oauth',
      allow_signup: 'true'
    });

    // In a real app, redirect to GitHub OAuth
    // window.location.href = `https://github.com/login/oauth/authorize?${params}`;
    
    // For demo, simulate the OAuth flow
    const mockCode = Math.random().toString(36).substring(2, 15);
    setTimeout(() => {
      handleGithubOAuthCallback(mockCode);
    }, 100);
  };

  // Disconnect GitHub
  const disconnectGithub = () => {
    localStorage.removeItem('github_user_data');
    localStorage.removeItem('github_access_token');
    setGithubConnected(false);
    setGithubUsername('');
    setGithubUserData(null);
    setGithubError(null);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGithubConnect = () => {
    if (!githubConnected) {
      if (githubLoading) return; // Prevent multiple connections
      setShowGithubDialog(true);
    } else {
      disconnectGithub();
    }
  };

  const handleGithubConnectComplete = () => {
    setShowGithubDialog(false);
    initiateGithubOAuth();
  };

  // Get GitHub commits (would fetch from GitHub API in real implementation)
  const getGithubCommits = () => {
    if (!githubConnected || !githubUserData) return [];

    // In a real app, this would fetch from GitHub API
    const commitTypes = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'perf'];
    const realRepositories = ['IdenZero-platform', 'defi-analytics-app', 'react-portfolio', 'api-gateway'];
    const realisticMessages = [
      'implement OAuth integration with GitHub API',
      'add responsive design improvements for mobile users',
      'optimize database queries and add caching layer',
      'update documentation with new API endpoints',
      'fix memory leak in WebSocket connections',
      'add comprehensive unit tests for auth module',
      'implement real-time notification system',
      'upgrade dependencies and fix security vulnerabilities',
      'refactor user authentication flow',
      'add dark mode support with theme persistence'
    ];
    
    const generateRealisticTime = (index: number) => {
      const now = new Date();
      const hoursAgo = Math.pow(2, index) + Math.random() * 6;
      const commitTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      
      if (hoursAgo < 1) return 'just now';
      if (hoursAgo < 24) return `${Math.floor(hoursAgo)}h ago`;
      const daysAgo = Math.floor(hoursAgo / 24);
      if (daysAgo === 1) return '1 day ago';
      if (daysAgo < 7) return `${daysAgo} days ago`;
      return commitTime.toLocaleDateString();
    };
    
    return Array.from({ length: 5 }, (_, i) => {
      const type = commitTypes[Math.floor(Math.random() * commitTypes.length)];
      const message = realisticMessages[i] || realisticMessages[Math.floor(Math.random() * realisticMessages.length)];
      
      return {
        id: `commit_${Date.now()}_${i}`,
        sha: Math.random().toString(36).substring(2, 8),
        type,
        message,
        repository: realRepositories[Math.floor(Math.random() * realRepositories.length)],
        additions: Math.floor(Math.random() * 300) + 5,
        deletions: Math.floor(Math.random() * 150) + 2,
        time: generateRealisticTime(i),
        color: {
          'feat': 'green',
          'fix': 'red',
          'docs': 'blue',
          'refactor': 'purple',
          'test': 'yellow',
          'chore': 'gray',
          'style': 'pink',
          'perf': 'orange'
        }[type] || 'gray',
        url: `https://github.com/${githubUserData.login}/${realRepositories[Math.floor(Math.random() * realRepositories.length)]}/commit/${Math.random().toString(36).substring(2, 8)}`
      };
    });
  };

  // Get GitHub stats (would fetch from GitHub API)
  const getGithubStats = () => {
    if (!githubConnected || !githubUserData) return null;

    return {
      weeklyCommits: Math.floor(Math.random() * 30) + 15,
      weeklyProgress: Math.random() * 0.4 + 0.6, // 60-100%
      languages: [
        { name: 'TypeScript', color: 'blue', percentage: 45 },
        { name: 'JavaScript', color: 'yellow', percentage: 30 },
        { name: 'Rust', color: 'red', percentage: 15 },
        { name: 'Python', color: 'green', percentage: 10 }
      ],
      repositories: [
        { name: 'IdenZero-platform', commits: Math.floor(Math.random() * 20) + 10 },
        { name: 'defi-analytics-app', commits: Math.floor(Math.random() * 15) + 5 },
        { name: 'react-portfolio', commits: Math.floor(Math.random() * 10) + 3 }
      ],
      streak: Math.floor(Math.random() * 30) + 12,
      yearlyContributions: Math.floor(Math.random() * 200) + 287
    };
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Github className={`w-8 h-8 ${githubConnected ? 'text-green-400' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="text-white font-medium">GitHub Analysis</h3>
                      <p className="text-gray-400 text-sm">
                        {githubConnected ? 'Last updated: 2 hours ago' : 'Connect GitHub to see analysis'}
                      </p>
                    </div>
                  </div>
                  {!githubConnected && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => setActiveSection('settings')}
                    >
                      Connect
                    </Button>
                  )}
                </div>
                
                {githubConnected ? (
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
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Github className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Connect your GitHub account to see detailed skills analysis
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-white text-black hover:bg-gray-200"
                      onClick={() => setActiveSection('settings')}
                    >
                      Connect GitHub
                    </Button>
                  </div>
                )}
              </Card>
            </section>

            {/* GitHub Commit History */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">GitHub Activity</h2>
              {githubConnected ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Commits */}
                    <Card className="bg-white/5 border-gray-800 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium">Recent Commits</h3>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Live
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {getGithubCommits().map((commit) => (
                          <div key={commit.id} className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg border border-gray-800/50 hover:bg-black/30 transition-colors cursor-pointer">
                            <div className={`w-2 h-2 bg-${commit.color}-400 rounded-full mt-2 flex-shrink-0`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-sm font-medium truncate">
                                  {commit.type}: {commit.message}
                                </p>
                                <span className="text-gray-400 text-xs whitespace-nowrap ml-2">{commit.time}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <span>{commit.repository}</span>
                                <span>•</span>
                                <span className="text-green-400">+{commit.additions}</span>
                                <span className="text-red-400">-{commit.deletions}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        View on GitHub
                      </Button>
                    </Card>

                    {/* Contribution Stats */}
                    <Card className="bg-white/5 border-gray-800 p-6">
                      <h3 className="text-white font-medium mb-4">Contribution Overview</h3>
                      
                      <div className="space-y-4">
                        {(() => {
                          const stats = getGithubStats();
                          if (!stats) return null;

                          return (
                            <>
                              {/* This Week */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-300 text-sm">This Week</span>
                                  <span className="text-white font-medium">{stats.weeklyCommits} commits</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2">
                                  <div className="bg-green-400 h-2 rounded-full" style={{ width: `${stats.weeklyProgress * 100}%` }}></div>
                                </div>
                              </div>

                              {/* Languages Used */}
                              <div>
                                <span className="text-gray-300 text-sm mb-2 block">Languages This Week</span>
                                <div className="flex flex-wrap gap-2">
                                  {stats.languages.slice(0, 4).map((lang) => (
                                    <div key={lang.name} className="flex items-center space-x-1">
                                      <div className={`w-3 h-3 bg-${lang.color}-400 rounded-full`}></div>
                                      <span className="text-xs text-gray-400">{lang.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Repositories */}
                              <div>
                                <span className="text-gray-300 text-sm mb-2 block">Active Repositories</span>
                                <div className="space-y-2">
                                  {stats.repositories.map((repo) => (
                                    <div key={repo.name} className="flex items-center justify-between">
                                      <span className="text-white text-sm truncate">{repo.name}</span>
                                      <span className="text-green-400 text-xs">{repo.commits} commits</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Streak */}
                              <div className="bg-black/20 border border-gray-700 rounded-lg p-4 mt-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-white font-medium text-lg">🔥 {stats.streak} days</span>
                                    <p className="text-gray-400 text-xs">Current streak</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-green-400 font-medium">{stats.yearlyContributions}</span>
                                    <p className="text-gray-400 text-xs">Contributions this year</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </Card>
                  </div>

                  {/* Contribution Calendar */}
                  <div className="mt-6">
                    <ContributionCalendar />
                  </div>
                </>
              ) : (
                <Card className="bg-white/5 border-gray-800 p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Github className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-white font-medium mb-2">GitHub Activity</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Connect your GitHub account to view your commit history and contribution statistics
                    </p>
                    <Button 
                      className="bg-white text-black hover:bg-gray-200"
                      onClick={() => setActiveSection('settings')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Connect GitHub
                    </Button>
                  </div>
                </Card>
              )}
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
                  <p className="text-gray-400 text-sm">First 1000 users on IdenZeri</p>
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

            {/* GitHub Integration */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">GitHub Integration</h2>
              <Card className="bg-white/5 border-gray-800 p-6">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                        <Github className={`w-6 h-6 ${githubConnected ? 'text-green-400' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {githubConnected ? 'GitHub Connected' : 'Connect GitHub Account'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {githubConnected && githubUserData
                            ? `Connected as @${githubUserData.login} • ${githubUserData.public_repos} repositories • ${githubUserData.followers} followers` 
                            : githubLoading
                            ? 'Connecting to GitHub...'
                            : 'Link your GitHub to analyze your coding skills and contributions'
                          }
                        </p>
                        {githubError && (
                          <p className="text-red-400 text-xs mt-1">{githubError}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={githubConnected 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {githubConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                  
                  {githubConnected ? (
                    <div className="space-y-4">
                      <div className="bg-black/20 border border-gray-700 rounded-md p-4">
                        <h4 className="text-white font-medium mb-3">Repository Analysis</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Repositories Analyzed:</span>
                            <div className="text-white font-medium">42</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Languages Detected:</span>
                            <div className="text-white font-medium">8</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Last Updated:</span>
                            <div className="text-white font-medium">2 hours ago</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Skill Score:</span>
                            <div className="text-green-400 font-medium">847</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 flex-1">
                          <Github className="w-4 h-4 mr-2" />
                          Refresh Analysis
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-red-600 text-red-400 hover:bg-red-500/10"
                          onClick={handleGithubConnect}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-black/20 border border-gray-700 rounded-md p-4">
                        <h4 className="text-white font-medium mb-2">What we'll analyze:</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          <li>• Programming languages and frameworks used</li>
                          <li>• Code quality and contribution patterns</li>
                          <li>• Project complexity and technical skills</li>
                          <li>• Open source contributions and collaboration</li>
                        </ul>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button 
                          className="bg-white text-black hover:bg-gray-200 flex-1"
                          onClick={handleGithubConnect}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Connect GitHub
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          onClick={() => setShowGithubDialog(true)}
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  )}
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
                </div>
              </Card>
            </section>
          </div>
        );

      default:
        return (
          <div className="p-8">
            <h1 className="text-2xl font-light text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome to IdenZero</p>
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
              <h1 className="text-lg font-light text-white">IdenZero</h1>
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
                  {item.id === 'settings' && githubConnected && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
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

      {/* GitHub Connect Dialog */}
      <GithubConnectDialog
        isOpen={showGithubDialog}
        onClose={() => {
          setShowGithubDialog(false);
          setGithubError(null);
        }}
        onConnect={handleGithubConnectComplete}
        loading={githubLoading}
        error={githubError}
      />
    </div>
  );
};

export default SimpleDashboard;