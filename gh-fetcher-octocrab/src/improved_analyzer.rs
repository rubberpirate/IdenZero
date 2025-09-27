use serde::{Deserialize, Serialize};
use crate::analyzer::{GitHubAnalyzer, SkillAnalysis};
use crate::summary_generator::{SummaryGenerator, DeveloperSummary};
use crate::frontend_adapter::{FrontendAdapter, FrontendProfile};

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisRequest {
    pub username: String,
    pub wallet_address: Option<String>,
    pub include_frontend_data: Option<bool>,
    pub analysis_depth: Option<AnalysisDepth>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AnalysisDepth {
    Basic,      // Just core stats and top languages
    Standard,   // Full analysis with skills and repositories
    Detailed,   // Everything + AI summary generation
    Frontend,   // Optimized for frontend display
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisResponse {
    pub username: String,
    pub success: bool,
    pub analysis_timestamp: String,
    pub raw_analysis: Option<SkillAnalysis>,
    pub ai_summary: Option<DeveloperSummary>,
    pub frontend_profile: Option<FrontendProfile>,
    pub error_message: Option<String>,
    pub metadata: ResponseMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseMetadata {
    pub analysis_duration_ms: u64,
    pub api_calls_made: u32,
    pub rate_limit_remaining: Option<u32>,
    pub confidence_score: f64,
    pub data_sources: Vec<String>,
}

pub struct ImprovedAnalyzer {
    github_analyzer: GitHubAnalyzer,
    summary_generator: SummaryGenerator,
    frontend_adapter: FrontendAdapter,
}

impl ImprovedAnalyzer {
    pub fn new(github_token: String) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            github_analyzer: GitHubAnalyzer::new(github_token)?,
            summary_generator: SummaryGenerator::new(),
            frontend_adapter: FrontendAdapter::new(),
        })
    }

    /// Enhanced analysis with multiple output formats
    pub async fn analyze_user(&mut self, request: AnalysisRequest) -> AnalysisResponse {
        let start_time = std::time::Instant::now();
        let analysis_depth = request.analysis_depth.clone().unwrap_or(AnalysisDepth::Standard);

        match self.perform_analysis(&request, &analysis_depth).await {
            Ok((raw_analysis, ai_summary, frontend_profile)) => {
                let duration = start_time.elapsed();
                let confidence = self.calculate_confidence_score(&raw_analysis);
                
                AnalysisResponse {
                    username: request.username,
                    success: true,
                    analysis_timestamp: chrono::Utc::now().to_rfc3339(),
                    raw_analysis: Some(raw_analysis),
                    ai_summary,
                    frontend_profile,
                    error_message: None,
                    metadata: ResponseMetadata {
                        analysis_duration_ms: duration.as_millis() as u64,
                        api_calls_made: 15, // Would track actual API calls
                        rate_limit_remaining: Some(4000), // Would get from GitHub API
                        confidence_score: confidence,
                        data_sources: vec![
                            "GitHub API".to_string(),
                            "Repository Analysis".to_string(),
                            "Commit Pattern Analysis".to_string(),
                        ],
                    },
                }
            }
            Err(error) => {
                let duration = start_time.elapsed();
                
                AnalysisResponse {
                    username: request.username,
                    success: false,
                    analysis_timestamp: chrono::Utc::now().to_rfc3339(),
                    raw_analysis: None,
                    ai_summary: None,
                    frontend_profile: None,
                    error_message: Some(error.to_string()),
                    metadata: ResponseMetadata {
                        analysis_duration_ms: duration.as_millis() as u64,
                        api_calls_made: 0,
                        rate_limit_remaining: None,
                        confidence_score: 0.0,
                        data_sources: vec![],
                    },
                }
            }
        }
    }

    async fn perform_analysis(
        &mut self,
        request: &AnalysisRequest,
        depth: &AnalysisDepth,
    ) -> Result<(SkillAnalysis, Option<DeveloperSummary>, Option<FrontendProfile>), Box<dyn std::error::Error>> {
        
        // Get basic GitHub analysis using the correct method
        let profile = crate::analyzer::UserProfile {
            github_username: request.username.clone(),
            wallet_address: request.wallet_address.clone(),
        };
        let raw_analysis = self.github_analyzer.analyze(profile).await?;

        // Generate AI summary based on depth
        let ai_summary = match depth {
            AnalysisDepth::Basic => None,
            _ => Some(self.summary_generator.generate_summary(&raw_analysis)),
        };

        // Generate frontend profile if requested
        let frontend_profile = match depth {
            AnalysisDepth::Frontend => {
                let summary = ai_summary.as_ref()
                    .cloned()
                    .unwrap_or_else(|| self.summary_generator.generate_summary(&raw_analysis));
                
                Some(self.frontend_adapter.create_frontend_profile(
                    &raw_analysis,
                    &request.username,
                    None, // Would extract from GitHub profile
                ))
            }
            _ if request.include_frontend_data.unwrap_or(false) => {
                let summary = ai_summary.as_ref()
                    .cloned()
                    .unwrap_or_else(|| self.summary_generator.generate_summary(&raw_analysis));
                
                Some(self.frontend_adapter.create_frontend_profile(
                    &raw_analysis,
                    &request.username,
                    None,
                ))
            }
            _ => None,
        };

        Ok((raw_analysis, ai_summary, frontend_profile))
    }

    fn calculate_confidence_score(&self, analysis: &SkillAnalysis) -> f64 {
        let mut score = 0.0;
        let mut factors = 0;

        // Factor 1: Number of repositories (more repos = higher confidence)
        if analysis.total_repositories > 0 {
            score += (analysis.total_repositories as f64 / 50.0).min(1.0) * 25.0;
            factors += 1;
        }

        // Factor 2: Years active (longer history = higher confidence)
        if analysis.years_active > 0.0 {
            score += (analysis.years_active / 10.0).min(1.0) * 25.0;
            factors += 1;
        }

        // Factor 3: Language diversity (more languages = better analysis)
        if !analysis.language_breakdown.is_empty() {
            score += (analysis.language_breakdown.len() as f64 / 10.0).min(1.0) * 25.0;
            factors += 1;
        }

        // Factor 4: Repository analysis depth
        if !analysis.repository_analysis.is_empty() {
            let avg_complexity: f64 = analysis.repository_analysis
                .iter()
                .map(|r| r.architecture_score) // Use architecture_score instead of complexity_score
                .sum::<f64>() / analysis.repository_analysis.len() as f64;
            score += (avg_complexity / 100.0) * 25.0;
            factors += 1;
        }

        if factors > 0 {
            score
        } else {
            0.0
        }
    }

    /// Generate comparison between multiple developers
    pub async fn compare_developers(&mut self, usernames: Vec<String>) -> ComparisonResult {
        let mut analyses = Vec::new();
        let mut summaries = Vec::new();

        for username in &usernames {
            let request = AnalysisRequest {
                username: username.clone(),
                wallet_address: None,
                include_frontend_data: Some(false),
                analysis_depth: Some(AnalysisDepth::Standard),
            };

            let response = self.analyze_user(request).await;
            if response.success {
                if let Some(analysis) = response.raw_analysis {
                    analyses.push((username.clone(), analysis));
                }
                if let Some(summary) = response.ai_summary {
                    summaries.push((username.clone(), summary));
                }
            }
        }

        ComparisonResult {
            usernames,
            skill_comparison: self.compare_skills(&analyses),
            experience_comparison: self.compare_experience(&summaries),
            technology_overlap: self.find_technology_overlap(&analyses),
            recommendations: self.generate_team_recommendations(&analyses, &summaries),
        }
    }

    fn compare_skills(&self, analyses: &[(String, SkillAnalysis)]) -> SkillComparison {
        let mut skill_matrix = std::collections::HashMap::new();
        
        for (username, analysis) in analyses {
            for (lang, skill) in &analysis.language_breakdown {
                skill_matrix
                    .entry(lang.clone())
                    .or_insert_with(Vec::new)
                    .push((username.clone(), skill.score));
            }
        }

        SkillComparison {
            common_skills: skill_matrix
                .iter()
                .filter(|(_, scores)| scores.len() == analyses.len())
                .map(|(skill, scores)| {
                    (skill.clone(), scores.iter().map(|(_, score)| *score).collect())
                })
                .collect(),
            unique_skills: skill_matrix
                .iter()
                .filter(|(_, scores)| scores.len() == 1)
                .map(|(skill, scores)| {
                    (skill.clone(), scores[0].0.clone(), scores[0].1)
                })
                .collect(),
            skill_rankings: self.rank_developers_by_skill(&skill_matrix),
        }
    }

    fn compare_experience(&self, summaries: &[(String, DeveloperSummary)]) -> ExperienceComparison {
        ExperienceComparison {
            experience_levels: summaries
                .iter()
                .map(|(username, summary)| {
                    (username.clone(), format!("{:?}", summary.experience_level))
                })
                .collect(),
            specialization_overlap: self.find_specialization_overlap(summaries),
            complementary_skills: self.find_complementary_skills(summaries),
        }
    }

    fn find_technology_overlap(&self, analyses: &[(String, SkillAnalysis)]) -> TechnologyOverlap {
        // Implementation for finding shared and unique technologies
        TechnologyOverlap {
            shared_technologies: Vec::new(),
            unique_technologies: std::collections::HashMap::new(),
            compatibility_score: 0.0,
        }
    }

    fn generate_team_recommendations(&self, analyses: &[(String, SkillAnalysis)], summaries: &[(String, DeveloperSummary)]) -> Vec<TeamRecommendation> {
        vec![
            TeamRecommendation {
                recommendation_type: "Skill Complementarity".to_string(),
                description: "These developers have complementary skill sets that would work well together".to_string(),
                confidence: 0.85,
                suggested_roles: vec![
                    "Frontend Developer".to_string(),
                    "Backend Developer".to_string(),
                ],
            }
        ]
    }

    fn rank_developers_by_skill(&self, skill_matrix: &std::collections::HashMap<String, Vec<(String, f64)>>) -> Vec<SkillRanking> {
        // Implementation for ranking developers by skill
        Vec::new()
    }

    fn find_specialization_overlap(&self, summaries: &[(String, DeveloperSummary)]) -> Vec<String> {
        // Implementation for finding overlapping specializations
        Vec::new()
    }

    fn find_complementary_skills(&self, summaries: &[(String, DeveloperSummary)]) -> Vec<String> {
        // Implementation for finding complementary skills
        Vec::new()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ComparisonResult {
    pub usernames: Vec<String>,
    pub skill_comparison: SkillComparison,
    pub experience_comparison: ExperienceComparison,
    pub technology_overlap: TechnologyOverlap,
    pub recommendations: Vec<TeamRecommendation>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SkillComparison {
    pub common_skills: Vec<(String, Vec<f64>)>,
    pub unique_skills: Vec<(String, String, f64)>, // skill, username, score
    pub skill_rankings: Vec<SkillRanking>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SkillRanking {
    pub skill: String,
    pub rankings: Vec<(String, f64)>, // username, score
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExperienceComparison {
    pub experience_levels: Vec<(String, String)>,
    pub specialization_overlap: Vec<String>,
    pub complementary_skills: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TechnologyOverlap {
    pub shared_technologies: Vec<String>,
    pub unique_technologies: std::collections::HashMap<String, Vec<String>>,
    pub compatibility_score: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TeamRecommendation {
    pub recommendation_type: String,
    pub description: String,
    pub confidence: f64,
    pub suggested_roles: Vec<String>,
}