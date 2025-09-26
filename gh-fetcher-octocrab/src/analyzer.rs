use chrono::{DateTime, Utc};
use octocrab::{models::Repository, Octocrab, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProfile {
    pub github_username: String,
    pub wallet_address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LanguageSkill {
    pub language: String,
    pub score: f64,
    pub lines_of_code: u64,
    pub commit_count: u32,
    pub project_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TechnologySkill {
    pub technology: String,
    pub usage_count: u32,
    pub project_count: u32,
    pub proficiency_score: f64,
    pub recent_usage: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Specialization {
    pub area: String,
    pub confidence_score: f64,
    pub supporting_projects: Vec<String>,
    pub key_technologies: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillAnalysis {
    pub github_username: String,
    pub wallet_address: Option<String>,
    pub overall_score: f64,
    pub consistency_score: f64,
    pub complexity_score: f64,
    pub collaboration_score: f64,
    pub web3_expertise: f64,
    pub commit_quality_score: f64,
    pub language_breakdown: HashMap<String, LanguageSkill>,
    pub repository_analysis: Vec<RepositoryAnalysis>,
    pub specializations: Vec<Specialization>,
    pub years_active: f64,
    pub total_repositories: u32,
    pub analyzed_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RepositoryAnalysis {
    pub name: String,
    pub description: Option<String>,
    pub primary_language: Option<String>,
    pub languages: HashMap<String, u64>,
    pub stars: u32,
    pub forks: u32,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub architecture_score: f64,
    pub documentation_score: f64,
    pub testing_coverage: f64,
    pub is_web3_project: bool,
}

pub struct GitHubAnalyzer {
    client: Octocrab,
    cache: HashMap<String, SkillAnalysis>,
    language_weights: HashMap<String, f64>,
}

impl GitHubAnalyzer {
    pub fn new(token: String) -> Result<Self> {
        let client = Octocrab::builder()
            .personal_token(token)
            .build()?;

        // TrustHire Web3-focused language weights as specified in README
        let language_weights = [
            ("Solidity".to_string(), 2.5), ("Rust".to_string(), 2.2), ("Move".to_string(), 2.0), ("Cairo".to_string(), 2.0),
            ("Vyper".to_string(), 1.8), ("Go".to_string(), 1.8), ("TypeScript".to_string(), 1.7), ("JavaScript".to_string(), 1.6),
            ("Python".to_string(), 1.4), ("Java".to_string(), 1.2), ("C++".to_string(), 1.1), ("C".to_string(), 1.0),
            ("C#".to_string(), 1.0), ("PHP".to_string(), 1.0), ("Ruby".to_string(), 1.0), ("Swift".to_string(), 1.0),
            ("Kotlin".to_string(), 1.0), ("Dart".to_string(), 1.0), ("Scala".to_string(), 1.0), ("R".to_string(), 1.0),
            ("MATLAB".to_string(), 1.0), ("Shell".to_string(), 1.0), ("HTML".to_string(), 1.0), ("CSS".to_string(), 1.0),
        ].into_iter().collect();

        Ok(Self {
            client,
            cache: HashMap::new(),
            language_weights,
        })
    }

    pub async fn analyze(&mut self, profile: UserProfile) -> Result<SkillAnalysis> {
        let username = &profile.github_username;
        
        if let Some(cached) = self.cache.get(username) {
            if (Utc::now() - cached.analyzed_at).num_hours() < 24 {
                return Ok(cached.clone());
            }
        }

        println!("🔍 Fetching comprehensive GitHub data for user: {}", username);

        // Fetch ALL repositories (public)
        let repositories = self.fetch_all_repositories(username).await?;
        println!("📊 Found {} repositories to analyze", repositories.len());

        if repositories.is_empty() {
            println!("⚠️  No repositories found for user: {}", username);
            return Ok(self.create_empty_analysis(&profile));
        }

        // Analyze repositories
        let repo_analyses = self.analyze_repositories(username, &repositories).await;

        if repo_analyses.is_empty() {
            println!("⚠️  Failed to analyze any repositories for user: {}", username);
            return Ok(self.create_empty_analysis(&profile));
        }

        // Calculate comprehensive language skills
        let language_breakdown = self.calculate_language_skills(&repo_analyses);
        
        // Determine specializations (simplified for now)
        let specializations = self.determine_specializations_simple(&repo_analyses);
        
        // Calculate TrustHire-specific scores
        let overall_score = self.calculate_overall_score(&language_breakdown, &repo_analyses);
        let years_active = self.calculate_years_active(&repo_analyses);
        let consistency_score = self.calculate_consistency_score(&repo_analyses);
        let complexity_score = self.calculate_complexity_score(&language_breakdown);
        let collaboration_score = self.calculate_collaboration_score(&repo_analyses);
        let web3_expertise = self.calculate_web3_expertise(&language_breakdown, &repo_analyses);
        let commit_quality_score = self.calculate_commit_quality_score(&repo_analyses);

        let analysis = SkillAnalysis {
            github_username: profile.github_username.clone(),
            wallet_address: profile.wallet_address.clone(),
            overall_score,
            consistency_score,
            complexity_score,
            collaboration_score,
            web3_expertise,
            commit_quality_score,
            language_breakdown,
            repository_analysis: repo_analyses.clone(),
            specializations,
            years_active,
            total_repositories: repo_analyses.len() as u32,
            analyzed_at: Utc::now(),
        };

        // Cache the result
        self.cache.insert(username.to_string(), analysis.clone());
        
        println!("✅ Analysis complete!");
        Ok(analysis)
    }

    fn create_empty_analysis(&self, profile: &UserProfile) -> SkillAnalysis {
        SkillAnalysis {
            github_username: profile.github_username.clone(),
            wallet_address: profile.wallet_address.clone(),
            overall_score: 0.0,
            consistency_score: 0.0,
            complexity_score: 0.0,
            collaboration_score: 0.0,
            web3_expertise: 0.0,
            commit_quality_score: 0.0,
            language_breakdown: HashMap::new(),
            repository_analysis: Vec::new(),
            specializations: Vec::new(),
            years_active: 0.0,
            total_repositories: 0,
            analyzed_at: Utc::now(),
        }
    }

    async fn fetch_all_repositories(&self, username: &str) -> Result<Vec<Repository>> {
        let mut all_repos = Vec::new();
        let mut page = 1u32;
        let per_page = 100u8;

        loop {
            let repos_result = self.client
                .users(username)
                .repos()
                .per_page(per_page)
                .page(page)
                .send()
                .await;

            let repos = match repos_result {
                Ok(repos) => repos,
                Err(e) => {
                    eprintln!("Failed to fetch repositories for {}: {}", username, e);
                    break;
                }
            };

            if repos.items.is_empty() {
                break;
            }

            let items_len = repos.items.len();
            all_repos.extend(repos.items);
            
            if items_len < per_page as usize {
                break; // Last page
            }
            
            page += 1;
            sleep(Duration::from_millis(200)).await; // Rate limiting
        }

        // Filter out forks unless they have significant activity
        let filtered_repos: Vec<Repository> = all_repos.into_iter()
            .filter(|repo| {
                !repo.fork.unwrap_or(false) || repo.stargazers_count.unwrap_or(0) > 5 || 
                repo.forks_count.unwrap_or(0) > 2
            })
            .collect();

        Ok(filtered_repos)
    }

    async fn analyze_repositories(&self, _username: &str, repos: &[Repository]) -> Vec<RepositoryAnalysis> {
        let mut analyses = Vec::new();

        for (index, repo) in repos.iter().enumerate() {
            println!("🔬 Analyzing repository {}/{}: {}", index + 1, repos.len(), repo.name);
            
            let analysis = self.analyze_repository_simple(repo).await;
            analyses.push(analysis);
            
            // Rate limiting
            sleep(Duration::from_millis(100)).await;
        }

        analyses
    }

    async fn analyze_repository_simple(&self, repo: &Repository) -> RepositoryAnalysis {
        // Extract basic repository information
        let primary_language = repo.language.as_ref()
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        // Create simple language map from primary language
        let mut languages = HashMap::new();
        if let Some(ref lang) = primary_language {
            languages.insert(lang.clone(), 1000u64); // Default size
        }

        // Detect if this is a Web3 project
        let is_web3_project = self.is_web3_project(&repo.name, &repo.description, &primary_language);

        RepositoryAnalysis {
            name: repo.name.clone(),
            description: repo.description.clone(),
            primary_language,
            languages,
            stars: repo.stargazers_count.unwrap_or(0),
            forks: repo.forks_count.unwrap_or(0),
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            architecture_score: self.calculate_architecture_score_simple(repo),
            documentation_score: self.calculate_documentation_score_simple(repo),
            testing_coverage: self.calculate_testing_coverage_simple(repo),
            is_web3_project,
        }
    }

    fn detect_technologies_simple(&self, repo_name: &str, description: &Option<String>) -> Vec<String> {
        let mut technologies = Vec::new();
        let search_text = format!("{} {}", 
            repo_name.to_lowercase(), 
            description.as_deref().unwrap_or("").to_lowercase()
        );

        // Technology detection keywords
        let tech_keywords = [
            ("react", "React"), ("vue", "Vue"), ("angular", "Angular"),
            ("node", "Node.js"), ("express", "Express"), ("django", "Django"),
            ("flask", "Flask"), ("spring", "Spring"), ("docker", "Docker"),
            ("kubernetes", "Kubernetes"), ("aws", "AWS"), ("azure", "Azure"),
            ("tensorflow", "TensorFlow"), ("pytorch", "PyTorch"),
            ("blockchain", "Blockchain"), ("ethereum", "Ethereum"),
            ("api", "API"), ("rest", "REST"), ("graphql", "GraphQL"),
            ("microservice", "Microservices"), ("mobile", "Mobile"),
            ("web", "Web Development"), ("game", "Game Development"),
            ("ai", "Artificial Intelligence"), ("ml", "Machine Learning"),
        ];

        for (keyword, tech_name) in tech_keywords {
            if search_text.contains(keyword) {
                technologies.push(tech_name.to_string());
            }
        }

        technologies
    }

    fn calculate_language_skills(&self, repo_analyses: &[RepositoryAnalysis]) -> HashMap<String, LanguageSkill> {
        let mut language_stats: HashMap<String, (u64, u32)> = HashMap::new();

        for repo in repo_analyses {
            for (language, bytes) in &repo.languages {
                let entry = language_stats.entry(language.clone()).or_insert((0, 0));
                entry.0 += bytes;
                entry.1 += 1; // Project count
            }
        }

        language_stats.into_iter().map(|(language, (bytes, project_count))| {
            let weight_multiplier = self.language_weights.get(&language).copied().unwrap_or(1.0);
            let score = ((bytes as f64).ln_1p() / 10.0 + project_count as f64 * 15.0) * weight_multiplier;

            (language.clone(), LanguageSkill {
                language: language.clone(),
                score: score.min(100.0),
                lines_of_code: bytes / 50,
                commit_count: 0, // Simplified
                project_count,
            })
        }).collect()
    }

    fn identify_technologies(&self, repo_analyses: &[RepositoryAnalysis]) -> HashMap<String, TechnologySkill> {
        // Simplified - we'll detect based on languages and names
        HashMap::new()
    }

    fn determine_specializations(&self, repo_analyses: &[RepositoryAnalysis], tech_breakdown: &HashMap<String, TechnologySkill>) -> Vec<Specialization> {
        let mut specializations = Vec::new();

        // Web Development
        let web_techs = ["React", "Vue", "Angular", "Node.js", "Express", "Web Development"];
        let web_score = self.calculate_specialization_score(tech_breakdown, &web_techs, repo_analyses);
        if web_score > 30.0 {
            specializations.push(Specialization {
                area: "Web Development".to_string(),
                confidence_score: web_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &web_techs),
                key_technologies: web_techs.iter()
                    .filter(|t| tech_breakdown.contains_key(**t))
                    .map(|s| s.to_string())
                    .collect(),
            });
        }

        // Machine Learning
        let ml_techs = ["TensorFlow", "PyTorch", "Machine Learning", "Artificial Intelligence"];
        let ml_score = self.calculate_specialization_score(tech_breakdown, &ml_techs, repo_analyses);
        if ml_score > 30.0 {
            specializations.push(Specialization {
                area: "Machine Learning".to_string(),
                confidence_score: ml_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &ml_techs),
                key_technologies: ml_techs.iter()
                    .filter(|t| tech_breakdown.contains_key(**t))
                    .map(|s| s.to_string())
                    .collect(),
            });
        }

        // Blockchain
        let blockchain_techs = ["Blockchain", "Ethereum"];
        let blockchain_score = self.calculate_specialization_score(tech_breakdown, &blockchain_techs, repo_analyses);
        if blockchain_score > 30.0 {
            specializations.push(Specialization {
                area: "Blockchain".to_string(),
                confidence_score: blockchain_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &blockchain_techs),
                key_technologies: blockchain_techs.iter()
                    .filter(|t| tech_breakdown.contains_key(**t))
                    .map(|s| s.to_string())
                    .collect(),
            });
        }

        specializations.sort_by(|a, b| b.confidence_score.partial_cmp(&a.confidence_score).unwrap());
        specializations
    }

    fn calculate_specialization_score(&self, tech_breakdown: &HashMap<String, TechnologySkill>, specialization_techs: &[&str], _repo_analyses: &[RepositoryAnalysis]) -> f64 {
        let mut total_score = 0.0;
        let mut tech_count = 0;

        for tech in specialization_techs {
            if let Some(tech_skill) = tech_breakdown.get(*tech) {
                total_score += tech_skill.proficiency_score;
                tech_count += 1;
            }
        }

        if tech_count > 0 {
            total_score / tech_count as f64
        } else {
            0.0
        }
    }

    fn get_supporting_projects(&self, repo_analyses: &[RepositoryAnalysis], specialization_techs: &[&str]) -> Vec<String> {
        repo_analyses.iter()
            .filter(|repo| {
                let repo_text = format!("{} {}", 
                    repo.name.to_lowercase(), 
                    repo.description.as_deref().unwrap_or("").to_lowercase()
                );
                specialization_techs.iter().any(|tech| repo_text.contains(tech))
            })
            .map(|repo| repo.name.clone())
            .take(5)
            .collect()
    }

    fn calculate_overall_score(&self, language_breakdown: &HashMap<String, LanguageSkill>, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if language_breakdown.is_empty() {
            return 0.0;
        }

        let language_score: f64 =         language_breakdown.values()
            .map(|skill| skill.score)
            .sum::<f64>() / language_breakdown.len() as f64;

        let project_score = repo_analyses.len() as f64 * 5.0;
        let stars_score = repo_analyses.iter()
            .map(|repo| repo.stars as f64)
            .sum::<f64>()
            .ln_1p() * 2.0;

        (language_score * 0.6 + project_score.min(40.0) * 0.3 + stars_score.min(20.0) * 0.1).min(100.0)
    }

    fn calculate_years_active(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        let oldest_repo = repo_analyses.iter()
            .filter_map(|repo| repo.created_at)
            .min();

        if let Some(oldest_date) = oldest_repo {
            (Utc::now() - oldest_date).num_days() as f64 / 365.25
        } else {
            0.0
        }
    }

    fn calculate_code_quality_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        // Simplified quality score based on repository metrics
        if repo_analyses.is_empty() {
            return 0.0;
        }

        let avg_stars = repo_analyses.iter().map(|r| r.stars as f64).sum::<f64>() / repo_analyses.len() as f64;
        let has_descriptions = repo_analyses.iter().filter(|r| r.description.is_some()).count() as f64 / repo_analyses.len() as f64;
        
        ((avg_stars.ln_1p() * 10.0).min(50.0) + has_descriptions * 50.0).min(100.0)
    }

    fn calculate_project_quality_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        self.calculate_code_quality_score(repo_analyses)
    }

    fn calculate_innovation_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        let unique_techs = repo_analyses.len() as f64; // Simplified - use number of different repos

        let recent_activity = repo_analyses.iter()
            .filter(|r| {
                r.updated_at.map_or(false, |updated| 
                    (Utc::now() - updated).num_days() < 180
                )
            })
            .count() as f64 / repo_analyses.len() as f64;

        (unique_techs * 5.0 + recent_activity * 50.0).min(100.0)
    }

    // TrustHire-specific scoring methods
    fn calculate_consistency_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() { return 0.0; }
        
        // Simple consistency based on regular commits and updated repositories
        let active_repos = repo_analyses.iter()
            .filter(|r| r.updated_at.map_or(false, |u| (Utc::now() - u).num_days() < 365))
            .count() as f64;
            
        let total_repos = repo_analyses.len() as f64;
        (active_repos / total_repos * 100.0).min(100.0)
    }

    fn calculate_complexity_score(&self, language_breakdown: &HashMap<String, LanguageSkill>) -> f64 {
        if language_breakdown.is_empty() { return 0.0; }
        
        // Higher score for more complex languages with higher multipliers
        let weighted_score: f64 = language_breakdown.values()
            .map(|skill| {
                let multiplier = self.language_weights.get(&skill.language).copied().unwrap_or(1.0);
                skill.score * multiplier
            })
            .sum::<f64>() / language_breakdown.len() as f64;
            
        weighted_score.min(100.0)
    }

    fn calculate_collaboration_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() { return 0.0; }
        
        // Score based on stars and forks (community engagement)
        let total_stars: u32 = repo_analyses.iter().map(|r| r.stars).sum();
        let total_forks: u32 = repo_analyses.iter().map(|r| r.forks).sum();
        
        let star_score = (total_stars as f64).ln_1p() * 10.0;
        let fork_score = (total_forks as f64).ln_1p() * 15.0;
        
        (star_score + fork_score).min(100.0)
    }

    fn calculate_web3_expertise(&self, language_breakdown: &HashMap<String, LanguageSkill>, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        // Count Web3-related languages and projects
        let web3_languages = ["Solidity", "Rust", "Move", "Cairo", "Vyper"];
        let web3_lang_score: f64 = language_breakdown.iter()
            .filter(|(lang, _)| web3_languages.contains(&lang.as_str()))
            .map(|(_, skill)| skill.score)
            .sum();
            
        let web3_projects = repo_analyses.iter()
            .filter(|r| r.is_web3_project)
            .count() as f64;
            
        let project_bonus = web3_projects * 20.0;
        
        (web3_lang_score + project_bonus).min(100.0)
    }

    fn calculate_commit_quality_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() { return 0.0; }
        
        // Simple scoring based on repository descriptions and structure
        let documented_repos = repo_analyses.iter()
            .filter(|r| r.description.is_some() && !r.description.as_ref().unwrap().is_empty())
            .count() as f64;
            
        (documented_repos / repo_analyses.len() as f64 * 100.0).min(100.0)
    }

    fn determine_specializations_simple(&self, repo_analyses: &[RepositoryAnalysis]) -> Vec<Specialization> {
        let mut specializations = Vec::new();
        
        // Web3/Blockchain specialization
        let web3_repos = repo_analyses.iter().filter(|r| r.is_web3_project).count();
        if web3_repos > 0 {
            specializations.push(Specialization {
                area: "Blockchain/Web3 Development".to_string(),
                confidence_score: (web3_repos as f64 / repo_analyses.len() as f64 * 100.0).min(100.0),
                supporting_projects: repo_analyses.iter()
                    .filter(|r| r.is_web3_project)
                    .map(|r| r.name.clone())
                    .take(5)
                    .collect(),
                key_technologies: vec!["Blockchain".to_string(), "Smart Contracts".to_string()],
            });
        }
        
        specializations
    }

    fn is_web3_project(&self, name: &str, description: &Option<String>, language: &Option<String>) -> bool {
        let web3_keywords = ["blockchain", "crypto", "defi", "nft", "web3", "ethereum", "solidity", 
                           "smart contract", "dao", "dapp", "token", "wallet", "mining"];
        
        let search_text = format!("{} {}", 
            name.to_lowercase(), 
            description.as_deref().unwrap_or("").to_lowercase()
        );
        
        // Check if uses Web3 language
        if let Some(lang) = language {
            if ["Solidity", "Move", "Cairo", "Vyper"].contains(&lang.as_str()) {
                return true;
            }
        }
        
        // Check for Web3 keywords
        web3_keywords.iter().any(|keyword| search_text.contains(keyword))
    }

    fn calculate_architecture_score_simple(&self, repo: &Repository) -> f64 {
        // Simple scoring based on stars and repo age
        let stars_score = (repo.stargazers_count.unwrap_or(0) as f64).ln_1p() * 10.0;
        let age_bonus = if let Some(created) = repo.created_at {
            let days_old = (Utc::now() - created).num_days();
            if days_old > 365 { 20.0 } else { days_old as f64 / 365.0 * 20.0 }
        } else { 0.0 };
        
        (stars_score + age_bonus).min(100.0)
    }

    fn calculate_documentation_score_simple(&self, repo: &Repository) -> f64 {
        let mut score: f64 = 0.0;
        
        // Has description
        if repo.description.is_some() && !repo.description.as_ref().unwrap().is_empty() {
            score += 50.0;
        }
        
        // Assume README exists if repo has description (simplified)
        if repo.description.is_some() {
            score += 30.0;
        }
        
        // Homepage/website
        if repo.homepage.is_some() {
            score += 20.0;
        }
        
        score.min(100.0)
    }

    fn calculate_testing_coverage_simple(&self, repo: &Repository) -> f64 {
        // Simple estimation based on language and activity
        let base_score: f64 = match repo.language.as_ref().and_then(|v| v.as_str()) {
            Some("TypeScript") | Some("JavaScript") | Some("Python") | Some("Rust") => 60.0,
            Some("Java") | Some("C#") | Some("Go") => 70.0,
            Some("Solidity") => 40.0,
            _ => 30.0,
        };
        
        // Bonus for active repositories
        let activity_bonus: f64 = if let Some(updated) = repo.updated_at {
            if (Utc::now() - updated).num_days() < 90 { 15.0 } else { 0.0 }
        } else { 0.0 };
        
        (base_score + activity_bonus).min(100.0)
    }
}

// Public API function as shown in README
pub async fn analyze_profile(profile: UserProfile, github_token: String) -> Result<SkillAnalysis> {
    let mut analyzer = GitHubAnalyzer::new(github_token)?;
    analyzer.analyze(profile).await
}