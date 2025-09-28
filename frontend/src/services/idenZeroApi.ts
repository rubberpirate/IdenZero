// IdenZero API service for fetching real user data
export interface IdenZeroProfile {
  badges: Array<{
    category: string;
    description: string;
    earned_date: string;
    icon: string;
    id: string;
    name: string;
    rarity: string;
  }>;
  domain_expertise: {
    [key: string]: {
      level: string;
      projects: number;
      score: number;
      technologies: string[];
    };
  };
  github_stats: {
    contribution_streak: number;
    followers: number;
    following: number;
    public_repos: number;
    total_commits: number;
    total_forks: number;
    total_stars: number;
    years_active: number;
  };
  iden_score: {
    categories: {
      [key: string]: number;
    };
    confidence_level: number;
    growth_potential: number;
    improvement_area: string;
    next_milestone: number;
    overall_score: number;
    recommended_actions: Array<{
      description: string;
      effort_level: number;
      impact_points: number;
      priority: string;
      timeline: string;
      title: string;
    }>;
    skill_level: string;
    top_strength: string;
    verification_hash: string;
  };
  key_contributions: Array<{
    description: string;
    primary_language: string;
    readme_insights: string | null;
    repository: string;
    stars: number;
  }>;
  last_updated: string;
  proficiency: string[];
  recent_commits: Array<{
    id: string;
    sha: string;
    message: string;
    repository: string;
    timestamp: string;
  }>;
  summary: string;
  top_languages: Array<{
    lines_of_code: number;
    name: string;
    percentage: number;
  }>;
  username: string;
}

export interface IdenZeroApiResponse {
  profile: IdenZeroProfile;
  success: boolean;
}

class IdenZeroApiService {
  private baseUrl = 'http://82.177.167.169:3030/api';
  private cache = new Map<string, { data: IdenZeroProfile; timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async getStreamlinedProfile(username: string): Promise<IdenZeroProfile> {
    // Check cache first
    const cached = this.cache.get(username);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('🚀 Using cached IdenZero profile for:', username);
      return cached.data;
    }

    try {
      console.log('🚀 Fetching IdenZero profile for:', username);
      const response = await fetch(`${this.baseUrl}/streamlined/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: IdenZeroApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('API returned success: false');
      }

      // Cache the result
      this.cache.set(username, {
        data: data.profile,
        timestamp: Date.now(),
      });

      console.log('🚀 Successfully fetched IdenZero profile:', data.profile);
      return data.profile;
    } catch (error) {
      console.error('❌ Failed to fetch IdenZero profile:', error);
      throw new Error(`Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  clearCache(username?: string) {
    if (username) {
      this.cache.delete(username);
    } else {
      this.cache.clear();
    }
  }
}

export const idenZeroApi = new IdenZeroApiService();