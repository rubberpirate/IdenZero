use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::analyzer::{GitHubAnalyzer, SkillAnalysis, UserProfile};
use octocrab::models::Repository;
use base64::Engine;

/// Streamlined developer profile with essential information only
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StreamlinedProfile {
    pub username: String,
    pub summary: String, // 2-3 line description
    pub proficiency: Vec<String>, // Top 5 technologies
    pub top_languages: Vec<LanguageInfo>,
    pub recent_commits: Vec<CommitInfo>,
    pub key_contributions: Vec<ContributionInfo>,
    pub github_stats: GitHubStats,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LanguageInfo {
    pub name: String,
    pub percentage: f64,
    pub lines_of_code: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommitInfo {
    pub message: String,
    pub repository: String,
    pub date: DateTime<Utc>,
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContributionInfo {
    pub repository: String,
    pub description: String,
    pub stars: u32,
    pub primary_language: Option<String>,
    pub readme_insights: Option<String>, // Key insights from README
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitHubStats {
    pub public_repos: u32,
    pub followers: u32,
    pub following: u32,
    pub years_active: f64,
    pub total_commits: u32, // Estimated
}

pub struct StreamlinedAnalyzer {
    github_analyzer: GitHubAnalyzer,
}

impl StreamlinedAnalyzer {
    pub fn new(token: String) -> Result<Self, Box<dyn std::error::Error>> {
        let github_analyzer = GitHubAnalyzer::new(token)?;
        Ok(Self { github_analyzer })
    }

    /// Get streamlined profile for a user
    pub async fn get_profile(&mut self, username: String) -> Result<StreamlinedProfile, Box<dyn std::error::Error>> {
        let profile = UserProfile {
            github_username: username.clone(),
            wallet_address: None,
        };

        // Get full analysis first
        let analysis = self.github_analyzer.analyze(profile).await?;
        
        // Generate streamlined profile
        let streamlined = StreamlinedProfile {
            username: username.clone(),
            summary: self.generate_summary(&analysis),
            proficiency: self.extract_top_proficiencies(&analysis),
            top_languages: self.get_top_languages(&analysis),
            recent_commits: Vec::new(), // Simplified - avoid complex API calls
            key_contributions: self.analyze_contributions_from_analysis(&analysis),
            github_stats: GitHubStats {
                public_repos: analysis.total_repositories,
                followers: 0, // Simplified
                following: 0, // Simplified
                years_active: analysis.years_active,
                total_commits: self.estimate_total_commits(&analysis),
            },
            last_updated: chrono::Utc::now(),
        };

        Ok(streamlined)
    }

    fn generate_summary(&self, analysis: &SkillAnalysis) -> String {
        let primary_lang = analysis.language_breakdown
            .iter()
            .max_by(|a, b| a.1.lines_of_code.partial_cmp(&b.1.lines_of_code).unwrap())
            .map(|(k, _)| k.as_str())
            .unwrap_or("Multi-language");

        let experience_level = if analysis.years_active > 8.0 {
            "Senior"
        } else if analysis.years_active > 4.0 {
            "Mid-level"
        } else {
            "Junior"
        };

        let specialization = if !analysis.specializations.is_empty() {
            &analysis.specializations[0].area
        } else {
            "Software Development"
        };

        format!(
            "{} developer with {:.1} years of experience in {}. Specialized in {} with {} public repositories and strong focus on {}.",
            experience_level,
            analysis.years_active,
            primary_lang,
            specialization,
            analysis.total_repositories,
            if analysis.web3_expertise > 0.5 { "Web3/Blockchain" } else { "traditional software development" }
        )
    }

    fn extract_top_proficiencies(&self, analysis: &SkillAnalysis) -> Vec<String> {
        let mut proficiencies = Vec::new();

        // Add top languages
        let mut langs: Vec<_> = analysis.language_breakdown.iter().collect();
        langs.sort_by(|a, b| b.1.lines_of_code.partial_cmp(&a.1.lines_of_code).unwrap());
        proficiencies.extend(langs.iter().take(3).map(|(k, _)| k.to_string()));

        // Add specializations
        proficiencies.extend(analysis.specializations.iter().take(2).map(|s| s.area.clone()));

        proficiencies.truncate(5);
        proficiencies
    }

    fn get_top_languages(&self, analysis: &SkillAnalysis) -> Vec<LanguageInfo> {
        let total_lines: u64 = analysis.language_breakdown.values().map(|l| l.lines_of_code).sum();
        
        let mut languages: Vec<_> = analysis.language_breakdown
            .iter()
            .map(|(name, skill)| LanguageInfo {
                name: name.clone(),
                percentage: (skill.lines_of_code as f64 / total_lines as f64) * 100.0,
                lines_of_code: skill.lines_of_code,
            })
            .collect();

        languages.sort_by(|a, b| b.percentage.partial_cmp(&a.percentage).unwrap());
        languages.truncate(5);
        languages
    }

    fn analyze_contributions_from_analysis(&self, analysis: &SkillAnalysis) -> Vec<ContributionInfo> {
        analysis.repository_analysis
            .iter()
            .take(5)
            .map(|repo| ContributionInfo {
                repository: repo.name.clone(),
                description: repo.description.clone().unwrap_or("No description available".to_string()),
                stars: repo.stars,
                primary_language: repo.primary_language.clone(),
                readme_insights: None, // Simplified
            })
            .collect()
    }

    fn estimate_total_commits(&self, analysis: &SkillAnalysis) -> u32 {
        // Rough estimation based on repositories and activity
        (analysis.total_repositories as f64 * analysis.years_active * 50.0) as u32
    }
}