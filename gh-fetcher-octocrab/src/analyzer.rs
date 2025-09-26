use chrono::{DateTime, Utc};
use octocrab::{models::Repository, Octocrab, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LanguageSkill {
    pub language: String,
    pub proficiency_score: f64,
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
    pub username: String,
    pub overall_score: f64,
    pub language_breakdown: HashMap<String, LanguageSkill>,
    pub technology_breakdown: HashMap<String, TechnologySkill>,
    pub specializations: Vec<Specialization>,
    pub years_active: f64,
    pub total_repositories: u32,
    pub code_quality_score: f64,
    pub project_quality_score: f64,
    pub innovation_score: f64,
    pub analysis_timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RepositoryAnalysis {
    pub name: String,
    pub description: Option<String>,
    pub primary_language: Option<String>,
    pub languages: HashMap<String, u64>,
    pub technologies: Vec<String>,
    pub stars: u32,
    pub forks: u32,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
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

        // Platform-agnostic language weights (all equal)
        let language_weights = [
            ("JavaScript".to_string(), 1.0), ("TypeScript".to_string(), 1.0), ("Python".to_string(), 1.0), ("Java".to_string(), 1.0),
            ("C++".to_string(), 1.0), ("C".to_string(), 1.0), ("C#".to_string(), 1.0), ("Go".to_string(), 1.0), ("Rust".to_string(), 1.0), ("PHP".to_string(), 1.0),
            ("Ruby".to_string(), 1.0), ("Swift".to_string(), 1.0), ("Kotlin".to_string(), 1.0), ("Dart".to_string(), 1.0), ("Scala".to_string(), 1.0),
            ("R".to_string(), 1.0), ("MATLAB".to_string(), 1.0), ("Shell".to_string(), 1.0), ("HTML".to_string(), 1.0), ("CSS".to_string(), 1.0),
        ].into_iter().collect();

        Ok(Self {
            client,
            cache: HashMap::new(),
            language_weights,
        })
    }

    pub async fn analyze(&mut self, username: &str) -> Result<SkillAnalysis> {
        if let Some(cached) = self.cache.get(username) {
            if (Utc::now() - cached.analysis_timestamp).num_hours() < 24 {
                return Ok(cached.clone());
            }
        }

        println!("🔍 Fetching comprehensive GitHub data for user: {}", username);

        // Fetch ALL repositories (public)
        let repositories = self.fetch_all_repositories(username).await?;
        println!("📊 Found {} repositories to analyze", repositories.len());

        if repositories.is_empty() {
            println!("⚠️  No repositories found for user: {}", username);
            return Ok(self.create_empty_analysis(username));
        }

        // Analyze repositories
        let repo_analyses = self.analyze_repositories(username, &repositories).await;

        if repo_analyses.is_empty() {
            println!("⚠️  Failed to analyze any repositories for user: {}", username);
            return Ok(self.create_empty_analysis(username));
        }

        // Calculate comprehensive language skills
        let language_breakdown = self.calculate_language_skills(&repo_analyses);
        
        // Identify technologies used
        let technology_breakdown = self.identify_technologies(&repo_analyses);
        
        // Determine specializations
        let specializations = self.determine_specializations(&repo_analyses, &technology_breakdown);
        
        // Calculate comprehensive scores
        let overall_score = self.calculate_overall_score(&language_breakdown, &repo_analyses);
        let years_active = self.calculate_years_active(&repo_analyses);
        let code_quality_score = self.calculate_code_quality_score(&repo_analyses);
        let project_quality_score = self.calculate_project_quality_score(&repo_analyses);
        let innovation_score = self.calculate_innovation_score(&repo_analyses);

        let analysis = SkillAnalysis {
            username: username.to_string(),
            overall_score,
            language_breakdown,
            technology_breakdown,
            specializations,
            years_active,
            total_repositories: repo_analyses.len() as u32,
            code_quality_score,
            project_quality_score,
            innovation_score,
            analysis_timestamp: Utc::now(),
        };

        // Cache the result
        self.cache.insert(username.to_string(), analysis.clone());
        
        println!("✅ Analysis complete!");
        Ok(analysis)
    }

    fn create_empty_analysis(&self, username: &str) -> SkillAnalysis {
        SkillAnalysis {
            username: username.to_string(),
            overall_score: 0.0,
            language_breakdown: HashMap::new(),
            technology_breakdown: HashMap::new(),
            specializations: Vec::new(),
            years_active: 0.0,
            total_repositories: 0,
            code_quality_score: 0.0,
            project_quality_score: 0.0,
            innovation_score: 0.0,
            analysis_timestamp: Utc::now(),
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

        // Detect technologies from repository name and description
        let technologies = self.detect_technologies_simple(&repo.name, &repo.description);

        RepositoryAnalysis {
            name: repo.name.clone(),
            description: repo.description.clone(),
            primary_language,
            languages,
            technologies,
            stars: repo.stargazers_count.unwrap_or(0),
            forks: repo.forks_count.unwrap_or(0),
            created_at: repo.created_at,
            updated_at: repo.updated_at,
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
            let proficiency_score = ((bytes as f64).ln_1p() / 10.0 + project_count as f64 * 15.0) * weight_multiplier;

            (language.clone(), LanguageSkill {
                language: language.clone(),
                proficiency_score: proficiency_score.min(100.0),
                lines_of_code: bytes / 50,
                commit_count: 0, // Simplified
                project_count,
            })
        }).collect()
    }

    fn identify_technologies(&self, repo_analyses: &[RepositoryAnalysis]) -> HashMap<String, TechnologySkill> {
        let mut tech_stats: HashMap<String, u32> = HashMap::new();

        for repo in repo_analyses {
            for technology in &repo.technologies {
                *tech_stats.entry(technology.clone()).or_insert(0) += 1;
            }
        }

        tech_stats.into_iter().map(|(tech, usage_count)| {
            let proficiency_score = (usage_count as f64 * 20.0).min(100.0);
            
            (tech.clone(), TechnologySkill {
                technology: tech,
                usage_count,
                project_count: usage_count,
                proficiency_score,
                recent_usage: true,
            })
        }).collect()
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
                repo.technologies.iter().any(|t| specialization_techs.contains(&t.as_str()))
            })
            .map(|repo| repo.name.clone())
            .take(5)
            .collect()
    }

    fn calculate_overall_score(&self, language_breakdown: &HashMap<String, LanguageSkill>, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if language_breakdown.is_empty() {
            return 0.0;
        }

        let language_score: f64 = language_breakdown.values()
            .map(|skill| skill.proficiency_score)
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

        let unique_techs = repo_analyses.iter()
            .flat_map(|r| &r.technologies)
            .collect::<std::collections::HashSet<_>>()
            .len() as f64;

        let recent_activity = repo_analyses.iter()
            .filter(|r| {
                r.updated_at.map_or(false, |updated| 
                    (Utc::now() - updated).num_days() < 180
                )
            })
            .count() as f64 / repo_analyses.len() as f64;

        (unique_techs * 5.0 + recent_activity * 50.0).min(100.0)
    }
}