// GitHub configuration and utilities
export const GITHUB_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || 'demo_client_id',
  REDIRECT_URI: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '',
  SCOPE: 'read:user,repo,user:email',
  BASE_URL: 'https://api.github.com'
};

// GitHub API types
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// Utility functions for GitHub API
export class GitHubAPI {
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || localStorage.getItem('github_access_token');
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${GITHUB_CONFIG.BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'IdenZero-Dashboard'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<GitHubUser> {
    return this.makeRequest<GitHubUser>('/user');
  }

  async getUserRepos(username: string, per_page = 30): Promise<GitHubRepo[]> {
    return this.makeRequest<GitHubRepo[]>(`/users/${username}/repos?sort=updated&per_page=${per_page}`);
  }

  async getRepoCommits(owner: string, repo: string, per_page = 10): Promise<GitHubCommit[]> {
    return this.makeRequest<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=${per_page}`);
  }

  async getUserEvents(username: string, per_page = 30) {
    return this.makeRequest(`/users/${username}/events?per_page=${per_page}`);
  }
}

// OAuth helper functions
export const initiateGitHubOAuth = () => {
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.CLIENT_ID,
    redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
    scope: GITHUB_CONFIG.SCOPE,
    state: generateOAuthState(),
    allow_signup: 'true'
  });

  // Store state for validation
  localStorage.setItem('github_oauth_state', params.get('state')!);
  
  // Redirect to GitHub OAuth
  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
};

export const generateOAuthState = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const validateOAuthState = (receivedState: string): boolean => {
  const storedState = localStorage.getItem('github_oauth_state');
  localStorage.removeItem('github_oauth_state');
  return storedState === receivedState;
};

// Mock data generators for development
export const generateMockGitHubUser = (): GitHubUser => ({
  login: 'john-dev',
  id: 123456,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
  name: 'John Developer',
  company: 'TechCorp Inc.',
  blog: 'https://johndeveloper.dev',
  location: 'San Francisco, CA',
  email: 'john@example.com',
  bio: 'Full-stack developer passionate about open source and Web3',
  public_repos: 42,
  public_gists: 15,
  followers: 127,
  following: 89,
  created_at: '2020-01-15T10:00:00Z',
  updated_at: new Date().toISOString()
});

export const generateMockCommits = (count = 10): any[] => {
  const commitTypes = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'perf'];
  const repositories = ['IdenZero-platform', 'defi-analytics', 'portfolio-site', 'blockchain-voting'];
  const messages = [
    'implement OAuth integration with GitHub API',
    'add responsive design improvements',
    'optimize database queries and caching',
    'update documentation with examples',
    'fix memory leak in WebSocket connections',
    'add comprehensive unit tests',
    'implement real-time notifications',
    'upgrade dependencies and fix vulnerabilities',
    'refactor authentication middleware',
    'add dark mode theme support'
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = commitTypes[Math.floor(Math.random() * commitTypes.length)];
    const message = messages[i % messages.length];
    const now = new Date();
    const commitTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    return {
      sha: Math.random().toString(36).substring(2, 8),
      type,
      message: `${type}: ${message}`,
      repository: repositories[Math.floor(Math.random() * repositories.length)],
      author: 'john-dev',
      date: commitTime.toISOString(),
      additions: Math.floor(Math.random() * 200) + 10,
      deletions: Math.floor(Math.random() * 100) + 5,
      url: `https://github.com/john-dev/${repositories[0]}/commit/${Math.random().toString(36).substring(2, 8)}`
    };
  });
};