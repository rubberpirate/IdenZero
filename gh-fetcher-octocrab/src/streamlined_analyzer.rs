use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::analyzer::{GitHubAnalyzer, SkillAnalysis, UserProfile};
use crate::iden_score::{IdenScoreCalculator, IdenScore};

/// Streamlined developer profile with essential information only
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StreamlinedProfile {
    pub username: String,
    pub summary: String, // 2-3 line description
    pub proficiency: Vec<String>, // Top 5 technologies
    pub domain_expertise: DomainExpertise, // AI/ML, Cyber, Web3, Data, IoT proficiency
    pub top_languages: Vec<LanguageInfo>,
    pub recent_commits: Vec<CommitInfo>,
    pub key_contributions: Vec<ContributionInfo>,
    pub github_stats: GitHubStats,
    pub badges: Vec<Badge>, // Achievement badges
    pub iden_score: IdenScoreSummary, // Complete IdenScore summary
    pub last_updated: DateTime<Utc>,
}

/// Domain expertise scores for specialized fields
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DomainExpertise {
    pub ai_ml: DomainScore,        // Artificial Intelligence & Machine Learning
    pub cybersecurity: DomainScore, // Cybersecurity & Infosec
    pub web3: DomainScore,         // Blockchain & Web3
    pub data_science: DomainScore, // Data Science & Analytics
    pub iot: DomainScore,          // Internet of Things
    pub devops: DomainScore,       // DevOps & Infrastructure
    pub mobile: DomainScore,       // Mobile Development
    pub gaming: DomainScore,       // Game Development
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DomainScore {
    pub score: f64,           // 0-100 proficiency score
    pub level: String,        // "Novice", "Beginner", "Intermediate", "Advanced", "Expert"
    pub technologies: Vec<String>, // Related technologies found
    pub projects: u32,        // Number of related projects
}

/// Achievement badges based on GitHub activity and skills
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Badge {
    pub id: String,           // Unique identifier
    pub name: String,         // Display name
    pub description: String,  // What this badge represents
    pub icon: String,         // Icon/emoji for display
    pub category: String,     // "skill", "activity", "social", "achievement"
    pub rarity: String,       // "common", "uncommon", "rare", "epic", "legendary"
    pub earned_date: DateTime<Utc>,
}

/// Condensed IdenScore information for streamlined profile
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IdenScoreSummary {
    pub overall_score: f64,        // 0-1000
    pub skill_level: String,       // "Junior", "Mid-Level", etc.
    pub next_milestone: f64,       // Next target score
    pub growth_potential: f64,     // 0-100
    pub top_strength: String,      // Highest scoring category
    pub improvement_area: String,  // Lowest scoring category
    pub verification_hash: String, // Tamper-proof hash (truncated)
    pub confidence_level: f64,     // Analysis confidence 0-100
    pub categories: CategoryScores, // Detailed category breakdown
    pub recommended_actions: Vec<RecommendedAction>, // Top 3 actions
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryScores {
    pub technical_mastery: f64,
    pub architecture_design: f64,
    pub code_quality: f64,
    pub innovation: f64,
    pub collaboration: f64,
    pub domain_expertise: f64,
    pub leadership: f64,
    pub continuous_learning: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecommendedAction {
    pub title: String,
    pub description: String,
    pub impact_points: f64,
    pub effort_level: f64,       // 1-10 difficulty
    pub timeline: String,        // "1-2 weeks", "1-3 months"
    pub priority: String,        // "high", "medium", "low"
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
    pub total_stars: u32,   // Total stars across all repos
    pub total_forks: u32,   // Total forks across all repos
    pub contribution_streak: u32, // Days of recent activity
}

pub struct StreamlinedAnalyzer {
    github_analyzer: GitHubAnalyzer,
    iden_score_calculator: IdenScoreCalculator,
}

impl StreamlinedAnalyzer {
    pub fn new(token: String) -> Result<Self, Box<dyn std::error::Error>> {
        let github_analyzer = GitHubAnalyzer::new(token)?;
        let iden_score_calculator = IdenScoreCalculator::new();
        Ok(Self { 
            github_analyzer,
            iden_score_calculator,
        })
    }

    /// Get streamlined profile for a user
    pub async fn get_profile(&mut self, username: String) -> Result<StreamlinedProfile, Box<dyn std::error::Error>> {
        let profile = UserProfile {
            github_username: username.clone(),
            wallet_address: None,
        };

        // Get full analysis
        let analysis = self.github_analyzer.analyze(profile).await?;
        
        // Calculate IdenScore
        let iden_score = self.iden_score_calculator.calculate_iden_score(&analysis);
        let iden_score_summary = self.create_enhanced_iden_score_summary(&iden_score);
        
        // Generate domain expertise analysis
        let domain_expertise = self.analyze_domain_expertise(&analysis);
        
        // Try to fetch GitHub user info (for followers, etc.) - fallback if fails
        let (followers, following) = match self.fetch_github_user_stats(&username).await {
            Ok((followers, following)) => (followers, following),
            Err(_) => (0, 0), // Fallback to 0 if API call fails
        };
        
        // Generate achievement badges
        let badges = self.generate_badges(&analysis, &iden_score, followers);
        
        // Calculate enhanced GitHub stats
        let github_stats = self.calculate_enhanced_github_stats(&analysis, followers, following);
        
        // Generate streamlined profile
        let streamlined = StreamlinedProfile {
            username: username.clone(),
            summary: self.generate_summary(&analysis),
            proficiency: self.extract_top_proficiencies(&analysis),
            domain_expertise,
            top_languages: self.get_top_languages(&analysis),
            recent_commits: Vec::new(), // Simplified - avoid complex API calls
            key_contributions: self.analyze_contributions_from_analysis(&analysis),
            github_stats,
            badges,
            iden_score: iden_score_summary,
            last_updated: chrono::Utc::now(),
        };

        Ok(streamlined)
    }

    async fn fetch_github_user_stats(&self, username: &str) -> Result<(u32, u32), Box<dyn std::error::Error>> {
        use serde_json::Value;
        
        let response: Value = self.github_analyzer.client
            .get(&format!("/users/{}", username), None::<&()>)
            .await?;
            
        let followers = response["followers"].as_u64().unwrap_or(0) as u32;
        let following = response["following"].as_u64().unwrap_or(0) as u32;
        
        Ok((followers, following))
    }

    fn generate_summary(&self, analysis: &SkillAnalysis) -> String {
        let experience_level = if analysis.years_active > 8.0 {
            "Senior"
        } else if analysis.years_active > 4.0 {
            "Mid-level"
        } else {
            "Junior"
        };

        let primary_expertise = if !analysis.specializations.is_empty() {
            &analysis.specializations[0].area
        } else {
            "Software Development"
        };

        // Calculate domain expertise scores on demand
        let web3_score = self.calculate_web3_score(analysis);
        let ai_ml_score = self.calculate_ai_ml_score(analysis);
        let cybersecurity_score = self.calculate_cybersecurity_score(analysis);
        let data_science_score = self.calculate_data_science_score(analysis);
        let iot_score = self.calculate_iot_score(analysis);

        // Create professional summary based on experience and domain expertise
        let domain_focus = if web3_score.score > 60.0 {
            "blockchain technology and decentralized systems"
        } else if ai_ml_score.score > 60.0 {
            "artificial intelligence and machine learning solutions"
        } else if cybersecurity_score.score > 60.0 {
            "cybersecurity and information protection"
        } else if data_science_score.score > 60.0 {
            "data science and analytics"
        } else if iot_score.score > 60.0 {
            "Internet of Things and embedded systems"
        } else {
            "innovative software solutions"
        };

        let collaboration_note = if analysis.collaboration_score > 75.0 {
            " Known for strong collaborative skills and active community engagement."
        } else if analysis.collaboration_score > 50.0 {
            " Demonstrates solid teamwork and project collaboration abilities."
        } else {
            ""
        };

        format!(
            "{} professional with {:.1} years of experience in {}. Specializes in {} with a proven track record of delivering quality solutions.{}",
            experience_level,
            analysis.years_active,
            primary_expertise,
            domain_focus,
            collaboration_note
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

    fn create_enhanced_iden_score_summary(&self, iden_score: &IdenScore) -> IdenScoreSummary {
        // Find top strength (highest scoring category)
        let categories = vec![
            ("Technical Mastery", iden_score.skill_categories.technical_mastery.score),
            ("Architecture Design", iden_score.skill_categories.architecture_design.score),
            ("Code Quality", iden_score.skill_categories.code_quality.score),
            ("Innovation", iden_score.skill_categories.innovation.score),
            ("Collaboration", iden_score.skill_categories.collaboration.score),
            ("Domain Expertise", iden_score.skill_categories.domain_expertise.score),
            ("Leadership", iden_score.skill_categories.leadership.score),
            ("Continuous Learning", iden_score.skill_categories.continuous_learning.score),
        ];

        let top_strength = categories.iter()
            .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
            .map(|(name, _)| name.to_string())
            .unwrap_or_else(|| "Technical Mastery".to_string());

        let improvement_area = categories.iter()
            .min_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
            .map(|(name, _)| name.to_string())
            .unwrap_or_else(|| "Leadership".to_string());

        // Calculate confidence level based on data quality
        let confidence_level = self.calculate_confidence_level(iden_score);

        IdenScoreSummary {
            overall_score: iden_score.overall_score,
            skill_level: iden_score.get_skill_level().to_string(),
            next_milestone: iden_score.get_next_milestone(),
            growth_potential: iden_score.growth_potential.overall_growth_score,
            top_strength,
            improvement_area,
            verification_hash: iden_score.verification_hash[..16].to_string(), // First 16 chars
            confidence_level,
            categories: CategoryScores {
                technical_mastery: iden_score.skill_categories.technical_mastery.score,
                architecture_design: iden_score.skill_categories.architecture_design.score,
                code_quality: iden_score.skill_categories.code_quality.score,
                innovation: iden_score.skill_categories.innovation.score,
                collaboration: iden_score.skill_categories.collaboration.score,
                domain_expertise: iden_score.skill_categories.domain_expertise.score,
                leadership: iden_score.skill_categories.leadership.score,
                continuous_learning: iden_score.skill_categories.continuous_learning.score,
            },
            recommended_actions: self.convert_recommended_actions(&iden_score.growth_potential.recommended_actions),
        }
    }

    fn calculate_confidence_level(&self, iden_score: &IdenScore) -> f64 {
        // Base confidence on data richness and analysis depth
        let mut confidence: f64 = 50.0; // Base confidence

        // More repositories = higher confidence
        if iden_score.overall_score > 0.0 {
            confidence += 20.0;
        }

        // Balanced skill categories = higher confidence  
        let category_scores = vec![
            iden_score.skill_categories.technical_mastery.score,
            iden_score.skill_categories.architecture_design.score,
            iden_score.skill_categories.code_quality.score,
            iden_score.skill_categories.innovation.score,
        ];
        
        let avg_score = category_scores.iter().sum::<f64>() / category_scores.len() as f64;
        if avg_score > 30.0 {
            confidence += 15.0;
        }

        // Growth potential indicates good data
        if iden_score.growth_potential.overall_growth_score > 50.0 {
            confidence += 15.0;
        }

        confidence.min(100.0)
    }

    fn convert_recommended_actions(&self, original_actions: &[crate::iden_score::RecommendedAction]) -> Vec<RecommendedAction> {
        original_actions.iter().take(3).map(|action| {
            let priority_str = match action.priority {
                crate::iden_score::Priority::Critical => "high".to_string(),
                crate::iden_score::Priority::High => "high".to_string(),
                crate::iden_score::Priority::Medium => "medium".to_string(),
                crate::iden_score::Priority::Low => "low".to_string(),
            };
            
            RecommendedAction {
                title: action.action.clone(),  // Using 'action' field as title
                description: action.action.clone(),  // Using action as description too for now
                impact_points: action.impact,
                effort_level: action.effort_required,
                timeline: "1-3 months".to_string(), // Default timeline since not in original
                priority: priority_str,
            }
        }).collect()
    }

    fn analyze_domain_expertise(&self, analysis: &SkillAnalysis) -> DomainExpertise {
        DomainExpertise {
            ai_ml: self.calculate_ai_ml_score(analysis),
            cybersecurity: self.calculate_cybersecurity_score(analysis),
            web3: self.calculate_web3_score(analysis),
            data_science: self.calculate_data_science_score(analysis),
            iot: self.calculate_iot_score(analysis),
            devops: self.calculate_devops_score(analysis),
            mobile: self.calculate_mobile_score(analysis),
            gaming: self.calculate_gaming_score(analysis),
        }
    }

    fn calculate_ai_ml_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let ai_ml_languages = ["Python", "R", "Julia", "MATLAB"];
        let ai_ml_frameworks = ["tensorflow", "pytorch", "scikit-learn", "keras", "opencv", "pandas", "numpy", "transformers", "huggingface"];
        let ai_ml_strong_keywords = ["machine learning", "deep learning", "neural network", "artificial intelligence", "computer vision", "nlp", "data science"];
        let ai_ml_weak_keywords = ["ai", "ml", "model", "prediction", "classification"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;
        let mut total_ai_lines = 0u64;

        // Language analysis with smart weighting
        for lang in &ai_ml_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                let lang_multiplier = match *lang {
                    "Python" => 0.4, // High weight but not exclusive to AI/ML
                    "R" => 0.7, // Very strong indicator for AI/ML
                    "Julia" => 0.6, // Strong indicator for scientific computing
                    "MATLAB" => 0.5, // Good indicator for ML/scientific work
                    _ => 0.2,
                };
                score += skill.score * lang_multiplier;
                total_ai_lines += skill.lines_of_code;
                technologies.push(lang.to_string());
            }
        }

        // Smart repository analysis
        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            let mut repo_ai_score = 0.0;
            
            // Framework detection (very strong indicators)
            let framework_matches = ai_ml_frameworks.iter().filter(|fw| {
                desc.contains(**fw) || name.contains(**fw)
            }).count();
            
            if framework_matches > 0 {
                repo_ai_score += framework_matches as f64 * 15.0; // Strong framework indicators
            }
            
            // Strong keyword detection
            let strong_matches = ai_ml_strong_keywords.iter().filter(|kw| {
                desc.contains(**kw) || name.contains(**kw)
            }).count();
            
            if strong_matches > 0 {
                repo_ai_score += strong_matches as f64 * 12.0;
            }
            
            // Weak keywords only if no strong indicators
            if framework_matches == 0 && strong_matches == 0 {
                let weak_matches = ai_ml_weak_keywords.iter().filter(|kw| {
                    desc.contains(**kw) || name.contains(**kw)
                }).count();
                repo_ai_score += weak_matches as f64 * 3.0; // Much lower score
            }
            
            // Check for AI/ML specific file patterns
            if repo.languages.contains_key("Jupyter Notebook") {
                repo_ai_score += 8.0; // Jupyter notebooks are strong ML indicators
            }
            
            // Python + data science patterns
            if repo.languages.contains_key("Python") {
                let python_bytes = repo.languages.get("Python").unwrap_or(&0);
                if *python_bytes > 5000 && (framework_matches > 0 || strong_matches > 0) {
                    repo_ai_score += 10.0; // Substantial Python + AI keywords
                }
            }
            
            // Project quality and popularity boost
            let quality_multiplier = if repo.stars > 100 {
                1.5 // Popular AI/ML projects get boost
            } else if repo.stars > 20 {
                1.2
            } else if repo.stars == 0 && repo.forks == 0 {
                0.7 // Penalty for projects with no engagement
            } else {
                1.0
            };
            
            repo_ai_score *= quality_multiplier;
            
            if repo_ai_score > 8.0 { // Only count meaningful AI/ML projects
                score += repo_ai_score;
                projects += 1;
            }
        }
        
        // Reality check - need substantial code or clear project focus
        if total_ai_lines < 1000 && projects < 2 && score > 30.0 {
            score *= 0.6; // Penalty for claimed expertise without substantial work
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn calculate_cybersecurity_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let security_languages = ["C", "C++", "Assembly", "Python", "Go", "Rust"];
        let security_tools = ["metasploit", "nmap", "wireshark", "burp", "kali", "penetration", "exploit"];
        let security_frameworks = ["scapy", "pwntools", "volatility", "ghidra", "ida", "radare2"];
        let security_concepts = ["vulnerability", "exploit", "penetration testing", "reverse engineering", "malware analysis", "forensics"];
        let weak_security_terms = ["security", "crypto", "encryption", "firewall"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;
        let mut total_security_lines = 0u64;

        // Language scoring with security context
        for lang in &security_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                let multiplier = match *lang {
                    "Assembly" => 0.8, // Very strong indicator for low-level security work
                    "C" | "C++" => 0.5, // Strong but not exclusive to security
                    "Python" => 0.3, // Common in security but also general purpose
                    "Go" | "Rust" => 0.2, // Can be used for security tools
                    _ => 0.1,
                };
                score += skill.score * multiplier;
                total_security_lines += skill.lines_of_code;
                technologies.push(lang.to_string());
            }
        }

        // Intelligent repository analysis
        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            let mut repo_security_score = 0.0;
            
            // Security tools and frameworks (very strong indicators)
            let tool_matches = security_tools.iter().filter(|tool| {
                desc.contains(**tool) || name.contains(**tool)
            }).count();
            
            let framework_matches = security_frameworks.iter().filter(|fw| {
                desc.contains(**fw) || name.contains(**fw)
            }).count();
            
            if tool_matches > 0 {
                repo_security_score += tool_matches as f64 * 20.0; // Very high score for security tools
            }
            
            if framework_matches > 0 {
                repo_security_score += framework_matches as f64 * 25.0; // Highest score for security frameworks
            }
            
            // Security concepts
            let concept_matches = security_concepts.iter().filter(|concept| {
                desc.contains(**concept) || name.contains(**concept)
            }).count();
            
            if concept_matches > 0 {
                repo_security_score += concept_matches as f64 * 15.0;
            }
            
            // Weak terms only if no strong indicators
            if tool_matches == 0 && framework_matches == 0 && concept_matches == 0 {
                let weak_matches = weak_security_terms.iter().filter(|term| {
                    desc.contains(**term) || name.contains(**term)
                }).count();
                repo_security_score += weak_matches as f64 * 2.0; // Very low score
            }
            
            // CTF or competition context
            if desc.contains("ctf") || desc.contains("capture the flag") || name.contains("ctf") {
                repo_security_score += 15.0;
            }
            
            // Low-level languages in security context
            if (repo.languages.contains_key("C") || repo.languages.contains_key("Assembly")) && 
               (tool_matches > 0 || concept_matches > 0) {
                repo_security_score += 12.0; // Bonus for low-level security work
            }
            
            // Project engagement matters more for security
            let engagement_multiplier = if repo.stars > 25 || repo.forks > 5 {
                1.3 // Security tools/research that gets attention
            } else if repo.stars == 0 && repo.forks == 0 {
                0.6 // Penalty for unengaged security projects
            } else {
                1.0
            };
            
            repo_security_score *= engagement_multiplier;
            
            if repo_security_score > 10.0 { // Higher threshold for security projects
                score += repo_security_score;
                projects += 1;
            }
        }
        
        // Credibility check - security requires depth
        if projects < 2 && total_security_lines < 2000 && score > 40.0 {
            score *= 0.5; // Heavy penalty for shallow security claims
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn calculate_web3_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let web3_languages = ["Solidity", "Rust", "Move", "Cairo", "Vyper"];
        let web3_frameworks = ["truffle", "hardhat", "foundry", "brownie", "anchor", "substrate"];
        let web3_keywords = ["smart contract", "defi", "dapp", "ethereum", "solana", "polygon"];
        let web3_weak_keywords = ["blockchain", "nft", "bitcoin", "web3", "crypto"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;
        let mut total_web3_lines = 0u64;

        // Strong language indicators (much higher weight for actual Web3 languages)
        for lang in &web3_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                let lang_score = match *lang {
                    "Solidity" => skill.score * 0.8, // Highest weight for native Web3 language
                    "Move" | "Cairo" => skill.score * 0.7, // High weight for blockchain-specific languages  
                    "Vyper" => skill.score * 0.6, // Medium-high weight
                    "Rust" => skill.score * 0.2, // Lower weight since Rust has many non-Web3 uses
                    _ => skill.score * 0.1,
                };
                score += lang_score;
                total_web3_lines += skill.lines_of_code;
                technologies.push(lang.to_string());
            }
        }

        // Analyze repositories with intelligent scoring
        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            let mut repo_web3_score = 0.0;
            
            // Strong Web3 indicators
            let strong_matches = web3_keywords.iter().filter(|kw| desc.contains(**kw) || name.contains(**kw)).count();
            let framework_matches = web3_frameworks.iter().filter(|fw| desc.contains(**fw) || name.contains(**fw)).count();
            
            if repo.is_web3_project {
                repo_web3_score += 25.0; // High score for confirmed Web3 projects
            } else if strong_matches > 0 {
                repo_web3_score += strong_matches as f64 * 8.0; // Strong keywords worth more
            } else if framework_matches > 0 {
                repo_web3_score += framework_matches as f64 * 12.0; // Framework mentions are very strong
            }
            
            // Weak indicators (much lower scores)
            let weak_matches = web3_weak_keywords.iter().filter(|kw| desc.contains(**kw) || name.contains(**kw)).count();
            if weak_matches > 0 && strong_matches == 0 && framework_matches == 0 {
                repo_web3_score += weak_matches as f64 * 2.0; // Very low score for weak keywords only
            }
            
            // Project quality multipliers
            let quality_multiplier = if repo.stars > 50 || repo.forks > 10 {
                1.5 // Boost for popular projects
            } else if repo.stars > 10 || repo.forks > 2 {
                1.2 // Small boost for somewhat popular projects
            } else {
                0.8 // Penalty for projects with no traction
            };
            
            repo_web3_score *= quality_multiplier;
            
            // Solidity presence is a very strong indicator
            if repo.languages.contains_key("Solidity") {
                let solidity_bytes = repo.languages.get("Solidity").unwrap_or(&0);
                if *solidity_bytes > 1000 { // Substantial Solidity code
                    repo_web3_score += 20.0;
                } else if *solidity_bytes > 100 { // Some Solidity code
                    repo_web3_score += 10.0;
                }
            }
            
            if repo_web3_score > 5.0 { // Only count if meaningful Web3 score
                score += repo_web3_score;
                projects += 1;
            }
        }
        
        // Heavy penalty for low actual Web3 language usage
        if total_web3_lines < 500 && score > 20.0 {
            score *= 0.5; // 50% penalty for claimed Web3 expertise with little actual code
        }
        
        // Minimum threshold - need at least some real Web3 indicators
        if projects == 0 && total_web3_lines == 0 {
            score = score.min(10.0); // Cap at very low score without real projects
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn calculate_data_science_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let data_languages = ["Python", "R", "SQL", "Scala", "Julia"];
        let data_frameworks = ["pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly", "spark", "kafka", "airflow"];
        let data_tools = ["jupyter", "tableau", "powerbi", "elasticsearch", "mongodb", "postgresql", "mysql"];
        let data_concepts = ["data science", "data analysis", "analytics", "visualization", "statistics", "big data", "etl"];
        let weak_data_terms = ["data", "analysis", "chart", "graph"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;
        let mut total_data_lines = 0u64;

        // Language analysis with data science context
        for lang in &data_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                let multiplier = match *lang {
                    "R" => 0.8, // Primarily for data science/statistics
                    "SQL" => 0.7, // Very strong data indicator
                    "Python" => 0.4, // Strong but general purpose
                    "Scala" => 0.5, // Often used for big data
                    "Julia" => 0.6, // Scientific computing focused
                    _ => 0.2,
                };
                score += skill.score * multiplier;
                total_data_lines += skill.lines_of_code;
                technologies.push(lang.to_string());
            }
        }

        // Repository analysis with smart scoring
        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            let mut repo_data_score = 0.0;
            
            // Data frameworks (strong indicators)
            let framework_matches = data_frameworks.iter().filter(|fw| {
                desc.contains(**fw) || name.contains(**fw)
            }).count();
            
            if framework_matches > 0 {
                repo_data_score += framework_matches as f64 * 12.0;
            }
            
            // Data tools
            let tool_matches = data_tools.iter().filter(|tool| {
                desc.contains(**tool) || name.contains(**tool)
            }).count();
            
            if tool_matches > 0 {
                repo_data_score += tool_matches as f64 * 10.0;
            }
            
            // Data science concepts
            let concept_matches = data_concepts.iter().filter(|concept| {
                desc.contains(**concept) || name.contains(**concept)
            }).count();
            
            if concept_matches > 0 {
                repo_data_score += concept_matches as f64 * 8.0;
            }
            
            // Weak terms only if no strong indicators
            if framework_matches == 0 && tool_matches == 0 && concept_matches == 0 {
                let weak_matches = weak_data_terms.iter().filter(|term| {
                    desc.contains(**term) || name.contains(**term)
                }).count();
                repo_data_score += weak_matches as f64 * 2.0;
            }
            
            // Special file type bonuses
            if repo.languages.contains_key("Jupyter Notebook") {
                repo_data_score += 15.0; // Strong indicator for data science
            }
            
            if repo.languages.contains_key("R") {
                let r_bytes = repo.languages.get("R").unwrap_or(&0);
                if *r_bytes > 1000 {
                    repo_data_score += 12.0; // Substantial R code
                }
            }
            
            // SQL presence in data context
            if (desc.contains("database") || desc.contains("sql") || name.contains("sql")) &&
               (framework_matches > 0 || concept_matches > 0) {
                repo_data_score += 8.0;
            }
            
            // Quality considerations
            let quality_multiplier = if repo.stars > 50 {
                1.4 // Data science projects with good engagement
            } else if repo.stars > 10 {
                1.1
            } else if repo.stars == 0 && repo.forks == 0 {
                0.8
            } else {
                1.0
            };
            
            repo_data_score *= quality_multiplier;
            
            if repo_data_score > 6.0 { // Meaningful data science threshold
                score += repo_data_score;
                projects += 1;
            }
        }
        
        // Depth validation
        if total_data_lines < 2000 && projects < 3 && score > 35.0 {
            score *= 0.7; // Penalty for shallow data science claims
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn calculate_iot_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let iot_languages = ["C", "C++", "Python", "JavaScript", "Arduino"];
        let iot_platforms = ["arduino", "raspberry pi", "esp32", "esp8266", "micropython", "nodemcu"];
        let iot_protocols = ["mqtt", "coap", "zigbee", "lora", "wifi", "bluetooth"];
        let iot_concepts = ["iot", "internet of things", "embedded", "sensor", "microcontroller", "firmware"];
        let weak_iot_terms = ["hardware", "device", "automation"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;
        let mut total_iot_lines = 0u64;

        // Language analysis with IoT context
        for lang in &iot_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                let multiplier = match *lang {
                    "Arduino" => 0.9, // Very strong IoT indicator
                    "C" | "C++" => 0.4, // Strong for embedded/IoT but also general
                    "Python" => 0.2, // Can be used for IoT but very general
                    "JavaScript" => 0.15, // Sometimes used for IoT dashboards
                    _ => 0.1,
                };
                score += skill.score * multiplier;
                total_iot_lines += skill.lines_of_code;
                technologies.push(lang.to_string());
            }
        }

        // Smart repository analysis
        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            let mut repo_iot_score = 0.0;
            
            // IoT platforms (very strong indicators)
            let platform_matches = iot_platforms.iter().filter(|platform| {
                desc.contains(**platform) || name.contains(**platform)
            }).count();
            
            if platform_matches > 0 {
                repo_iot_score += platform_matches as f64 * 20.0;
            }
            
            // IoT protocols
            let protocol_matches = iot_protocols.iter().filter(|protocol| {
                desc.contains(**protocol) || name.contains(**protocol)
            }).count();
            
            if protocol_matches > 0 {
                repo_iot_score += protocol_matches as f64 * 12.0;
            }
            
            // IoT concepts
            let concept_matches = iot_concepts.iter().filter(|concept| {
                desc.contains(**concept) || name.contains(**concept)
            }).count();
            
            if concept_matches > 0 {
                repo_iot_score += concept_matches as f64 * 10.0;
            }
            
            // Weak terms only without strong indicators
            if platform_matches == 0 && protocol_matches == 0 && concept_matches == 0 {
                let weak_matches = weak_iot_terms.iter().filter(|term| {
                    desc.contains(**term) || name.contains(**term)
                }).count();
                repo_iot_score += weak_matches as f64 * 2.0;
            }
            
            // Arduino or C/C++ in IoT context gets bonus
            if (repo.languages.contains_key("Arduino") || 
                repo.languages.contains_key("C") || 
                repo.languages.contains_key("C++")) && 
               (platform_matches > 0 || concept_matches > 0) {
                repo_iot_score += 15.0;
            }
            
            // IoT projects often have moderate engagement
            let engagement_multiplier = if repo.stars > 20 || repo.forks > 3 {
                1.3 // Good for IoT projects
            } else if repo.stars == 0 && repo.forks == 0 {
                0.7
            } else {
                1.0
            };
            
            repo_iot_score *= engagement_multiplier;
            
            if repo_iot_score > 8.0 { // Meaningful IoT threshold
                score += repo_iot_score;
                projects += 1;
            }
        }
        
        // Validation - IoT requires hardware focus
        if projects < 2 && total_iot_lines < 1000 && score > 30.0 {
            score *= 0.6; // Penalty for claimed IoT without substantial embedded work
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn calculate_devops_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let devops_languages = ["Shell", "Python", "Go", "YAML"];
        let devops_keywords = ["docker", "kubernetes", "terraform", "ansible", "jenkins", "ci/cd", "devops", "aws", "azure"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;

        for lang in &devops_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                score += skill.score * 0.25;
                technologies.push(lang.to_string());
            }
        }

        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            
            if devops_keywords.iter().any(|kw| desc.contains(kw) || name.contains(kw)) {
                score += 14.0;
                projects += 1;
            }
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn calculate_mobile_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let mobile_languages = ["Swift", "Kotlin", "Java", "Dart", "JavaScript"];
        let mobile_keywords = ["android", "ios", "flutter", "react native", "mobile app", "swift", "kotlin"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;

        for lang in &mobile_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                score += skill.score * 0.3;
                technologies.push(lang.to_string());
            }
        }

        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            
            if mobile_keywords.iter().any(|kw| desc.contains(kw) || name.contains(kw)) {
                score += 16.0;
                projects += 1;
            }
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn calculate_gaming_score(&self, analysis: &SkillAnalysis) -> DomainScore {
        let gaming_languages = ["C#", "C++", "JavaScript", "Python", "Lua"];
        let gaming_keywords = ["game", "unity", "unreal", "godot", "pygame", "gaming", "3d", "graphics"];
        
        let mut score = 0.0;
        let mut technologies = Vec::new();
        let mut projects = 0;

        for lang in &gaming_languages {
            if let Some(skill) = analysis.language_breakdown.get(*lang) {
                score += skill.score * 0.25;
                technologies.push(lang.to_string());
            }
        }

        for repo in &analysis.repository_analysis {
            let desc = repo.description.as_ref().unwrap_or(&"".to_string()).to_lowercase();
            let name = repo.name.to_lowercase();
            
            if gaming_keywords.iter().any(|kw| desc.contains(kw) || name.contains(kw)) {
                score += 20.0;
                projects += 1;
            }
        }

        DomainScore {
            score: score.min(100.0),
            level: self.score_to_level(score),
            technologies,
            projects,
        }
    }

    fn score_to_level(&self, score: f64) -> String {
        match score as u32 {
            0..=10 => "Novice".to_string(),
            11..=25 => "Beginner".to_string(), 
            26..=50 => "Intermediate".to_string(),
            51..=75 => "Advanced".to_string(),
            _ => "Expert".to_string(),
        }
    }

    fn generate_badges(&self, analysis: &SkillAnalysis, iden_score: &IdenScore, followers: u32) -> Vec<Badge> {
        let mut badges = Vec::new();
        let now = Utc::now();

        // Repository count badges
        if analysis.total_repositories >= 100 {
            badges.push(Badge {
                id: "prolific_contributor".to_string(),
                name: "Prolific Contributor".to_string(),
                description: "Has 100+ public repositories".to_string(),
                icon: "🏭".to_string(),
                category: "activity".to_string(),
                rarity: "epic".to_string(),
                earned_date: now,
            });
        } else if analysis.total_repositories >= 50 {
            badges.push(Badge {
                id: "active_developer".to_string(),
                name: "Active Developer".to_string(),
                description: "Has 50+ public repositories".to_string(),
                icon: "⚡".to_string(),
                category: "activity".to_string(),
                rarity: "rare".to_string(),
                earned_date: now,
            });
        } else if analysis.total_repositories >= 20 {
            badges.push(Badge {
                id: "consistent_contributor".to_string(),
                name: "Consistent Contributor".to_string(),
                description: "Has 20+ public repositories".to_string(),
                icon: "📈".to_string(),
                category: "activity".to_string(),
                rarity: "uncommon".to_string(),
                earned_date: now,
            });
        }

        // IdenScore level badges
        match iden_score.get_skill_level() {
            "Expert" => badges.push(Badge {
                id: "expert_developer".to_string(),
                name: "Expert Developer".to_string(),
                description: "Achieved Expert level IdenScore".to_string(),
                icon: "🎖️".to_string(),
                category: "achievement".to_string(),
                rarity: "legendary".to_string(),
                earned_date: now,
            }),
            "Senior" => badges.push(Badge {
                id: "senior_developer".to_string(),
                name: "Senior Developer".to_string(),
                description: "Achieved Senior level IdenScore".to_string(),
                icon: "🥇".to_string(),
                category: "achievement".to_string(),
                rarity: "epic".to_string(),
                earned_date: now,
            }),
            "Mid-Level" => badges.push(Badge {
                id: "mid_developer".to_string(),
                name: "Mid-Level Developer".to_string(),
                description: "Achieved Mid-Level IdenScore".to_string(),
                icon: "🥈".to_string(),
                category: "achievement".to_string(),
                rarity: "rare".to_string(),
                earned_date: now,
            }),
            _ => {}
        }

        // Language diversity badge
        if analysis.language_breakdown.len() >= 10 {
            badges.push(Badge {
                id: "polyglot_master".to_string(),
                name: "Polyglot Master".to_string(),
                description: "Proficient in 10+ programming languages".to_string(),
                icon: "🌐".to_string(),
                category: "skill".to_string(),
                rarity: "epic".to_string(),
                earned_date: now,
            });
        } else if analysis.language_breakdown.len() >= 5 {
            badges.push(Badge {
                id: "polyglot_developer".to_string(),
                name: "Polyglot Developer".to_string(),
                description: "Proficient in 5+ programming languages".to_string(),
                icon: "🔤".to_string(),
                category: "skill".to_string(),
                rarity: "rare".to_string(),
                earned_date: now,
            });
        }

        // Social badges based on GitHub stats
        if followers >= 1000 {
            badges.push(Badge {
                id: "community_leader".to_string(),
                name: "Community Leader".to_string(),
                description: "Has 1000+ followers".to_string(),
                icon: "👥".to_string(),
                category: "social".to_string(),
                rarity: "legendary".to_string(),
                earned_date: now,
            });
        } else if followers >= 100 {
            badges.push(Badge {
                id: "community_builder".to_string(),
                name: "Community Builder".to_string(),
                description: "Has 100+ followers".to_string(),
                icon: "🤝".to_string(),
                category: "social".to_string(),
                rarity: "rare".to_string(),
                earned_date: now,
            });
        }

        // Years active badge
        if analysis.years_active >= 10.0 {
            badges.push(Badge {
                id: "veteran_developer".to_string(),
                name: "Veteran Developer".to_string(),
                description: "Active for 10+ years on GitHub".to_string(),
                icon: "🎖️".to_string(),
                category: "achievement".to_string(),
                rarity: "epic".to_string(),
                earned_date: now,
            });
        } else if analysis.years_active >= 5.0 {
            badges.push(Badge {
                id: "experienced_developer".to_string(),
                name: "Experienced Developer".to_string(),
                description: "Active for 5+ years on GitHub".to_string(),
                icon: "⭐".to_string(),
                category: "achievement".to_string(),
                rarity: "rare".to_string(),
                earned_date: now,
            });
        }

        // Web3 specialist badge
        if analysis.web3_expertise > 0.7 {
            badges.push(Badge {
                id: "web3_pioneer".to_string(),
                name: "Web3 Pioneer".to_string(),
                description: "High expertise in blockchain technologies".to_string(),
                icon: "🔗".to_string(),
                category: "skill".to_string(),
                rarity: "epic".to_string(),
                earned_date: now,
            });
        } else if analysis.web3_expertise > 0.4 {
            badges.push(Badge {
                id: "blockchain_developer".to_string(),
                name: "Blockchain Developer".to_string(),
                description: "Working with blockchain technologies".to_string(),
                icon: "⛓️".to_string(),
                category: "skill".to_string(),
                rarity: "rare".to_string(),
                earned_date: now,
            });
        }

        // Quality focused badge
        if iden_score.skill_categories.code_quality.score > 80.0 {
            badges.push(Badge {
                id: "quality_champion".to_string(),
                name: "Quality Champion".to_string(),
                description: "Exceptional code quality practices".to_string(),
                icon: "✨".to_string(),
                category: "skill".to_string(),
                rarity: "rare".to_string(),
                earned_date: now,
            });
        }

        badges
    }

    fn calculate_enhanced_github_stats(&self, analysis: &SkillAnalysis, followers: u32, following: u32) -> GitHubStats {
        let total_stars: u32 = analysis.repository_analysis.iter().map(|r| r.stars).sum();
        let total_forks: u32 = analysis.repository_analysis.iter().map(|r| r.forks).sum();
        
        // Calculate contribution streak (simplified)
        let contribution_streak = if analysis.years_active > 0.0 {
            (analysis.years_active * 365.0 / 4.0) as u32 // Rough estimate
        } else {
            0
        };

        GitHubStats {
            public_repos: analysis.total_repositories,
            followers,
            following,
            years_active: analysis.years_active,
            total_commits: self.estimate_total_commits(analysis),
            total_stars,
            total_forks,
            contribution_streak,
        }
    }
}