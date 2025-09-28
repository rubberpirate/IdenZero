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
  Settings,
  Briefcase,
  Plus,
  Edit3,
  Eye,
  Users,
  GraduationCap,
  Calendar,
  ExternalLink,
  Copy,
  Hash,
  Wallet
} from 'lucide-react';
import { idenZeroApi, type IdenZeroProfile } from '@/services/idenZeroApi';
import { GithubConnectDialog } from '@/components/ui/github-connect-dialog';
import { ContributionCalendar } from '@/components/ui/contribution-calendar';
import PostJobForm from '@/components/PostJobForm';
import JobListings from '@/components/JobListings';
import JobBrowser from '@/components/JobBrowser';
import WalletConnection from '@/components/WalletConnection';
import WalletStatus from '@/components/WalletStatus';
import { jobPortalContract, JobStatus } from '@/utils/contract';
import { sbtContract, Certificate } from '@/utils/sbtContract';
import { SBTUNI_CONTRACT_ADDRESS } from '@/config/contract';
import { TestMinting } from '@/components/TestMinting';

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
  
  // Job management state
  const [showPostJobForm, setShowPostJobForm] = useState(false);
  const [jobsRefreshTrigger, setJobsRefreshTrigger] = useState(0);
  
  // Job statistics state
  const [jobStats, setJobStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    jobViews: 0
  });
  
  // User role state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'JobSeeker' | 'Employer' | 'Both' | null>(null);

  // Certificate state
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificatesError, setCertificatesError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showCertificateDetails, setShowCertificateDetails] = useState(false);
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  // IdenZero profile state
  const [idenZeroProfile, setIdenZeroProfile] = useState<IdenZeroProfile | null>(null);
  const [idenZeroLoading, setIdenZeroLoading] = useState(false);
  const [idenZeroError, setIdenZeroError] = useState<string | null>(null);

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

  // Load user data and job statistics when component mounts or jobs are refreshed
  React.useEffect(() => {
    loadCurrentUser();
    loadJobStatistics();
    loadUserCertificates();
  }, [jobsRefreshTrigger]);

  // Also load user data and statistics on initial mount after a delay to ensure wallet is connected
  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadCurrentUser();
      loadJobStatistics();
      loadUserCertificates();
      loadIdenZeroProfile(); // Load real profile data
    }, 1000);
    return () => clearTimeout(timer);
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

  // Job management handlers
  const handlePostJobSuccess = (jobId: number) => {
    console.log('Job posted successfully with ID:', jobId);
    setShowPostJobForm(false);
    // Refresh job listings and statistics
    setJobsRefreshTrigger(prev => prev + 1);
    loadJobStatistics();
  };

  // Load current user and their role
  const loadCurrentUser = async () => {
    try {
      const address = await jobPortalContract.getConnectedAddress();
      console.log('🔍 Dashboard: Connected address:', address);
      if (!address) return;

      const user = await jobPortalContract.getUser(address);
      console.log('🔍 Dashboard: User data:', user);
      if (user) {
        setCurrentUser(user);
        // Map UserType enum to string
        const roleMap = {
          0: 'JobSeeker' as const,
          1: 'Employer' as const,
          2: 'Both' as const
        };
        const detectedRole = roleMap[user.userType as keyof typeof roleMap] || null;
        console.log('🔍 Dashboard: User type from contract:', user.userType, '-> Mapped role:', detectedRole);
        setUserRole(detectedRole);
      } else {
        console.log('🔍 Dashboard: No user found for address:', address);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  // Load job statistics
  const loadJobStatistics = async () => {
    try {
      const address = await jobPortalContract.getConnectedAddress();
      if (!address) return;

      const jobIds = await jobPortalContract.getUserJobs(address);
      let activeJobs = 0;
      let totalApplications = 0;

      // Calculate statistics from user's jobs
      for (const jobId of jobIds) {
        const job = await jobPortalContract.getJob(jobId);
        if (job) {
          // Count active jobs (not closed and not expired)
          const isExpired = job.deadline * 1000 < Date.now();
          if (job.status === 0 && !isExpired) { // JobStatus.Active = 0
            activeJobs++;
          }
          
          // Add up total applications
          totalApplications += job.applicationsCount;
        }
      }

      setJobStats({
        activeJobs,
        totalApplications,
        jobViews: 0 // Job views would need to be tracked separately
      });
    } catch (error) {
      console.error('Failed to load job statistics:', error);
    }
  };

  // Load user certificates from blockchain
  const loadUserCertificates = async () => {
    setCertificatesLoading(true);
    setCertificatesError(null);
    
    try {
      const address = await sbtContract.getConnectedAddress();
      if (!address) {
        console.log('🎓 No wallet connected, skipping certificate loading');
        setCertificates([]);
        return;
      }

      console.log('🎓 Loading certificates for address:', address);
      const userCertificates = await sbtContract.getUserCertificates(address);
      console.log('🎓 Loaded certificates:', userCertificates);
      
      if (userCertificates.length === 0) {
        console.log('🎓 No certificates found. This could mean:');
        console.log('  - No certificates have been minted to this address');
        console.log('  - Contract address is incorrect');
        console.log('  - Network mismatch');
        console.log('  - Events are not being emitted properly');
      }
      
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Failed to load user certificates:', error);
      setCertificatesError(`Failed to load certificates: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCertificates([]);
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Load IdenZero profile data
  const loadIdenZeroProfile = async (username: string = 'jayesh-kr') => {
    setIdenZeroLoading(true);
    setIdenZeroError(null);
    
    try {
      console.log('🚀 Loading IdenZero profile for:', username);
      const profile = await idenZeroApi.getStreamlinedProfile(username);
      setIdenZeroProfile(profile);
      console.log('🚀 Successfully loaded IdenZero profile:', profile);
    } catch (error) {
      console.error('❌ Failed to load IdenZero profile:', error);
      setIdenZeroError(`Failed to load profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIdenZeroProfile(null);
    } finally {
      setIdenZeroLoading(false);
    }
  };

  // Refresh certificates
  const refreshCertificates = () => {
    loadUserCertificates();
  };

  // Handle certificate details display
  const handleViewCertificateDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateDetails(true);
  };

  const handleCloseCertificateDetails = () => {
    setSelectedCertificate(null);
    setShowCertificateDetails(false);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotification(`${label} copied!`);
      setTimeout(() => setCopyNotification(null), 2000);
      console.log(`${label} copied to clipboard: ${text}`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyNotification(`${label} copied!`);
      setTimeout(() => setCopyNotification(null), 2000);
    }
  };

  const handlePostJobCancel = () => {
    setShowPostJobForm(false);
  };

  const handleEditJob = (jobId: number) => {
    console.log('Edit job:', jobId);
    // TODO: Implement job editing functionality
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

  // Get GitHub stats from IdenZero API
  const getGithubStats = () => {
    if (!idenZeroProfile) return null;

    const profile = idenZeroProfile;
    const estimatedWeeklyCommits = Math.floor(profile.github_stats.total_commits / (profile.github_stats.years_active * 52));
    
    // Calculate a realistic weekly progress based on contribution streak
    const weeklyProgress = Math.min(0.95, Math.max(0.3, profile.github_stats.contribution_streak / 365));

    return {
      weeklyCommits: estimatedWeeklyCommits,
      weeklyProgress,
      languages: profile.top_languages.map(lang => ({
        name: lang.name,
        color: getLanguageColor(lang.name),
        percentage: Math.round(lang.percentage)
      })),
      repositories: profile.key_contributions.slice(0, 5).map(repo => ({
        name: repo.repository,
        commits: Math.floor(Math.random() * 50) + 10, // Estimate since not provided by API
        language: repo.primary_language
      })),
      streak: profile.github_stats.contribution_streak,
      yearlyContributions: Math.floor(profile.github_stats.total_commits / profile.github_stats.years_active)
    };
  };

  // Get language color helper function
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6', 
      'Rust': '#dea584',
      'Python': '#3572a5',
      'Java': '#b07219',
      'CSS': '#563d7c',
      'HTML': '#e34c26',
      'Go': '#00ADD8',
      'C++': '#f34b7d',
      'C': '#555555',
      'Solidity': '#AA6746',
      'Swift': '#fa7343',
      'Kotlin': '#F18E33',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'C#': '#239120',
      'Dart': '#00B4AB',
      'Shell': '#89e051',
      'Vue': '#4FC08D'
    };
    return colors[language] || '#6366f1';
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'jobs', label: 'Job Management', icon: Briefcase },
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
                      <h3 className="text-white font-medium">
                        {idenZeroProfile?.username || 'Loading...'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {idenZeroProfile?.summary?.split('.')[0] || 'Full Stack Developer'}
                      </p>
                      <Badge variant="outline" className="mt-2 border-gray-600 text-gray-300">
                        {idenZeroProfile ? 'Verified' : 'Loading...'}
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="text-center">
                    <div className="text-2xl font-light text-white">
                      {idenZeroProfile ? Math.round(idenZeroProfile.iden_score.overall_score) : '---'}
                    </div>
                    <div className="text-gray-400 text-sm">IdenScore</div>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="text-center">
                    <div className="text-2xl font-light text-white">
                      {idenZeroProfile ? idenZeroProfile.proficiency.length : '---'}
                    </div>
                    <div className="text-gray-400 text-sm">Verified Skills</div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Achievement Badges */}
            {idenZeroProfile && idenZeroProfile.badges && idenZeroProfile.badges.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">🏆 Achievement Badges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {idenZeroProfile.badges.slice(0, 6).map((badge, index) => {
                    const getBadgeColors = (rarity: string) => {
                      switch (rarity.toLowerCase()) {
                        case 'common':
                          return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                        case 'uncommon':
                          return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                        case 'rare':
                          return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                        case 'epic':
                          return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
                        case 'legendary':
                          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
                        default:
                          return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                      }
                    };

                    return (
                      <Card key={badge.id} className={`bg-white/5 border-gray-800 p-4 hover:bg-white/10 transition-all duration-200`}>
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-white font-medium text-sm">{badge.name}</h4>
                              <Badge className={`text-xs ${getBadgeColors(badge.rarity)}`}>
                                {badge.rarity}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs mb-2">{badge.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-xs capitalize">{badge.category}</span>
                              <span className="text-gray-500 text-xs">
                                {new Date(badge.earned_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {idenZeroProfile.badges.length > 6 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      View All {idenZeroProfile.badges.length} Badges
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* IdenScore Analysis */}
            {idenZeroProfile && (
              <section className="space-y-6">
                <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">🎯 IdenScore Analysis</h2>
                <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Display */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="w-24 h-24 rounded-full border-4 border-gray-700 flex items-center justify-center bg-gray-800/50">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {Math.round(idenZeroProfile.iden_score.overall_score)}
                            </div>
                            <div className="text-xs text-gray-400">/1000</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-medium text-white">
                          {idenZeroProfile.iden_score.skill_level}
                        </div>
                        <div className="text-sm text-gray-400">
                          Growth: {idenZeroProfile.iden_score.growth_potential.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          Confidence: {idenZeroProfile.iden_score.confidence_level.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="lg:col-span-2">
                      <h4 className="text-white font-medium mb-4">📊 Skill Categories</h4>
                      <div className="space-y-3">
                        {Object.entries(idenZeroProfile.iden_score.categories).map(([category, score]) => {
                          const categoryNames: Record<string, string> = {
                            'technical_mastery': '🔧 Technical Mastery',
                            'architecture_design': '🏗️ Architecture Design', 
                            'code_quality': '✨ Code Quality',
                            'innovation': '🚀 Innovation',
                            'collaboration': '🤝 Collaboration',
                            'leadership': '👑 Leadership',
                            'continuous_learning': '📚 Continuous Learning',
                            'domain_expertise': '🎓 Domain Expertise'
                          };
                          
                          const displayName = categoryNames[category] || category.replace('_', ' ');
                          const percentage = Math.min(score, 100);
                          
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-gray-300 text-sm">{displayName}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 h-2 bg-gray-700 rounded-full">
                                  <div 
                                    className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-white text-sm w-8 text-right">{score.toFixed(0)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Strengths and Areas for Improvement */}
                  <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          💪 Top Strength
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {idenZeroProfile.iden_score.top_strength}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          📈 Focus Area
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {idenZeroProfile.iden_score.improvement_area}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  {idenZeroProfile.iden_score.recommended_actions && idenZeroProfile.iden_score.recommended_actions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-700/50">
                      <h4 className="text-white font-medium mb-4">💡 Recommended Actions</h4>
                      <div className="space-y-3">
                        {idenZeroProfile.iden_score.recommended_actions.slice(0, 3).map((action, index) => {
                          const priorityColors = {
                            'high': 'border-l-red-500',
                            'medium': 'border-l-yellow-500',
                            'low': 'border-l-green-500'
                          };
                          
                          return (
                            <div key={index} className={`bg-gray-800/30 p-3 rounded-lg border-l-4 ${priorityColors[action.priority as keyof typeof priorityColors] || 'border-l-gray-500'}`}>
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="text-white font-medium text-sm">{action.title}</h5>
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                  +{action.impact_points} pts
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span>📅 {action.timeline}</span>
                                <span>⚡ Effort: {action.effort_level}/10</span>
                                <span className="capitalize">🔥 {action.priority}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Next Milestone */}
                  <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
                    <p className="text-gray-300 text-sm">
                      🎯 <strong>Next Target:</strong> {Math.round(idenZeroProfile.iden_score.next_milestone)} points
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      🔒 Verified: {idenZeroProfile.iden_score.verification_hash}...
                    </p>
                  </div>
                </Card>
              </section>
            )}

            {/* Domain Expertise */}
            {idenZeroProfile && idenZeroProfile.domain_expertise && (
              <section className="space-y-6">
                <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">🎓 Domain Expertise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(idenZeroProfile.domain_expertise).map(([domain, expertise]) => {
                    const domainIcons: Record<string, string> = {
                      'ai_ml': '🤖',
                      'web3': '⛓️',
                      'cybersecurity': '🔒',
                      'data_science': '📊',
                      'devops': '⚙️',
                      'iot': '📡',
                      'mobile': '📱',
                      'gaming': '🎮'
                    };

                    const domainNames: Record<string, string> = {
                      'ai_ml': 'AI/ML',
                      'web3': 'Web3',
                      'cybersecurity': 'Cybersecurity', 
                      'data_science': 'Data Science',
                      'devops': 'DevOps',
                      'iot': 'IoT',
                      'mobile': 'Mobile Development',
                      'gaming': 'Game Development'
                    };

                    const getLevelColor = (level: string) => {
                      switch (level.toLowerCase()) {
                        case 'beginner':
                          return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                        case 'intermediate':
                          return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                        case 'advanced':
                          return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                        case 'expert':
                          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
                        default:
                          return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                      }
                    };

                    const displayName = domainNames[domain] || domain.replace('_', ' ');
                    const icon = domainIcons[domain] || '🔧';
                    const percentage = Math.min(expertise.score, 100);

                    return (
                      <Card key={domain} className="bg-white/5 border-gray-800 p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{icon}</span>
                              <span className="text-white font-medium text-sm">{displayName}</span>
                            </div>
                            <Badge className={`text-xs ${getLevelColor(expertise.level)}`}>
                              {expertise.level}
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-400 text-xs">Score</span>
                              <span className="text-white text-sm font-medium">
                                {expertise.score.toFixed(1)}/100
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full">
                              <div 
                                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>

                          {expertise.projects > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Projects</span>
                              <span className="text-gray-300">{expertise.projects}</span>
                            </div>
                          )}

                          {expertise.technologies && expertise.technologies.length > 0 && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Technologies:</p>
                              <div className="flex flex-wrap gap-1">
                                {expertise.technologies.slice(0, 3).map((tech, index) => (
                                  <Badge key={index} className="bg-gray-700/50 text-gray-300 text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {expertise.technologies.length > 3 && (
                                  <Badge className="bg-gray-700/50 text-gray-400 text-xs">
                                    +{expertise.technologies.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top Languages */}
            {idenZeroProfile && idenZeroProfile.top_languages && idenZeroProfile.top_languages.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">🏆 Programming Languages</h2>
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="space-y-4">
                    {idenZeroProfile.top_languages.map((language, index) => {
                      const languageColor = getLanguageColor(language.name);
                      
                      return (
                        <div key={language.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: languageColor }}
                            ></div>
                            <span className="text-white font-medium">{language.name}</span>
                            <span className="text-gray-400 text-sm">
                              ({language.lines_of_code.toLocaleString()} lines)
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-32 h-2 bg-gray-700 rounded-full">
                              <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${language.percentage}%`,
                                  backgroundColor: languageColor
                                }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium w-12 text-right">
                              {language.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-light text-white">
                          {idenZeroProfile.top_languages.length}
                        </div>
                        <div className="text-gray-400 text-sm">Languages</div>
                      </div>
                      <div>
                        <div className="text-lg font-light text-white">
                          {idenZeroProfile.top_languages.reduce((total, lang) => total + lang.lines_of_code, 0).toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">Total Lines</div>
                      </div>
                      <div>
                        <div className="text-lg font-light text-white">
                          {idenZeroProfile.top_languages[0]?.name || 'N/A'}
                        </div>
                        <div className="text-gray-400 text-sm">Primary Language</div>
                      </div>
                      <div>
                        <div className="text-lg font-light text-white">
                          {idenZeroProfile.github_stats.contribution_streak}
                        </div>
                        <div className="text-gray-400 text-sm">Day Streak</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Credentials */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Verified Credentials</h2>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={refreshCertificates}
                  disabled={certificatesLoading}
                >
                  {certificatesLoading ? (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <GraduationCap className="w-4 h-4 mr-2" />
                  )}
                  {certificatesLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
              
              {certificatesLoading && (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400">Loading your certificates from blockchain...</p>
                </div>
              )}

              {certificatesError && (
                <Card className="bg-red-500/5 border-red-800 p-6">
                  <div className="flex items-center space-x-3">
                    <X className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">Error Loading Certificates</p>
                      <p className="text-red-300/70 text-sm mt-1">{certificatesError}</p>
                    </div>
                  </div>
                </Card>
              )}

              {!certificatesLoading && !certificatesError && certificates.length === 0 && (
                <Card className="bg-white/5 border-gray-800 p-8">
                  <div className="text-center">
                    <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No Certificates Found</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      You don't have any verified credentials yet.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1 mb-4">
                      <p>• Make sure your wallet is connected</p>
                      <p>• Check if you're on the correct network</p>
                      <p>• Verify the contract address is correct</p>
                      <p>• Try minting a test certificate below if you're the contract owner</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveSection('settings')}
                      className="border-gray-600 text-gray-300"
                    >
                      Go to Developer Tools
                    </Button>
                  </div>
                </Card>
              )}

              {!certificatesLoading && certificates.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                      <Card key={certificate.tokenId} className="bg-white/5 border-gray-800 p-6 hover:bg-white/10 transition-all duration-200">
                        <div className="space-y-4">
                          {/* Certificate Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-white font-medium mb-1 break-words">
                                {certificate.courseName || certificate.certificateType || 'Certificate'}
                              </h3>
                              {certificate.studentName && (
                                <p className="text-gray-300 text-sm mb-2">
                                  {certificate.studentName}
                                </p>
                              )}
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              {certificate.isValid && !certificate.revoked ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                  <X className="w-3 h-3 mr-1" />
                                  {certificate.revoked ? 'Revoked' : 'Invalid'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Certificate Details */}
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-400 text-sm">
                              <FileCheck className="w-4 h-4 mr-2" />
                              <span>{certificate.certificateType}</span>
                            </div>
                            
                            {certificate.grade && (
                              <div className="flex items-center text-gray-400 text-sm">
                                <Star className="w-4 h-4 mr-2" />
                                <span>Grade: {certificate.grade}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-gray-400 text-sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Issued: {sbtContract.formatDate(certificate.issuedAt)}</span>
                            </div>
                          </div>
                          
                          {/* Token Information */}
                          <div className="pt-3 border-t border-gray-800">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-gray-500">
                                Token {sbtContract.formatTokenId(certificate.tokenId)}
                              </span>
                              <span className="text-gray-500 font-mono">
                                {sbtContract.getShortTokenId(certificate.tokenId)}
                              </span>
                            </div>
                            
                            <div className="mt-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-0 h-auto text-xs"
                                onClick={() => handleViewCertificateDetails(certificate)}
                              >
                                <Hash className="w-3 h-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Certificate Statistics */}
                  <Card className="bg-white/5 border-gray-800 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-light text-white mb-1">
                          {certificates.length}
                        </div>
                        <div className="text-gray-400 text-sm">Total Certificates</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-white mb-1">
                          {certificates.filter(cert => cert.isValid && !cert.revoked).length}
                        </div>
                        <div className="text-gray-400 text-sm">Valid Certificates</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-white mb-1">
                          {new Set(certificates.map(cert => cert.certificateType)).size}
                        </div>
                        <div className="text-gray-400 text-sm">Certificate Types</div>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </section>

            {/* Certificate Details Modal */}
            {showCertificateDetails && selectedCertificate && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="bg-black border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-light text-white mb-2">Certificate Details</h3>
                        <p className="text-gray-400 text-sm">
                          Token #{selectedCertificate.tokenId} • {selectedCertificate.certificateType}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCloseCertificateDetails}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Copy Notification */}
                    {copyNotification && (
                      <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{copyNotification}</span>
                        </div>
                      </div>
                    )}

                    {/* Certificate Information */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-sm">Student Name</label>
                          <p className="text-white font-medium">
                            {selectedCertificate.studentName || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Course Name</label>
                          <p className="text-white font-medium">
                            {selectedCertificate.courseName || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Grade</label>
                          <p className="text-white font-medium">
                            {selectedCertificate.grade || 'Not available'}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Issue Date</label>
                          <p className="text-white font-medium">
                            {sbtContract.formatDate(selectedCertificate.issuedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <div className="mt-1">
                          {selectedCertificate.isValid && !selectedCertificate.revoked ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Valid & Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <X className="w-3 h-3 mr-1" />
                              {selectedCertificate.revoked ? 'Revoked' : 'Invalid'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Token Information */}
                      <div className="border-t border-gray-800 pt-4">
                        <h4 className="text-white font-medium mb-4">Blockchain Information</h4>
                        
                        <div className="space-y-3">
                          {/* Token ID */}
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <label className="text-gray-400 text-sm">Token ID</label>
                              <p className="text-white font-mono">
                                {selectedCertificate.tokenId}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(selectedCertificate.tokenId.toString(), 'Token ID')}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Token Hash (hex representation) */}
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex-1">
                              <label className="text-gray-400 text-sm">Token Hash</label>
                              <p className="text-white font-mono text-sm break-all">
                                {`0x${selectedCertificate.tokenId.toString(16).padStart(64, '0')}`}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`0x${selectedCertificate.tokenId.toString(16).padStart(64, '0')}`, 'Token Hash')}
                              className="text-gray-400 hover:text-white ml-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Metadata URI */}
                          {selectedCertificate.metadataURI && (
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex-1">
                                <label className="text-gray-400 text-sm">Metadata URI</label>
                                <p className="text-white font-mono text-sm break-all">
                                  {selectedCertificate.metadataURI}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedCertificate.metadataURI, 'Metadata URI')}
                                className="text-gray-400 hover:text-white ml-2"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {/* Contract Address */}
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex-1">
                              <label className="text-gray-400 text-sm">Contract Address</label>
                              <p className="text-white font-mono text-sm break-all">
                                {SBTUNI_CONTRACT_ADDRESS}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(SBTUNI_CONTRACT_ADDRESS, 'Contract Address')}
                              className="text-gray-400 hover:text-white ml-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
                      <Button
                        onClick={handleCloseCertificateDetails}
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Skills Analysis */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Skills Analysis</h2>
              <Card className="bg-white/5 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Github className={`w-8 h-8 ${idenZeroProfile ? 'text-green-400' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="text-white font-medium">IdenZero Skills Analysis</h3>
                      <p className="text-gray-400 text-sm">
                        {idenZeroProfile ? `Last updated: ${new Date(idenZeroProfile.last_updated).toLocaleDateString()}` : 'Loading skills analysis...'}
                      </p>
                    </div>
                  </div>
                  {idenZeroLoading && (
                    <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                  )}
                </div>
                
                {idenZeroError && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-red-400 text-sm mb-2">Failed to load skills data</p>
                    <p className="text-gray-500 text-xs">{idenZeroError}</p>
                  </div>
                )}
                
                {idenZeroProfile && !idenZeroError ? (
                  <div className="space-y-4">
                    {idenZeroProfile.proficiency.map((skill, index) => {
                      // Calculate skill level based on position and other factors
                      const getSkillLevel = (skill: string, index: number) => {
                        const levels = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
                        return levels[Math.min(index, levels.length - 1)];
                      };
                      
                      const getSkillWidth = (index: number) => {
                        const widths = ['w-20', 'w-18', 'w-16', 'w-14'];
                        return widths[Math.min(index, widths.length - 1)];
                      };

                      const skillLevel = getSkillLevel(skill, index);
                      const skillWidth = getSkillWidth(index);

                      return (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-gray-300">{skill}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full">
                              <div className={`${skillWidth} h-2 bg-white rounded-full`}></div>
                            </div>
                            <span className="text-white text-sm">{skillLevel}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !idenZeroError && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-600 animate-spin" />
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Loading your skills analysis from IdenZero...
                    </p>
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

            {/* Key Contributions */}
            {idenZeroProfile && idenZeroProfile.key_contributions && idenZeroProfile.key_contributions.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">🌟 Key Contributions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {idenZeroProfile.key_contributions.slice(0, 6).map((contribution, index) => (
                    <Card key={index} className="bg-white/5 border-gray-800 p-6 hover:bg-white/10 transition-all duration-200">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h4 className="text-white font-medium text-lg flex items-center space-x-2">
                            <span>{contribution.repository}</span>
                          </h4>
                          <div className="flex items-center space-x-2">
                            {contribution.stars > 0 && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                ⭐ {contribution.stars}
                              </Badge>
                            )}
                            {contribution.primary_language && (
                              <Badge 
                                className="text-xs"
                                style={{
                                  backgroundColor: `${getLanguageColor(contribution.primary_language)}20`,
                                  color: getLanguageColor(contribution.primary_language),
                                  borderColor: `${getLanguageColor(contribution.primary_language)}30`
                                }}
                              >
                                {contribution.primary_language}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm line-clamp-3">
                          {contribution.description || 'No description available'}
                        </p>
                        
                        {contribution.readme_insights && (
                          <div className="bg-blue-500/10 border-l-4 border-blue-500/50 p-3 rounded">
                            <p className="text-blue-400 text-sm">
                              💡 {contribution.readme_insights}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                          <span className="text-gray-500 text-xs">Repository</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-white p-0 h-auto"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {/* GitHub Stats Summary */}
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-light text-white mb-1">
                        {idenZeroProfile.github_stats.public_repos}
                      </div>
                      <div className="text-gray-400 text-sm">Public Repos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-light text-white mb-1">
                        {idenZeroProfile.github_stats.total_commits.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">Total Commits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-light text-white mb-1">
                        {idenZeroProfile.github_stats.total_stars}
                      </div>
                      <div className="text-gray-400 text-sm">Total Stars</div>
                    </div>
                    <div>
                      <div className="text-2xl font-light text-white mb-1">
                        {idenZeroProfile.github_stats.years_active.toFixed(1)}
                      </div>
                      <div className="text-gray-400 text-sm">Years Active</div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

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

            {/* Developer Tools */}
            <section className="space-y-6">
              <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Developer Tools</h2>
              <div className="space-y-4">
                <TestMinting onCertificateMinted={refreshCertificates} />
                
                <Card className="bg-white/5 border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Export Data</h3>
                      <p className="text-gray-400 text-sm">Download all your personal data and verification records</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600/10">
                      Export Data
                    </Button>
                  </div>
                </Card>
              </div>
            </section>
          </div>
        );

      case 'jobs':
        return (
          <WalletConnection>
            <div className="p-8 space-y-12">
              {/* Show loading state while determining user role */}
              {!userRole ? (
                <div className="text-center py-12">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                  <p className="text-white">Loading your profile...</p>
                </div>
              ) : userRole === 'JobSeeker' ? (
                // Job Seeker View - Browse and apply to jobs
                <>
                  {console.log('🔍 Dashboard: Rendering JobSeeker view for role:', userRole)}
                  <div>
                    <h1 className="text-2xl font-light text-white mb-2">Browse Jobs</h1>
                    <p className="text-gray-400 text-sm">Find and apply to job opportunities</p>
                  </div>
                  
                  <JobBrowser refreshTrigger={jobsRefreshTrigger} />
                </>
              ) : (
                // Employer/Both View - Manage job postings
                <>
                  {console.log('🔍 Dashboard: Rendering Employer/Both view for role:', userRole)}
                  {showPostJobForm ? (
                    <div>
                      <div className="mb-8">
                        <h1 className="text-2xl font-light text-white mb-2">Post New Job</h1>
                        <p className="text-gray-400 text-sm">Create a new job listing to find qualified candidates</p>
                      </div>
                      <PostJobForm 
                        onCancel={handlePostJobCancel}
                        onSuccess={handlePostJobSuccess}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h1 className="text-2xl font-light text-white mb-2">Job Management</h1>
                        <p className="text-gray-400 text-sm">Post and manage your job listings</p>
                      </div>
                      
                      {/* Role indicator */}
                      <Card className="bg-blue-500/5 border-blue-500/20 p-4">
                        <div className="flex items-center">
                          <Briefcase className="w-5 h-5 text-blue-400 mr-2" />
                          <span className="text-blue-400 font-medium text-sm">
                            {userRole === 'Both' ? 'Employer & Job Seeker' : 'Employer'} Dashboard
                          </span>
                          {userRole === 'Both' && (
                            <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">
                              Dual Role
                            </Badge>
                          )}
                        </div>
                      </Card>
                      
                      {/* Job Management Actions */}
                      <section className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Your Job Listings</h2>
                          <Button 
                            onClick={() => setShowPostJobForm(true)}
                            className="bg-white text-black hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Post New Job
                          </Button>
                        </div>
                        
                        <JobListings 
                          refreshTrigger={jobsRefreshTrigger}
                          onEditJob={handleEditJob}
                          onJobAction={loadJobStatistics}
                        />
                      </section>

                      {/* Quick Stats */}
                      <section className="space-y-6">
                        <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Job Statistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card className="bg-white/5 border-gray-800 p-6 text-center">
                            <Briefcase className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{jobStats.activeJobs}</div>
                            <div className="text-sm text-gray-400">Active Jobs</div>
                          </Card>
                          
                          <Card className="bg-white/5 border-gray-800 p-6 text-center">
                            <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{jobStats.totalApplications}</div>
                            <div className="text-sm text-gray-400">Total Applications</div>
                          </Card>
                          
                          <Card className="bg-white/5 border-gray-800 p-6 text-center">
                            <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{jobStats.jobViews}</div>
                            <div className="text-sm text-gray-400">Job Views</div>
                          </Card>
                        </div>
                      </section>

                      {/* Browse Jobs Section for Both role and optional for Employers */}
                      {(userRole === 'Both' || userRole === 'Employer') && (
                        <section className="space-y-6">
                          <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">
                            {userRole === 'Both' ? 'Browse Other Jobs' : 'Browse Available Jobs'}
                          </h2>
                          <p className="text-gray-400 text-sm mb-4">
                            {userRole === 'Both' 
                              ? 'Since you\'re registered as both an employer and job seeker, you can also browse and apply to other opportunities.'
                              : 'View all available job opportunities in the platform.'
                            }
                          </p>
                          <JobBrowser refreshTrigger={jobsRefreshTrigger} />
                        </section>
                      )}

                      {/* Help Section */}
                      <section className="space-y-6">
                        <h2 className="text-lg font-light text-white border-b border-gray-800 pb-2">Getting Started</h2>
                        <Card className="bg-white/5 border-gray-800 p-6">
                          <h3 className="text-white font-medium mb-4">How to post your first job</h3>
                          <div className="space-y-3 text-sm text-gray-400">
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                              <div>
                                <div className="text-white font-medium">Connect your wallet</div>
                                <div>Make sure you have a Web3 wallet connected to post jobs on the blockchain</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                              <div>
                                <div className="text-white font-medium">Fill out job details</div>
                                <div>Provide comprehensive information about the role, requirements, and compensation</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                              <div>
                                <div className="text-white font-medium">Review and publish</div>
                                <div>Your job will be stored on the blockchain and visible to potential candidates</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </section>
                    </>
                  )}
                </>
              )}
            </div>
          </WalletConnection>
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
        className="fixed left-0 top-0 h-full w-60 bg-zinc-950/98 backdrop-blur-xl border-r border-zinc-800/50 z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/30">
            <div>
              <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">IdenZero</h1>
              <p className="text-xs text-zinc-500 mt-1 font-medium tracking-wide">DASHBOARD</p>
            </div>
            <button
              onClick={handleBackToHome}
              className="text-zinc-400 hover:text-zinc-100 p-2 rounded-xl hover:bg-zinc-800/40 transition-all duration-200 border border-transparent hover:border-zinc-700/50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
          
          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group w-full flex items-center px-4 py-3 text-left transition-all duration-300 rounded-2xl relative overflow-hidden ${
                    activeSection === item.id
                      ? 'text-zinc-50 bg-zinc-800 shadow-lg border border-zinc-600/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent hover:border-zinc-700/30'
                  }`}
                >
                  <div className={`absolute inset-0 bg-zinc-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    activeSection === item.id ? 'opacity-100' : ''
                  }`} />
                  <Icon className="h-4 w-4 mr-3 relative z-10" />
                  <span className="text-sm font-medium relative z-10 tracking-wide">{item.label}</span>
                  {item.id === 'settings' && githubConnected && (
                    <div className="ml-auto relative z-10">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 animate-pulse"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Wallet Status Component */}
          <WalletStatus />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 relative z-10 ${sidebarOpen ? 'ml-60' : 'ml-0'}`}>
        {/* Sophisticated Header */}
        <header className="bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-800/40 px-6 py-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-400 hover:text-zinc-100 p-2.5 rounded-xl hover:bg-zinc-800/40 transition-all duration-200 border border-transparent hover:border-zinc-700/50"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-zinc-200 font-semibold tracking-wide">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </div>
                <div className="text-xs text-zinc-500 font-medium tracking-wider">
                  SECTION
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-600/30 hover:border-zinc-500/50 transition-all duration-300 shadow-lg"
              >
                <User className="h-4 w-4 mr-2 inline" />
                Profile
              </button>
            </div>
          </div>
        </header>

        {/* Sophisticated Content Area */}
        <main className="bg-zinc-950 min-h-[calc(100vh-65px)] relative">
          <div className="relative z-10">
            {renderContent()}
          </div>
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