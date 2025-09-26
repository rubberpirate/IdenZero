use chrono::{DateTime, Utc};
use octocrab::{models::{Repository, pulls::PullRequest, issues::Issue}, Octocrab, Result};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use tokio::time::{sleep, Duration};

// Additional struct definitions for comprehensive analysis
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LanguageSkill {
    pub language: String,
    pub proficiency_score: f64,
    pub lines_of_code: u64,
    pub commit_count: u32,
    pub project_count: u32,
    pub complexity_metrics: ComplexityMetrics,
    pub weight_multiplier: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ComplexityMetrics {
    pub cyclomatic_complexity: f64,
    pub cognitive_complexity: f64,
    pub maintainability_index: f64,
    pub technical_debt_ratio: f64,
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
pub struct CommitAnalysis {
    pub total_commits: u32,
    pub commits_last_year: u32,
    pub avg_commits_per_month: f64,
    pub commit_frequency_score: f64,
    pub recent_activity: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CodeQualityMetrics {
    pub commit_message_quality: f64,
    pub code_consistency: f64,
    pub bug_fix_ratio: f64,
    pub refactoring_frequency: f64,
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
    pub commit_analysis: CommitAnalysis,
    pub code_quality_metrics: CodeQualityMetrics,
    pub project_structure_score: f64,
    pub documentation_score: f64,
    pub testing_score: f64,
    pub activity_score: f64,
    pub innovation_score: f64,
}

#[derive(Debug, Clone)]
pub struct CommitData {
    pub message: String,
    pub author: String,
    pub date: DateTime<Utc>,
    pub additions: u32,
    pub deletions: u32,
    pub files_changed: Vec<String>,
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

        // Fetch ALL repositories (public and accessible private ones)
        let repositories = self.fetch_all_repositories(username).await?;
        println!("📊 Found {} repositories to analyze", repositories.len());

        if repositories.is_empty() {
            eprintln!("⚠️  No repositories found for user: {}", username);
            // Return a default analysis instead of error
            return Ok(SkillAnalysis {
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
            });
        }

        // Perform comprehensive analysis on each repository
        let mut repo_analyses = Vec::new();
        for (index, repo) in repositories.iter().enumerate() {
            println!("🔬 Analyzing repository {}/{}: {}", 
                index + 1, repositories.len(), repo.name);
            
            match self.analyze_repository_comprehensive(username, repo).await {
                Ok(analysis) => repo_analyses.push(analysis),
                Err(e) => {
                    eprintln!("⚠️  Failed to analyze repository {}: {}", repo.name, e);
                    continue;
                }
            }
            
            // Rate limiting: small delay between repository analyses
            sleep(Duration::from_millis(100)).await;
        }

        if repo_analyses.is_empty() {
            eprintln!("⚠️  Failed to analyze any repositories for user: {}", username);
            // Return a minimal analysis instead of error
            return Ok(SkillAnalysis {
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
            });
        }

        // Calculate comprehensive language skills
        let language_breakdown = self.calculate_language_skills_comprehensive(&repo_analyses);
        
        // Identify technologies used
        let technology_breakdown = self.identify_technologies(&repo_analyses);
        
        // Determine specializations
        let specializations = self.determine_specializations(&repo_analyses, &technology_breakdown);
        
        // Calculate comprehensive scores
        let overall_score = self.calculate_overall_score_comprehensive(&language_breakdown, &repo_analyses);
        let years_active = self.calculate_years_active(&repo_analyses);
        let code_quality_score = self.calculate_code_quality_score(&repo_analyses);
        let project_quality_score = self.calculate_project_quality_score(&repo_analyses);
        let innovation_score = self.calculate_innovation_score_comprehensive(&repo_analyses);

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

    async fn fetch_all_repositories(&self, username: &str) -> Result<Vec<Repository>> {
        let mut all_repos = Vec::new();
        let mut page = 1u32;
        let per_page = 100u8;

        loop {
            let repos = self.client
                .users(username)
                .repos()
                .repo_type(octocrab::params::repos::Type::All) // Include all repository types
                .sort(octocrab::params::repos::Sort::Updated)
                .per_page(per_page)
                .page(page)
                .send()
                .await?;

            if repos.items.is_empty() {
                break;
            }

            all_repos.extend(repos.items);
            
            if repos.items.len() < per_page as usize {
                break; // Last page
            }
            
            page += 1;
            sleep(Duration::from_millis(200)).await; // Rate limiting
        }

        // Filter out forks unless they have significant activity
        let filtered_repos: Vec<Repository> = all_repos.into_iter()
            .filter(|repo| {
                !repo.fork || repo.stargazers_count.unwrap_or(0) > 5 || 
                repo.forks_count.unwrap_or(0) > 2
            })
            .collect();

        Ok(filtered_repos)
    }

    async fn analyze_repository_comprehensive(&self, username: &str, repo: &Repository) -> Result<RepositoryAnalysis> {
        // Fetch repository languages
        let languages = match self.client
            .repos(username, &repo.name)
            .get()
            .await {
            Ok(repo_details) => {
                // Try to get languages, fallback to empty map
                self.client
                    .repos(username, &repo.name)
                    .get()
                    .await
                    .ok()
                    .and_then(|_| None) // For now, return empty languages
                    .unwrap_or_default()
            },
            Err(_) => HashMap::new(),
        };

        // Fetch commits for analysis
        let commits = self.fetch_repository_commits(username, &repo.name).await?;

        // Fetch repository files for structure analysis
        let files = self.fetch_repository_files(username, &repo.name).await.unwrap_or_default();

        // Perform commit analysis
        let commit_analysis = self.analyze_commits(&commits);

        // Calculate code quality metrics
        let code_quality_metrics = self.calculate_code_quality_metrics(&commits);

        // Calculate various scores
        let project_structure_score = self.calculate_project_structure_score(&files, &languages);
        let documentation_score = self.calculate_documentation_score_comprehensive(&files, repo.description.as_ref());
        let testing_score = self.calculate_testing_score_comprehensive(&files);
        let activity_score = self.calculate_activity_score(&commit_analysis, repo.updated_at);
        let innovation_score = self.calculate_repo_innovation_score(repo, &languages, &files);

        // Detect technologies
        let technologies = self.detect_technologies_from_files(&files, repo.description.as_ref());

        Ok(RepositoryAnalysis {
            name: repo.name.clone(),
            description: repo.description.clone(),
            primary_language: repo.language.clone(),
            languages,
            technologies,
            stars: repo.stargazers_count.unwrap_or(0),
            forks: repo.forks_count.unwrap_or(0),
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            commit_analysis,
            code_quality_metrics,
            project_structure_score,
            documentation_score,
            testing_score,
            activity_score,
            innovation_score,
        })
    }

    async fn fetch_repository_commits(&self, username: &str, repo_name: &str) -> Result<Vec<CommitData>> {
        let mut all_commits = Vec::new();
        let mut page = 1u32;
        let per_page = 100u8;
        let max_commits = 500; // Limit to prevent excessive API calls

        // Only fetch commits from the last year for efficiency
        let since = Utc::now() - chrono::Duration::days(365);

        loop {
            if all_commits.len() >= max_commits {
                break;
            }

            let commits_result = self.client
                .repos(username, repo_name)
                .list_commits()
                .since(since)
                .per_page(per_page)
                .page(page)
                .send()
                .await;

            let commits = match commits_result {
                Ok(commits) => commits,
                Err(e) => {
                    eprintln!("Failed to fetch commits for {}: {}", repo_name, e);
                    break;
                }
            };

            if commits.items.is_empty() {
                break;
            }

            for commit in commits.items {
                if let (Some(author), Some(commit_info)) = (&commit.author, &commit.commit) {
                    all_commits.push(CommitData {
                        message: commit_info.message.clone(),
                        author: author.login.clone(),
                        date: commit_info.author.date,
                        additions: commit.stats.as_ref().map(|s| s.additions).unwrap_or(0),
                        deletions: commit.stats.as_ref().map(|s| s.deletions).unwrap_or(0),
                        files_changed: commit.files.as_ref()
                            .map(|files| files.iter().map(|f| f.filename.clone()).collect())
                            .unwrap_or_default(),
                    });
                }
            }

            if commits.items.len() < per_page as usize {
                break;
            }

            page += 1;
            sleep(Duration::from_millis(100)).await;
        }

        Ok(all_commits)
    }

    async fn fetch_repository_files(&self, username: &str, repo_name: &str) -> Result<Vec<String>> {
        let contents = self.client
            .repos(username, repo_name)
            .get_content()
            .path("")
            .send()
            .await?;

        let mut files = Vec::new();
        if let Some(items) = contents.items {
            for item in items {
                files.push(item.name);
                
                // For directories, fetch some files (limited depth)
                if item.type_ == "dir" && files.len() < 100 {
                    if let Ok(dir_contents) = self.client
                        .repos(username, repo_name)
                        .get_content()
                        .path(&item.name)
                        .send()
                        .await
                    {
                        if let Some(dir_items) = dir_contents.items {
                            for dir_item in dir_items.into_iter().take(20) {
                                files.push(format!("{}/{}", item.name, dir_item.name));
                            }
                        }
                    }
                }
            }
        }

        Ok(files)
    }

    fn analyze_commits(&self, commits: &[CommitData]) -> CommitAnalysis {
        let total_commits = commits.len() as u32;
        let now = Utc::now();
        let one_year_ago = now - chrono::Duration::days(365);

        let commits_last_year = commits.iter()
            .filter(|c| c.date > one_year_ago)
            .count() as u32;

        let avg_commits_per_month = if total_commits > 0 {
            commits_last_year as f64 / 12.0
        } else {
            0.0
        };

        let commit_frequency_score = if avg_commits_per_month > 10.0 {
            100.0
        } else {
            avg_commits_per_month * 10.0
        };

        let recent_activity = commits.iter()
            .any(|c| (now - c.date).num_days() < 30);

        CommitAnalysis {
            total_commits,
            commits_last_year,
            avg_commits_per_month,
            commit_frequency_score,
            recent_activity,
        }
    }

    fn detect_technologies_from_files(&self, files: &[String], description: &Option<String>) -> Vec<String> {
        let mut technologies = HashSet::new();

        // Technology detection based on files
        for file in files {
            let file_lower = file.to_lowercase();
            
            // Web technologies
            if file_lower.contains("package.json") { technologies.insert("nodejs".to_string()); }
            if file_lower.contains("requirements.txt") || file_lower.contains("pipfile") { 
                technologies.insert("python".to_string()); 
            }
            if file_lower.contains("cargo.toml") { technologies.insert("rust".to_string()); }
            if file_lower.contains("go.mod") { technologies.insert("go".to_string()); }
            if file_lower.contains("pom.xml") || file_lower.contains("build.gradle") { 
                technologies.insert("java".to_string()); 
            }
            if file_lower.contains("dockerfile") { technologies.insert("docker".to_string()); }
            if file_lower.contains("docker-compose") { technologies.insert("docker-compose".to_string()); }
            if file_lower.contains("kubernetes") || file_lower.contains("k8s") { 
                technologies.insert("kubernetes".to_string()); 
            }

            // Frameworks and libraries
            if file_lower.contains("react") { technologies.insert("react".to_string()); }
            if file_lower.contains("vue") { technologies.insert("vue".to_string()); }
            if file_lower.contains("angular") { technologies.insert("angular".to_string()); }
            if file_lower.contains("express") { technologies.insert("express".to_string()); }
            if file_lower.contains("django") { technologies.insert("django".to_string()); }
            if file_lower.contains("flask") { technologies.insert("flask".to_string()); }
            if file_lower.contains("spring") { technologies.insert("spring".to_string()); }
        }

        // Technology detection from description
        if let Some(desc) = description {
            let desc_lower = desc.to_lowercase();
            let desc_technologies = [
                ("react", "react"), ("vue", "vue"), ("angular", "angular"),
                ("node", "nodejs"), ("express", "express"), ("django", "django"),
                ("flask", "flask"), ("spring", "spring"), ("docker", "docker"),
                ("kubernetes", "kubernetes"), ("aws", "aws"), ("azure", "azure"),
                ("tensorflow", "tensorflow"), ("pytorch", "pytorch"),
                ("blockchain", "blockchain"), ("ethereum", "ethereum"),
                ("smart contract", "smart contract"), ("defi", "defi"),
                ("machine learning", "machine learning"), ("ai", "ai"),
                ("microservice", "microservice"), ("api", "api"),
                ("graphql", "graphql"), ("rest", "rest"),
            ];

            for (keyword, tech) in desc_technologies {
                if desc_lower.contains(keyword) {
                    technologies.insert(tech.to_string());
                }
            }
        }

        technologies.into_iter().collect()
    }    fn calculate_commit_message_quality_comprehensive(&self, commits: &[CommitData]) -> f64 {
        let mut total_score = 0.0;

        for commit in commits {
            let message = &commit.message;
            let mut score = 0.0;

            // Length check (not too short, not too long)
            let first_line = message.lines().next().unwrap_or("");
            if first_line.len() >= 10 && first_line.len() <= 72 {
                score += 20.0;
            }

            // Conventional commit format
            if Self::is_conventional_commit(first_line) {
                score += 25.0;
            }

            // Multi-line commits for complex changes
            if message.lines().count() > 2 {
                score += 15.0;
            }

            // Descriptive and clear
            if Self::is_descriptive_message(first_line) {
                score += 20.0;
            }

            // No obvious bad patterns
            if !Self::has_bad_commit_patterns(message) {
                score += 20.0;
            }

            total_score += score;
        }

        total_score / commits.len() as f64
    }

    fn categorize_commits_comprehensive(&self, commits: &[CommitData]) -> (u32, u32, u32) {
        let mut feature_commits = 0;
        let mut bug_fix_commits = 0;
        let mut refactor_commits = 0;

        for commit in commits {
            let message_lower = commit.message.to_lowercase();
            
            // More sophisticated categorization
            if message_lower.contains("feat") || message_lower.contains("feature") ||
               message_lower.contains("add") || message_lower.contains("implement") ||
               message_lower.contains("create") || message_lower.contains("new") {
                feature_commits += 1;
            } else if message_lower.contains("fix") || message_lower.contains("bug") ||
                     message_lower.contains("patch") || message_lower.contains("hotfix") ||
                     message_lower.contains("resolve") || message_lower.contains("correct") {
                bug_fix_commits += 1;
            } else if message_lower.contains("refactor") || message_lower.contains("cleanup") ||
                     message_lower.contains("optimize") || message_lower.contains("improve") ||
                     message_lower.contains("restructure") || message_lower.contains("simplify") {
                refactor_commits += 1;
            }
        }

        (feature_commits, bug_fix_commits, refactor_commits)
    }

    fn calculate_commit_consistency_comprehensive(&self, commits: &[CommitData]) -> f64 {
        if commits.len() < 3 {
            return 0.5; // Neutral score for insufficient data
        }

        let mut consistency_scores = Vec::new();

        // Time consistency (regular intervals)
        let intervals: Vec<i64> = commits.windows(2)
            .map(|window| (window[0].date - window[1].date).num_hours())
            .collect();
        
        if intervals.len() > 1 {
            let mean_interval = intervals.iter().sum::<i64>() as f64 / intervals.len() as f64;
            let variance = intervals.iter()
                .map(|&interval| {
                    let diff = interval as f64 - mean_interval;
                    diff * diff
                })
                .sum::<f64>() / intervals.len() as f64;
            
            let consistency = if mean_interval.abs() < 1.0 {
                0.5 // Neutral for very frequent commits
            } else {
                1.0 / (1.0 + variance.sqrt() / mean_interval.abs())
            };
            consistency_scores.push(consistency);
        }

        // Size consistency
        let sizes: Vec<u32> = commits.iter().map(|c| c.additions + c.deletions).collect();
        if sizes.len() > 1 {
            let mean_size = sizes.iter().sum::<u32>() as f64 / sizes.len() as f64;
            let size_variance = sizes.iter()
                .map(|&size| {
                    let diff = size as f64 - mean_size;
                    diff * diff
                })
                .sum::<f64>() / sizes.len() as f64;
            
            let size_consistency = if mean_size < 1.0 {
                0.5
            } else {
                1.0 / (1.0 + size_variance.sqrt() / mean_size)
            };
            consistency_scores.push(size_consistency);
        }

        // Message quality consistency
        let message_qualities: Vec<f64> = commits.iter()
            .map(|commit| {
                let msg = &commit.message;
                if Self::is_conventional_commit(msg) && Self::is_descriptive_message(msg) {
                    1.0
                } else if Self::is_descriptive_message(msg) {
                    0.7
                } else {
                    0.3
                }
            })
            .collect();

        if message_qualities.len() > 1 {
            let mean_quality = message_qualities.iter().sum::<f64>() / message_qualities.len() as f64;
            consistency_scores.push(mean_quality);
        }

        consistency_scores.iter().sum::<f64>() / consistency_scores.len() as f64
    }

    fn has_bad_commit_patterns(message: &str) -> bool {
        let message_lower = message.to_lowercase();
        message_lower.contains("wip") ||
        message_lower.contains("temp") ||
        message_lower.contains("tmp") ||
        message_lower.contains("test commit") ||
        message_lower.starts_with("update") && message_lower.len() < 15 ||
        message_lower == "minor changes" ||
        message_lower == "fixes" ||
        message_lower.len() < 5
    }

    fn detect_technologies_from_repo(&self, repo: &Repository, commits: &[CommitData]) -> Vec<String> {
        let mut technologies = Vec::new();
        
        // Analyze repository name and description
        let repo_text = format!("{} {}", 
            repo.name.to_lowercase(), 
            repo.description.as_ref().unwrap_or(&String::new()).to_lowercase()
        );

        // Analyze commit messages
        let commit_text = commits.iter()
            .map(|c| c.message.to_lowercase())
            .collect::<Vec<_>>()
            .join(" ");

        let combined_text = format!("{} {}", repo_text, commit_text);

        // Check for technology keywords
        for keyword in &self.tech_keywords {
            if combined_text.contains(keyword) {
                technologies.push(keyword.clone());
            }
        }

        technologies.sort();
        technologies.dedup();
        technologies
    }

    fn calculate_code_quality_metrics(&self, commits: &[CommitData]) -> CodeQualityMetrics {
        if commits.is_empty() {
            return CodeQualityMetrics {
                avg_commit_size: 0.0,
                commit_message_quality: 0.0,
                code_consistency: 0.0,
                refactoring_frequency: 0.0,
                bug_fix_ratio: 0.0,
                feature_to_maintenance_ratio: 1.0,
            };
        }

        let total_changes: u32 = commits.iter().map(|c| c.additions + c.deletions).sum();
        let avg_commit_size = total_changes as f64 / commits.len() as f64;
        
        let commit_message_quality = self.calculate_commit_message_quality_comprehensive(commits);
        let code_consistency = self.calculate_commit_consistency_comprehensive(commits);
        
        let (feature_commits, bug_fix_commits, refactor_commits) = self.categorize_commits_comprehensive(commits);
        let total_commits = commits.len() as f64;
        
        let refactoring_frequency = refactor_commits as f64 / total_commits;
        let bug_fix_ratio = bug_fix_commits as f64 / total_commits;
        
        let feature_to_maintenance_ratio = if (bug_fix_commits + refactor_commits) == 0 {
            2.0 // High ratio if no maintenance commits
        } else {
            feature_commits as f64 / (bug_fix_commits + refactor_commits) as f64
        };

        CodeQualityMetrics {
            avg_commit_size,
            commit_message_quality,
            code_consistency,
            refactoring_frequency,
            bug_fix_ratio,
            feature_to_maintenance_ratio,
        }
    }    fn calculate_project_structure_score(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Repository size indicates substantial project
        let size_kb = repo.size.unwrap_or(0) as f64;
        if size_kb > 100.0 {
            score += 20.0;
        }
        if size_kb > 1000.0 {
            score += 15.0; // Bonus for substantial projects
        }

        // Check for project structure indicators in commit messages
        let has_structure_files = commits.iter().any(|commit| {
            let files_text = commit.files.iter()
                .map(|f| f.filename.to_lowercase())
                .collect::<Vec<_>>()
                .join(" ");
            
            files_text.contains("package.json") ||
            files_text.contains("cargo.toml") ||
            files_text.contains("requirements.txt") ||
            files_text.contains("pom.xml") ||
            files_text.contains("build.gradle") ||
            files_text.contains("dockerfile") ||
            files_text.contains("makefile") ||
            files_text.contains("cmake")
        });

        if has_structure_files {
            score += 25.0;
        }

        // Check for organized directory structure
        let has_organized_structure = commits.iter().any(|commit| {
            commit.files.iter().any(|f| {
                let path = &f.filename.to_lowercase();
                path.contains("src/") ||
                path.contains("lib/") ||
                path.contains("app/") ||
                path.contains("components/") ||
                path.contains("services/") ||
                path.contains("utils/") ||
                path.contains("helpers/")
            })
        });

        if has_organized_structure {
            score += 20.0;
        }

        // Check for configuration files
        let has_config_files = commits.iter().any(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("config") ||
            message.contains("environment") ||
            message.contains("settings") ||
            message.contains(".env") ||
            message.contains("tsconfig") ||
            message.contains("eslint") ||
            message.contains("prettier")
        });

        if has_config_files {
            score += 15.0;
        }

        // Active development pattern
        if commits.len() > 10 {
            score += 20.0;
        }

        score.min(100.0)
    }

    fn calculate_documentation_score_comprehensive(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Repository has description
        if repo.description.is_some() && !repo.description.as_ref().unwrap().is_empty() {
            let desc_len = repo.description.as_ref().unwrap().len();
            if desc_len > 20 {
                score += 25.0;
            } else if desc_len > 5 {
                score += 15.0;
            }
        }

        // Check for documentation in commits
        let has_docs = commits.iter().any(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("readme") ||
            message.contains("documentation") ||
            message.contains("docs") ||
            message.contains("comment") ||
            message.contains("doc:")
        });

        if has_docs {
            score += 30.0;
        }

        // Check for documentation files
        let has_doc_files = commits.iter().any(|commit| {
            commit.files.iter().any(|f| {
                let filename = f.filename.to_lowercase();
                filename.contains("readme") ||
                filename.contains("doc") ||
                filename.contains("license") ||
                filename.contains("changelog") ||
                filename.contains("contributing") ||
                filename.ends_with(".md")
            })
        });

        if has_doc_files {
            score += 25.0;
        }

        // Code comments (inferred from commit patterns)
        let has_comment_commits = commits.iter().filter(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("comment") ||
            message.contains("document") ||
            message.contains("explain") ||
            message.contains("clarify")
        }).count();

        if has_comment_commits > 0 {
            score += 20.0;
        }

        score.min(100.0)
    }

    fn calculate_testing_score_comprehensive(&self, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Check for test files in commits
        let test_file_commits = commits.iter().filter(|commit| {
            commit.files.iter().any(|f| {
                let filename = f.filename.to_lowercase();
                filename.contains("test") ||
                filename.contains("spec") ||
                filename.ends_with("_test.py") ||
                filename.ends_with("_test.go") ||
                filename.ends_with("_test.rs") ||
                filename.ends_with(".test.js") ||
                filename.ends_with(".test.ts") ||
                filename.ends_with(".spec.js") ||
                filename.ends_with(".spec.ts") ||
                filename.contains("__tests__")
            })
        }).count();

        if test_file_commits > 0 {
            score += 40.0;
            
            // Bonus for multiple test commits
            let test_ratio = test_file_commits as f64 / commits.len() as f64;
            if test_ratio > 0.1 {
                score += 20.0; // More than 10% of commits involve tests
            }
        }

        // Check for test-related commit messages
        let test_message_commits = commits.iter().filter(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("test") ||
            message.contains("spec") ||
            message.contains("unit test") ||
            message.contains("integration test") ||
            message.contains("e2e") ||
            message.contains("coverage")
        }).count();

        if test_message_commits > 0 {
            score += 25.0;
        }

        // Check for CI/CD related testing
        let has_ci_testing = commits.iter().any(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("ci") ||
            message.contains("github actions") ||
            message.contains("workflow") ||
            message.contains("pipeline") ||
            commit.files.iter().any(|f| {
                f.filename.contains(".github/workflows") ||
                f.filename.contains("ci.yml") ||
                f.filename.contains("test.yml")
            })
        });

        if has_ci_testing {
            score += 15.0;
        }

        score.min(100.0)
    }

    fn calculate_activity_score(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Recent activity
        if let Some(updated_at) = repo.updated_at {
            let days_since_update = (Utc::now() - updated_at).num_days();
            if days_since_update < 30 {
                score += 30.0;
            } else if days_since_update < 90 {
                score += 20.0;
            } else if days_since_update < 365 {
                score += 10.0;
            }
        }

        // Commit frequency
        if !commits.is_empty() {
            let commit_count = commits.len() as f64;
            if commit_count > 100 {
                score += 25.0;
            } else if commit_count > 50 {
                score += 20.0;
            } else if commit_count > 20 {
                score += 15.0;
            } else if commit_count > 5 {
                score += 10.0;
            }
        }

        // Project age and sustained development
        if let Some(created_at) = repo.created_at {
            let days_old = (Utc::now() - created_at).num_days();
            if days_old > 365 && !commits.is_empty() {
                score += 15.0; // Bonus for sustained long-term development
            }
        }

        // Community engagement
        let stars = repo.stargazers_count.unwrap_or(0);
        let forks = repo.forks_count.unwrap_or(0);
        
        if stars > 10 {
            score += 15.0;
        }
        if forks > 5 {
            score += 15.0;
        }

        score.min(100.0)
    }

    fn calculate_repo_innovation_score(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Community interest
        let stars = repo.stargazers_count.unwrap_or(0) as f64;
        let forks = repo.forks_count.unwrap_or(0) as f64;
        
        score += (stars.ln_1p() * 5.0).min(25.0);
        score += (forks.ln_1p() * 8.0).min(20.0);

        // Project uniqueness (not a fork)
        if !repo.fork.unwrap_or(false) {
            score += 20.0;
        }

        // Use of modern technologies
        let has_modern_tech = commits.iter().any(|commit| {
            let content = format!("{} {}", commit.message.to_lowercase(), 
                commit.files.iter().map(|f| f.filename.to_lowercase()).collect::<Vec<_>>().join(" "));
            
            content.contains("ai") || content.contains("ml") || content.contains("machine learning") ||
            content.contains("kubernetes") || content.contains("docker") ||
            content.contains("graphql") || content.contains("grpc") ||
            content.contains("microservice") || content.contains("serverless") ||
            content.contains("blockchain") || content.contains("cryptocurrency") ||
            content.contains("react") || content.contains("vue") || content.contains("angular") ||
            content.contains("typescript") || content.contains("rust") || content.contains("go")
        });

        if has_modern_tech {
            score += 25.0;
        }

        // Active development with regular updates
        if commits.len() > 50 {
            score += 10.0;
        }

        score.min(100.0)
    }    fn calculate_language_skills_comprehensive(&self, repo_analyses: &[RepositoryAnalysis]) -> HashMap<String, LanguageSkill> {
        let mut language_stats: HashMap<String, (u64, u32, HashSet<String>, u32)> = HashMap::new();

        // Aggregate language data across repositories
        for repo in repo_analyses {
            for (language, bytes) in &repo.languages {
                let entry = language_stats.entry(language.clone()).or_insert((0, 0, HashSet::new(), 0));
                entry.0 += bytes; // Total bytes
                entry.1 += repo.commit_analysis.total_commits; // Total commits
                entry.2.insert(repo.name.clone()); // Projects using this language
                entry.3 += repo.stars; // Total stars for projects using this language
            }
            
            // Also count primary language if not in languages map
            if let Some(primary_lang) = &repo.primary_language {
                let entry = language_stats.entry(primary_lang.clone()).or_insert((0, 0, HashSet::new(), 0));
                if entry.0 == 0 {
                    entry.0 = 1000; // Estimate if no byte count
                }
                entry.1 += repo.commit_analysis.total_commits;
                entry.2.insert(repo.name.clone());
                entry.3 += repo.stars;
            }
        }

        // Convert to LanguageSkill objects
        language_stats.into_iter().map(|(language, (bytes, commits, projects, total_stars))| {
            let project_count = projects.len() as u32;
            let weight_multiplier = self.language_weights.get(&language).copied().unwrap_or(1.0);
            
            // Calculate comprehensive proficiency score
            let usage_score = (bytes as f64).ln_1p() / 100.0; // Logarithmic scaling
            let commit_score = (commits as f64).ln_1p() / 10.0;
            let project_score = project_count as f64 * 15.0;
            let community_score = (total_stars as f64).ln_1p() * 2.0;
            
            let base_proficiency = (usage_score + commit_score + project_score + community_score).min(100.0);
            let proficiency_score = base_proficiency * weight_multiplier;

            let complexity_metrics = ComplexityMetrics {
                cyclomatic_complexity: Self::estimate_complexity(&language, bytes),
                cognitive_complexity: Self::estimate_cognitive_complexity(&language, commits),
                maintainability_index: Self::estimate_maintainability(&language, project_count),
                technical_debt_ratio: Self::estimate_technical_debt(commits, bytes),
            };

            (language.clone(), LanguageSkill {
                language: language.clone(),
                proficiency_score,
                lines_of_code: bytes / 50, // Rough estimation: 50 bytes per line
                commit_count: commits,
                project_count,
                complexity_metrics,
                weight_multiplier,
            })
        }).collect()
    }

    fn identify_technologies(&self, repo_analyses: &[RepositoryAnalysis]) -> HashMap<String, TechnologySkill> {
        let mut tech_stats: HashMap<String, (u32, HashSet<String>, bool)> = HashMap::new();

        for repo in repo_analyses {
            for technology in &repo.technologies {
                let entry = tech_stats.entry(technology.clone()).or_insert((0, HashSet::new(), false));
                entry.0 += 1; // Usage count
                entry.1.insert(repo.name.clone()); // Projects using this tech
                
                // Check if it's recent (within last year)
                if let Some(updated_at) = repo.updated_at {
                    if (Utc::now() - updated_at).num_days() < 365 {
                        entry.2 = true;
                    }
                }
            }
        }

        tech_stats.into_iter().map(|(tech, (usage_count, projects, recent_usage))| {
            let project_count = projects.len() as u32;
            
            // Calculate proficiency based on usage frequency and project count
            let proficiency_score = ((usage_count as f64 * 10.0) + (project_count as f64 * 20.0)).min(100.0);

            (tech.clone(), TechnologySkill {
                technology: tech,
                usage_count,
                project_count,
                proficiency_score,
                recent_usage,
            })
        }).collect()
    }

    fn determine_specializations(&self, repo_analyses: &[RepositoryAnalysis], tech_breakdown: &HashMap<String, TechnologySkill>) -> Vec<Specialization> {
        let mut specializations = Vec::new();

        // Web Development Specialization
        let web_techs = ["react", "vue", "angular", "nodejs", "express", "nextjs", "javascript", "typescript", "html", "css"];
        let web_score = self.calculate_specialization_score(tech_breakdown, &web_techs, repo_analyses);
        if web_score > 30.0 {
            specializations.push(Specialization {
                area: "Web Development".to_string(),
                confidence_score: web_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &web_techs),
                key_technologies: web_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Backend Development
        let backend_techs = ["spring", "django", "flask", "rails", "laravel", "asp.net", "gin", "fiber", "microservice"];
        let backend_score = self.calculate_specialization_score(tech_breakdown, &backend_techs, repo_analyses);
        if backend_score > 30.0 {
            specializations.push(Specialization {
                area: "Backend Development".to_string(),
                confidence_score: backend_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &backend_techs),
                key_technologies: backend_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Mobile Development
        let mobile_techs = ["android", "ios", "flutter", "react native", "xamarin", "ionic"];
        let mobile_score = self.calculate_specialization_score(tech_breakdown, &mobile_techs, repo_analyses);
        if mobile_score > 30.0 {
            specializations.push(Specialization {
                area: "Mobile Development".to_string(),
                confidence_score: mobile_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &mobile_techs),
                key_technologies: mobile_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // DevOps/Cloud
        let devops_techs = ["docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible", "jenkins"];
        let devops_score = self.calculate_specialization_score(tech_breakdown, &devops_techs, repo_analyses);
        if devops_score > 30.0 {
            specializations.push(Specialization {
                area: "DevOps/Cloud".to_string(),
                confidence_score: devops_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &devops_techs),
                key_technologies: devops_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Data Science/ML
        let ml_techs = ["tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "jupyter", "spark", "hadoop"];
        let ml_score = self.calculate_specialization_score(tech_breakdown, &ml_techs, repo_analyses);
        if ml_score > 30.0 {
            specializations.push(Specialization {
                area: "Data Science/ML".to_string(),
                confidence_score: ml_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &ml_techs),
                key_technologies: ml_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Blockchain/Web3
        let blockchain_techs = ["blockchain", "ethereum", "solidity", "web3", "defi", "nft", "smart contract"];
        let blockchain_score = self.calculate_specialization_score(tech_breakdown, &blockchain_techs, repo_analyses);
        if blockchain_score > 30.0 {
            specializations.push(Specialization {
                area: "Blockchain/Web3".to_string(),
                confidence_score: blockchain_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &blockchain_techs),
                key_technologies: blockchain_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Game Development
        let game_techs = ["unity", "unreal", "godot", "opengl", "vulkan", "directx"];
        let game_score = self.calculate_specialization_score(tech_breakdown, &game_techs, repo_analyses);
        if game_score > 30.0 {
            specializations.push(Specialization {
                area: "Game Development".to_string(),
                confidence_score: game_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &game_techs),
                key_technologies: game_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Sort by confidence score
        specializations.sort_by(|a, b| b.confidence_score.partial_cmp(&a.confidence_score).unwrap());
        specializations
    }

    fn calculate_specialization_score(&self, tech_breakdown: &HashMap<String, TechnologySkill>, specialization_techs: &[&str], repo_analyses: &[RepositoryAnalysis]) -> f64 {
        let mut total_score = 0.0;
        let mut tech_count = 0;

        for tech in specialization_techs {
            if let Some(tech_skill) = tech_breakdown.get(*tech) {
                total_score += tech_skill.proficiency_score;
                tech_count += 1;
            }
        }

        // Also check repository names and descriptions for specialization indicators
        let specialization_repos = repo_analyses.iter()
            .filter(|repo| {
                let repo_text = format!("{} {}", 
                    repo.name.to_lowercase(), 
                    repo.description.as_ref().unwrap_or(&String::new()).to_lowercase()
                );
                specialization_techs.iter().any(|tech| repo_text.contains(tech))
            })
            .count();

        let repo_bonus = specialization_repos as f64 * 15.0;

        if tech_count > 0 {
            (total_score / tech_count as f64) + repo_bonus
        } else {
            repo_bonus
        }
    }

    fn get_supporting_projects(&self, repo_analyses: &[RepositoryAnalysis], specialization_techs: &[&str]) -> Vec<String> {
        repo_analyses.iter()
            .filter(|repo| {
                let repo_text = format!("{} {}", 
                    repo.name.to_lowercase(), 
                    repo.description.as_ref().unwrap_or(&String::new()).to_lowercase()
                );
                specialization_techs.iter().any(|tech| repo_text.contains(tech)) ||
                repo.technologies.iter().any(|t| specialization_techs.contains(&t.as_str()))
            })
            .map(|repo| repo.name.clone())
            .take(5) // Limit to top 5 supporting projects
            .collect()
    }

    fn calculate_overall_score_comprehensive(&self, language_breakdown: &HashMap<String, LanguageSkill>, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if language_breakdown.is_empty() || repo_analyses.is_empty() {
            return 0.0;
        }

        // Language proficiency component (30%)
        let language_score: f64 = language_breakdown.values()
            .map(|skill| skill.proficiency_score)
            .sum::<f64>() / language_breakdown.len() as f64;

        // Project quality component (40%)
        let project_score: f64 = repo_analyses.iter()
            .map(|repo| {
                (repo.project_structure_score * 0.25 + 
                 repo.documentation_score * 0.2 + 
                 repo.testing_score * 0.25 + 
                 repo.activity_score * 0.15 +
                 repo.innovation_score * 0.15)
            })
            .sum::<f64>() / repo_analyses.len() as f64;

        // Code quality component (20%)
        let code_quality: f64 = repo_analyses.iter()
            .map(|repo| {
                (repo.code_quality_metrics.commit_message_quality + 
                 repo.code_quality_metrics.code_consistency * 100.0 +
                 (1.0 - repo.code_quality_metrics.bug_fix_ratio) * 100.0) / 3.0
            })
            .sum::<f64>() / repo_analyses.len() as f64;

        // Activity and community component (10%)
        let activity_score: f64 = repo_analyses.iter()
            .map(|repo| {
                let stars_score = (repo.stars as f64).ln_1p() * 10.0;
                let commits_score = (repo.commit_analysis.total_commits as f64).ln_1p() * 5.0;
                (stars_score + commits_score).min(100.0)
            })
            .sum::<f64>() / repo_analyses.len() as f64;

        // Weighted combination
        (language_score * 0.3 + project_score * 0.4 + code_quality * 0.2 + activity_score * 0.1).min(100.0)
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
        if repo_analyses.is_empty() {
            return 0.0;
        }

        repo_analyses.iter()
            .map(|repo| {
                let metrics = &repo.code_quality_metrics;
                (metrics.commit_message_quality * 0.3 + 
                 metrics.code_consistency * 100.0 * 0.3 +
                 (1.0 - metrics.bug_fix_ratio) * 100.0 * 0.2 +
                 metrics.refactoring_frequency * 100.0 * 0.2)
            })
            .sum::<f64>() / repo_analyses.len() as f64
    }

    fn calculate_project_quality_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        repo_analyses.iter()
            .map(|repo| {
                (repo.project_structure_score * 0.3 + 
                 repo.documentation_score * 0.3 + 
                 repo.testing_score * 0.4)
            })
            .sum::<f64>() / repo_analyses.len() as f64
    }

    fn calculate_innovation_score_comprehensive(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        repo_analyses.iter()
            .map(|repo| repo.innovation_score)
            .sum::<f64>() / repo_analyses.len() as f64
    }    // Helper methods for complexity and technical debt estimation
    fn estimate_complexity(language: &str, bytes: u64) -> f64 {
        let base_complexity = match language.to_lowercase().as_str() {
            "c++" | "c" | "rust" => 8.0,
            "java" | "c#" => 6.0,
            "python" | "javascript" | "typescript" => 4.0,
            "go" | "kotlin" | "swift" => 5.0,
            _ => 3.0,
        };
        
        // Scale with project size
        base_complexity * (1.0 + (bytes as f64 / 100000.0))
    }

    fn estimate_cognitive_complexity(language: &str, commits: u32) -> f64 {
        let base_cognitive = match language.to_lowercase().as_str() {
            "assembly" | "c" => 9.0,
            "c++" | "rust" => 7.0,
            "java" | "c#" => 5.0,
            "python" | "javascript" => 3.0,
            _ => 4.0,
        };
        
        // Scale with commit frequency (more commits might indicate complexity)
        base_cognitive * (1.0 + (commits as f64 / 1000.0))
    }

    fn estimate_maintainability(language: &str, project_count: u32) -> f64 {
        let base_maintainability = match language.to_lowercase().as_str() {
            "python" | "go" | "rust" => 85.0,
            "java" | "c#" | "typescript" => 75.0,
            "javascript" | "php" => 65.0,
            "c++" | "c" => 55.0,
            _ => 70.0,
        };
        
        // Higher project count might indicate better practices
        (base_maintainability + (project_count as f64 * 2.0)).min(100.0)
    }

    fn estimate_technical_debt(commits: u32, bytes: u64) -> f64 {
        if commits == 0 || bytes == 0 {
            return 0.5; // Default moderate debt
        }
        
        let commits_per_kloc = (commits as f64) / ((bytes / 1000) as f64);
        
        // Higher commits per KLOC might indicate more maintenance/fixes
        if commits_per_kloc > 50.0 {
            0.7 // High debt
        } else if commits_per_kloc > 20.0 {
            0.4 // Moderate debt
        } else {
            0.2 // Low debt
        }
    }

    fn has_multiple_languages(languages: &HashMap<String, u64>) -> bool {
        languages.len() > 2
    }

    fn has_testing_indicators(files: &[String]) -> bool {
        files.iter().any(|f| {
            let name = f.to_lowercase();
            name.contains("test") || 
            name.contains("spec") || 
            name.ends_with(".test.js") ||
            name.ends_with(".spec.ts") ||
            name.ends_with("_test.py") ||
            name.contains("cypress") ||
            name.contains("jest")
        })
    }

    fn has_ci_cd_setup(files: &[String]) -> bool {
        files.iter().any(|f| {
            let name = f.to_lowercase();
            name.contains(".github/workflows") ||
            name.contains("jenkinsfile") ||
            name.contains("gitlab-ci") ||
            name.contains("azure-pipelines") ||
            name == "dockerfile" ||
            name == "docker-compose.yml"
        })
    }

    fn detect_architectural_patterns(files: &[String], description: &Option<String>) -> Vec<String> {
        let mut patterns = Vec::new();
        
        // Check for common architectural patterns
        if files.iter().any(|f| f.to_lowercase().contains("microservice")) {
            patterns.push("Microservices".to_string());
        }
        
        if files.iter().any(|f| f.to_lowercase().contains("mvc")) {
            patterns.push("MVC".to_string());
        }
        
        if files.iter().any(|f| f.to_lowercase().contains("component")) {
            patterns.push("Component-Based".to_string());
        }
        
        // Check description for patterns
        if let Some(desc) = description {
            let desc_lower = desc.to_lowercase();
            if desc_lower.contains("rest") || desc_lower.contains("api") {
                patterns.push("REST API".to_string());
            }
            if desc_lower.contains("graphql") {
                patterns.push("GraphQL".to_string());
            }
            if desc_lower.contains("serverless") {
                patterns.push("Serverless".to_string());
            }
        }
        
        patterns
    }
}
