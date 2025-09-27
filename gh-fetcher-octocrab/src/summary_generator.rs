use crate::analyzer::{SkillAnalysis, RepositoryAnalysis};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeveloperSummary {
    pub primary_title: String,
    pub experience_level: ExperienceLevel,
    pub specializations: Vec<String>,
    pub key_strengths: Vec<String>,
    pub personality_traits: Vec<String>,
    pub professional_summary: String,
    pub elevator_pitch: String,
    pub achievement_highlights: Vec<String>,
    pub technology_focus: TechnologyFocus,
    pub work_style: WorkStyle,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ExperienceLevel {
    Junior,      // 0-2 years
    MidLevel,    // 2-5 years
    Senior,      // 5-8 years
    Lead,        // 8-12 years
    Principal,   // 12+ years
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TechnologyFocus {
    pub primary_stack: String,
    pub secondary_skills: Vec<String>,
    pub emerging_interests: Vec<String>,
    pub architecture_preference: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum WorkStyle {
    FullStack,
    Frontend,
    Backend,
    DevOps,
    DataScience,
    Mobile,
    GameDev,
    Security,
    Research,
    Product,
}

pub struct SummaryGenerator;

impl SummaryGenerator {
    pub fn new() -> Self {
        Self
    }

    /// Generate comprehensive developer summary from GitHub analysis
    pub fn generate_summary(&self, analysis: &SkillAnalysis) -> DeveloperSummary {
        let experience_level = self.determine_experience_level(analysis);
        let work_style = self.determine_work_style(analysis);
        let technology_focus = self.analyze_technology_focus(analysis);
        let specializations = self.extract_specializations(analysis);
        let key_strengths = self.identify_key_strengths(analysis);
        let personality_traits = self.infer_personality_traits(analysis);
        
        let primary_title = self.generate_primary_title(&work_style, &experience_level, &specializations);
        let professional_summary = self.generate_professional_summary(analysis, &experience_level, &key_strengths);
        let elevator_pitch = self.generate_elevator_pitch(analysis, &primary_title, &key_strengths);
        let achievement_highlights = self.extract_achievement_highlights(analysis);

        DeveloperSummary {
            primary_title,
            experience_level,
            specializations,
            key_strengths,
            personality_traits,
            professional_summary,
            elevator_pitch,
            achievement_highlights,
            technology_focus,
            work_style,
        }
    }

    fn determine_experience_level(&self, analysis: &SkillAnalysis) -> ExperienceLevel {
        let years = analysis.years_active;
        let repo_count = analysis.total_repositories;
        let overall_score = analysis.overall_score;
        
        // Weighted scoring considering multiple factors
        let experience_score = years * 0.4 + (repo_count as f64 * 0.1) + (overall_score * 0.01);
        
        match experience_score {
            s if s >= 10.0 => ExperienceLevel::Principal,
            s if s >= 7.0 => ExperienceLevel::Lead,
            s if s >= 4.5 => ExperienceLevel::Senior,
            s if s >= 2.0 => ExperienceLevel::MidLevel,
            _ => ExperienceLevel::Junior,
        }
    }

    fn determine_work_style(&self, analysis: &SkillAnalysis) -> WorkStyle {
        let mut scores = HashMap::new();
        
        // Analyze language patterns to determine work style
        for (lang, skill) in &analysis.language_breakdown {
            match lang.as_str() {
                "JavaScript" | "TypeScript" | "HTML" | "CSS" | "React" | "Vue" | "Angular" => {
                    *scores.entry("frontend").or_insert(0.0) += skill.score;
                }
                "Node.js" | "Python" | "Java" | "Go" | "Rust" | "C#" | "PHP" | "Ruby" => {
                    *scores.entry("backend").or_insert(0.0) += skill.score;
                }
                "Solidity" | "Move" | "Vyper" | "Cairo" => {
                    *scores.entry("blockchain").or_insert(0.0) += skill.score * 1.5; // Bonus for Web3
                }
                "Docker" | "Kubernetes" | "Terraform" | "Shell" => {
                    *scores.entry("devops").or_insert(0.0) += skill.score;
                }
                "Python" | "R" | "Julia" | "Scala" => {
                    *scores.entry("data").or_insert(0.0) += skill.score * 0.7;
                }
                "Swift" | "Kotlin" | "Flutter" | "Dart" => {
                    *scores.entry("mobile").or_insert(0.0) += skill.score;
                }
                _ => {}
            }
        }

        // Add repository-based signals
        for repo in &analysis.repository_analysis {
            if repo.is_web3_project {
                *scores.entry("blockchain").or_insert(0.0) += 10.0;
            }
        }

        // Determine primary work style
        let max_category = scores.iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(k, _)| k.as_str());

        let frontend_score = scores.get("frontend").unwrap_or(&0.0);
        let backend_score = scores.get("backend").unwrap_or(&0.0);
        
        match max_category {
            Some("blockchain") => WorkStyle::Backend, // Most blockchain devs are backend-focused
            Some("frontend") if backend_score > 50.0 => WorkStyle::FullStack,
            Some("frontend") => WorkStyle::Frontend,
            Some("backend") if frontend_score > 50.0 => WorkStyle::FullStack,
            Some("backend") => WorkStyle::Backend,
            Some("devops") => WorkStyle::DevOps,
            Some("data") => WorkStyle::DataScience,
            Some("mobile") => WorkStyle::Mobile,
            _ => {
                // Default logic based on language diversity
                if analysis.language_breakdown.len() >= 5 {
                    WorkStyle::FullStack
                } else {
                    WorkStyle::Backend
                }
            }
        }
    }

    fn analyze_technology_focus(&self, analysis: &SkillAnalysis) -> TechnologyFocus {
        let mut lang_scores: Vec<(&String, &f64)> = analysis.language_breakdown
            .iter()
            .map(|(lang, skill)| (lang, &skill.score))
            .collect();
        
        lang_scores.sort_by(|a, b| b.1.partial_cmp(a.1).unwrap_or(std::cmp::Ordering::Equal));

        let primary_stack = if let Some((lang, _)) = lang_scores.first() {
            self.get_stack_from_primary_language(lang)
        } else {
            "Full Stack Development".to_string()
        };

        let secondary_skills: Vec<String> = lang_scores
            .iter()
            .skip(1)
            .take(4)
            .map(|(lang, _)| (*lang).clone())
            .collect();

        let emerging_interests = self.detect_emerging_technologies(analysis);
        let architecture_preference = self.infer_architecture_preference(analysis);

        TechnologyFocus {
            primary_stack,
            secondary_skills,
            emerging_interests,
            architecture_preference,
        }
    }

    fn get_stack_from_primary_language(&self, language: &str) -> String {
        match language {
            "JavaScript" | "TypeScript" => "MEAN/MERN Stack".to_string(),
            "Python" => "Python Full Stack".to_string(),
            "Java" => "Java Enterprise".to_string(),
            "C#" => ".NET Stack".to_string(),
            "PHP" => "LAMP Stack".to_string(),
            "Ruby" => "Ruby on Rails".to_string(),
            "Go" => "Go Microservices".to_string(),
            "Rust" => "Systems Programming".to_string(),
            "Solidity" => "Web3/DeFi Development".to_string(),
            "Swift" => "iOS Development".to_string(),
            "Kotlin" => "Android Development".to_string(),
            _ => format!("{} Development", language),
        }
    }

    fn detect_emerging_technologies(&self, analysis: &SkillAnalysis) -> Vec<String> {
        let mut emerging = Vec::new();
        
        for (lang, skill) in &analysis.language_breakdown {
            // Check for newer/emerging technologies with decent project count
            match lang.as_str() {
                "Rust" if skill.project_count >= 2 => emerging.push("Rust".to_string()),
                "Go" if skill.project_count >= 2 => emerging.push("Go".to_string()),
                "Solidity" if skill.project_count >= 1 => emerging.push("Web3/Blockchain".to_string()),
                "Move" if skill.project_count >= 1 => emerging.push("Move/Sui".to_string()),
                "TypeScript" if skill.score > 70.0 => emerging.push("TypeScript".to_string()),
                "Dart" if skill.project_count >= 2 => emerging.push("Flutter".to_string()),
                _ => {}
            }
        }

        // Check for AI/ML patterns in repositories
        if analysis.repository_analysis.iter().any(|r| {
            r.name.to_lowercase().contains("ml") ||
            r.name.to_lowercase().contains("ai") ||
            r.description.as_ref().map_or(false, |d| 
                d.to_lowercase().contains("machine learning") ||
                d.to_lowercase().contains("artificial intelligence")
            )
        }) {
            emerging.push("AI/ML".to_string());
        }

        emerging
    }

    fn infer_architecture_preference(&self, analysis: &SkillAnalysis) -> String {
        let has_microservices = analysis.repository_analysis.iter().any(|r|
            r.description.as_ref().map_or(false, |d| 
                d.to_lowercase().contains("microservice") ||
                d.to_lowercase().contains("api")
            )
        );

        let has_monolith_patterns = analysis.repository_analysis.iter().any(|r|
            r.description.as_ref().map_or(false, |d| 
                d.to_lowercase().contains("full") ||
                d.to_lowercase().contains("complete")
            )
        );

        let has_serverless = analysis.language_breakdown.contains_key("AWS") ||
            analysis.repository_analysis.iter().any(|r|
                r.description.as_ref().map_or(false, |d| d.to_lowercase().contains("lambda"))
            );

        if has_microservices && analysis.total_repositories > 10 {
            "Microservices Architecture".to_string()
        } else if has_serverless {
            "Serverless Architecture".to_string()
        } else if has_monolith_patterns || analysis.total_repositories < 5 {
            "Monolithic Architecture".to_string()
        } else {
            "Modular Architecture".to_string()
        }
    }

    fn extract_specializations(&self, analysis: &SkillAnalysis) -> Vec<String> {
        let mut specializations = Vec::new();

        // From explicit specializations
        for spec in &analysis.specializations {
            specializations.push(spec.area.clone());
        }

        // Infer from high-scoring languages
        for (lang, skill) in &analysis.language_breakdown {
            if skill.score > 80.0 && skill.project_count >= 3 {
                match lang.as_str() {
                    "Solidity" => specializations.push("Smart Contract Development".to_string()),
                    "Rust" => specializations.push("Systems Programming".to_string()),
                    "Go" => specializations.push("Backend Services".to_string()),
                    "TypeScript" => specializations.push("Type-Safe Development".to_string()),
                    "Python" => {
                        // Check if it's data science focused
                        if analysis.repository_analysis.iter().any(|r| 
                            r.name.contains("data") || r.name.contains("ml") || r.name.contains("ai")
                        ) {
                            specializations.push("Data Science & ML".to_string());
                        } else {
                            specializations.push("Backend Development".to_string());
                        }
                    }
                    _ => {}
                }
            }
        }

        // Remove duplicates and limit
        specializations.sort();
        specializations.dedup();
        specializations.into_iter().take(3).collect()
    }

    fn identify_key_strengths(&self, analysis: &SkillAnalysis) -> Vec<String> {
        let mut strengths = Vec::new();

        // Technical strengths from scores
        if analysis.complexity_score > 75.0 {
            strengths.push("Complex Problem Solving".to_string());
        }
        if analysis.collaboration_score > 70.0 {
            strengths.push("Team Collaboration".to_string());
        }
        if analysis.consistency_score > 80.0 {
            strengths.push("Consistent Delivery".to_string());
        }
        if analysis.web3_expertise > 60.0 {
            strengths.push("Blockchain Technology".to_string());
        }
        if analysis.commit_quality_score > 75.0 {
            strengths.push("Code Quality & Documentation".to_string());
        }

        // Repository-based strengths
        if analysis.total_repositories > 20 {
            strengths.push("Prolific Open Source Contributor".to_string());
        }
        
        let avg_stars: f64 = analysis.repository_analysis.iter()
            .map(|r| r.stars as f64)
            .sum::<f64>() / analysis.repository_analysis.len().max(1) as f64;
        
        if avg_stars > 10.0 {
            strengths.push("Community Recognition".to_string());
        }

        if analysis.years_active > 5.0 {
            strengths.push("Experienced Professional".to_string());
        }

        if analysis.language_breakdown.len() > 5 {
            strengths.push("Polyglot Developer".to_string());
        }

        strengths.into_iter().take(4).collect()
    }

    fn infer_personality_traits(&self, analysis: &SkillAnalysis) -> Vec<String> {
        let mut traits = Vec::new();

        // Infer traits from GitHub behavior patterns
        if analysis.total_repositories > 15 {
            traits.push("Proactive".to_string());
        }

        if analysis.consistency_score > 80.0 {
            traits.push("Reliable".to_string());
        }

        if analysis.collaboration_score > 70.0 {
            traits.push("Collaborative".to_string());
        }

        let has_documentation = analysis.repository_analysis.iter()
            .any(|r| r.documentation_score > 70.0);
        if has_documentation {
            traits.push("Detail-oriented".to_string());
        }

        if analysis.complexity_score > 75.0 {
            traits.push("Analytical".to_string());
        }

        if analysis.language_breakdown.len() > 6 {
            traits.push("Adaptable".to_string());
        }

        if analysis.web3_expertise > 50.0 {
            traits.push("Innovation-focused".to_string());
        }

        traits.into_iter().take(3).collect()
    }

    fn generate_primary_title(&self, work_style: &WorkStyle, experience: &ExperienceLevel, specializations: &[String]) -> String {
        let experience_prefix = match experience {
            ExperienceLevel::Junior => "",
            ExperienceLevel::MidLevel => "",
            ExperienceLevel::Senior => "Senior ",
            ExperienceLevel::Lead => "Lead ",
            ExperienceLevel::Principal => "Principal ",
        };

        let base_title = match work_style {
            WorkStyle::FullStack => "Full Stack Developer",
            WorkStyle::Frontend => "Frontend Developer",
            WorkStyle::Backend => "Backend Developer",
            WorkStyle::DevOps => "DevOps Engineer",
            WorkStyle::DataScience => "Data Scientist",
            WorkStyle::Mobile => "Mobile Developer",
            WorkStyle::GameDev => "Game Developer",
            WorkStyle::Security => "Security Engineer",
            WorkStyle::Research => "Research Engineer",
            WorkStyle::Product => "Product Engineer",
        };

        // Add specialization if relevant
        if let Some(first_spec) = specializations.first() {
            if first_spec.contains("Web3") || first_spec.contains("Blockchain") {
                return format!("{}Web3 {}", experience_prefix, base_title);
            }
            if first_spec.contains("AI") || first_spec.contains("ML") {
                return format!("{}AI/ML {}", experience_prefix, "Engineer");
            }
        }

        format!("{}{}", experience_prefix, base_title)
    }

    fn generate_professional_summary(&self, analysis: &SkillAnalysis, experience: &ExperienceLevel, strengths: &[String]) -> String {
        let years = analysis.years_active.round() as u32;
        let experience_text = match experience {
            ExperienceLevel::Junior => format!("Emerging developer with {} year{} of experience", years, if years == 1 { "" } else { "s" }),
            ExperienceLevel::MidLevel => format!("Mid-level developer with {} years of hands-on experience", years),
            ExperienceLevel::Senior => format!("Senior developer with {} years of proven expertise", years),
            ExperienceLevel::Lead => format!("Lead developer with {} years of technical leadership experience", years),
            ExperienceLevel::Principal => format!("Principal engineer with {} years of architectural and technical excellence", years),
        };

        let top_languages: Vec<String> = analysis.language_breakdown
            .iter()
            .filter(|(_, skill)| skill.score > 60.0)
            .map(|(lang, _)| lang.clone())
            .take(3)
            .collect();

        let tech_focus = if !top_languages.is_empty() {
            format!(" Specialized in {}", top_languages.join(", "))
        } else {
            String::new()
        };

        let strengths_text = if !strengths.is_empty() {
            format!(". Known for {} and {}", 
                strengths[..strengths.len()-1].join(", "),
                strengths.last().unwrap())
        } else {
            String::new()
        };

        let repo_count = analysis.total_repositories;
        let project_text = if repo_count > 10 {
            format!(" with {} public projects demonstrating consistent contribution to open source", repo_count)
        } else if repo_count > 0 {
            format!(" with {} published projects", repo_count)
        } else {
            String::new()
        };

        format!("{}{}{}{}.{}", experience_text, tech_focus, project_text, 
                if analysis.web3_expertise > 50.0 { " Experienced in blockchain and Web3 technologies" } else { "" },
                strengths_text)
    }

    fn generate_elevator_pitch(&self, analysis: &SkillAnalysis, title: &str, strengths: &[String]) -> String {
        let unique_value = if analysis.web3_expertise > 70.0 {
            "I bridge traditional software development with cutting-edge blockchain technology"
        } else if analysis.complexity_score > 80.0 {
            "I excel at solving complex technical challenges with elegant solutions"
        } else if analysis.collaboration_score > 80.0 {
            "I build great software and even better teams"
        } else {
            "I create robust, scalable solutions that drive business value"
        };

        let impact = if analysis.total_repositories > 20 {
            format!("With {} open source projects, I've contributed to the developer ecosystem while delivering enterprise solutions", analysis.total_repositories)
        } else {
            "I focus on delivering high-quality solutions that exceed expectations".to_string()
        };

        format!("{} - {}. {}.{}", 
                title, unique_value, impact,
                if !strengths.is_empty() { 
                    format!(" My strengths in {} make me a valuable team asset", strengths.join(" and ")) 
                } else { 
                    String::new() 
                })
    }

    fn extract_achievement_highlights(&self, analysis: &SkillAnalysis) -> Vec<String> {
        let mut highlights = Vec::new();

        // Repository-based achievements
        if analysis.total_repositories > 50 {
            highlights.push(format!("Maintained {}+ open source projects", analysis.total_repositories));
        } else if analysis.total_repositories > 20 {
            highlights.push(format!("Published {} public repositories", analysis.total_repositories));
        }

        // Star-based achievements
        let total_stars: u32 = analysis.repository_analysis.iter().map(|r| r.stars).sum();
        if total_stars > 100 {
            highlights.push(format!("Earned {}+ GitHub stars across projects", total_stars));
        }

        // Language expertise
        let expert_languages: Vec<&String> = analysis.language_breakdown
            .iter()
            .filter(|(_, skill)| skill.score > 85.0)
            .map(|(lang, _)| lang)
            .collect();
        
        if expert_languages.len() > 2 {
            highlights.push(format!("Expert-level proficiency in {} languages", expert_languages.len()));
        }

        // Experience milestone
        if analysis.years_active > 8.0 {
            highlights.push(format!("{}+ years of software development experience", analysis.years_active.round() as u32));
        }

        // Web3 expertise
        if analysis.web3_expertise > 70.0 {
            highlights.push("Recognized Web3 and blockchain technology specialist".to_string());
        }

        // Quality metrics
        if analysis.commit_quality_score > 80.0 && analysis.consistency_score > 80.0 {
            highlights.push("Consistent track record of high-quality code delivery".to_string());
        }

        highlights.into_iter().take(4).collect()
    }
}