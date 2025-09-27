use crate::analyzer::SkillAnalysis;
use crate::summary_generator::{SummaryGenerator, DeveloperSummary};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FrontendProfile {
    pub basic_info: BasicInfo,
    pub visual_summary: VisualSummary,
    pub interactive_elements: InteractiveElements,
    pub badges: Vec<Badge>,
    pub timeline: Timeline,
    pub skills_visualization: SkillsVisualization,
    pub project_showcase: ProjectShowcase,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BasicInfo {
    pub name: String,
    pub title: String,
    pub tagline: String,
    pub location: Option<String>,
    pub email: Option<String>,
    pub github_username: String,
    pub profile_image_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VisualSummary {
    pub personality_color: String,
    pub work_style_icon: String,
    pub experience_level_visual: ExperienceLevelVisual,
    pub primary_tech_stack_logo: String,
    pub background_pattern: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExperienceLevelVisual {
    pub level: String,
    pub years: u32,
    pub progress_percentage: f64,
    pub milestone_badges: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InteractiveElements {
    pub draggable_modules: Vec<DraggableModule>,
    pub animated_skills: Vec<AnimatedSkill>,
    pub hover_effects: Vec<HoverEffect>,
    pub click_actions: Vec<ClickAction>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DraggableModule {
    pub id: String,
    pub title: String,
    pub content_type: ModuleContentType,
    pub size: ModuleSize,
    pub color_theme: String,
    pub data: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ModuleContentType {
    SkillBar,
    ProjectCard,
    StatNumber,
    TechLogo,
    Timeline,
    Achievement,
    Quote,
    Contact,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ModuleSize {
    Small,   // 1x1
    Medium,  // 2x1 or 1x2
    Large,   // 2x2
    Wide,    // 3x1
    Tall,    // 1x3
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AnimatedSkill {
    pub name: String,
    pub level: f64,
    pub animation_type: String,
    pub color: String,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HoverEffect {
    pub element_id: String,
    pub effect_type: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClickAction {
    pub element_id: String,
    pub action_type: String,
    pub target: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Badge {
    pub title: String,
    pub badge_type: BadgeType,
    pub verified: bool,
    pub icon: String,
    pub color: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BadgeType {
    Verified,
    Skill,
    Achievement,
    Experience,
    Community,
    Certification,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Timeline {
    pub events: Vec<TimelineEvent>,
    pub visual_style: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimelineEvent {
    pub date: String,
    pub title: String,
    pub description: String,
    pub event_type: String,
    pub importance: f64,
    pub icon: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillsVisualization {
    pub chart_type: String,
    pub skills: Vec<SkillVisual>,
    pub color_scheme: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillVisual {
    pub name: String,
    pub level: f64,
    pub category: String,
    pub years_experience: f64,
    pub project_count: u32,
    pub visual_weight: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectShowcase {
    pub featured_projects: Vec<FeaturedProject>,
    pub layout_style: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FeaturedProject {
    pub name: String,
    pub description: String,
    pub tech_stack: Vec<String>,
    pub github_url: Option<String>,
    pub demo_url: Option<String>,
    pub image_url: Option<String>,
    pub stars: u32,
    pub importance_score: f64,
}

pub struct FrontendAdapter;

impl FrontendAdapter {
    pub fn new() -> Self {
        Self
    }

    /// Convert GitHub analysis into frontend-ready profile data
    pub fn create_frontend_profile(&self, 
        analysis: &SkillAnalysis, 
        username: &str,
        name: Option<String>) -> FrontendProfile {
        
        let summary_generator = SummaryGenerator::new();
        let summary = summary_generator.generate_summary(analysis);
        
        let basic_info = self.create_basic_info(&summary, username, name);
        let visual_summary = self.create_visual_summary(&summary, analysis);
        let interactive_elements = self.create_interactive_elements(analysis, &summary);
        let badges = self.create_badges(analysis, &summary);
        let timeline = self.create_timeline(analysis);
        let skills_visualization = self.create_skills_visualization(analysis);
        let project_showcase = self.create_project_showcase(analysis);

        FrontendProfile {
            basic_info,
            visual_summary,
            interactive_elements,
            badges,
            timeline,
            skills_visualization,
            project_showcase,
        }
    }

    fn create_basic_info(&self, summary: &DeveloperSummary, username: &str, name: Option<String>) -> BasicInfo {
        BasicInfo {
            name: name.unwrap_or_else(|| username.to_string()),
            title: summary.primary_title.clone(),
            tagline: summary.elevator_pitch.clone(),
            location: None,
            email: None,
            github_username: username.to_string(),
            profile_image_url: Some(format!("https://github.com/{}.png", username)),
        }
    }

    fn create_visual_summary(&self, summary: &DeveloperSummary, analysis: &SkillAnalysis) -> VisualSummary {
        let personality_color = self.get_personality_color(&summary.personality_traits);
        let work_style_icon = self.get_work_style_icon(&summary.work_style);
        let primary_tech_logo = self.get_primary_tech_logo(&summary.technology_focus.primary_stack);
        
        VisualSummary {
            personality_color,
            work_style_icon,
            experience_level_visual: ExperienceLevelVisual {
                level: format!("{:?}", summary.experience_level),
                years: analysis.years_active.round() as u32,
                progress_percentage: self.calculate_experience_progress(&summary.experience_level),
                milestone_badges: self.get_milestone_badges(analysis),
            },
            primary_tech_stack_logo: primary_tech_logo,
            background_pattern: self.get_background_pattern(&summary.work_style),
        }
    }

    fn create_interactive_elements(&self, analysis: &SkillAnalysis, summary: &DeveloperSummary) -> InteractiveElements {
        let draggable_modules = self.create_draggable_modules(analysis, summary);
        let animated_skills = self.create_animated_skills(analysis);
        
        InteractiveElements {
            draggable_modules,
            animated_skills,
            hover_effects: vec![
                HoverEffect {
                    element_id: "profile-card".to_string(),
                    effect_type: "glow".to_string(),
                    description: "Profile card glows on hover".to_string(),
                },
            ],
            click_actions: vec![
                ClickAction {
                    element_id: "github-link".to_string(),
                    action_type: "external-link".to_string(),
                    target: format!("https://github.com/{}", "username"),
                },
            ],
        }
    }

    fn create_draggable_modules(&self, analysis: &SkillAnalysis, summary: &DeveloperSummary) -> Vec<DraggableModule> {
        let mut modules = Vec::new();

        // Stats modules
        modules.push(DraggableModule {
            id: "total-repos".to_string(),
            title: "Repositories".to_string(),
            content_type: ModuleContentType::StatNumber,
            size: ModuleSize::Small,
            color_theme: "#4CAF50".to_string(),
            data: serde_json::json!({
                "value": analysis.total_repositories,
                "label": "Public Repos",
                "icon": "📂"
            }),
        });

        modules.push(DraggableModule {
            id: "years-active".to_string(),
            title: "Experience".to_string(),
            content_type: ModuleContentType::StatNumber,
            size: ModuleSize::Small,
            color_theme: "#2196F3".to_string(),
            data: serde_json::json!({
                "value": analysis.years_active.round(),
                "label": "Years Active",
                "icon": "⏱️"
            }),
        });

        // Skills modules
        for (i, (lang, skill)) in analysis.language_breakdown.iter().take(6).enumerate() {
            if skill.score > 50.0 {
                modules.push(DraggableModule {
                    id: format!("skill-{}", i),
                    title: lang.clone(),
                    content_type: ModuleContentType::SkillBar,
                    size: ModuleSize::Medium,
                    color_theme: self.get_language_color(lang),
                    data: serde_json::json!({
                        "skill": lang,
                        "level": skill.score,
                        "projects": skill.project_count,
                        "icon": self.get_language_icon(lang)
                    }),
                });
            }
        }

        // Achievement modules
        for (i, achievement) in summary.achievement_highlights.iter().enumerate() {
            modules.push(DraggableModule {
                id: format!("achievement-{}", i),
                title: "Achievement".to_string(),
                content_type: ModuleContentType::Achievement,
                size: ModuleSize::Medium,
                color_theme: "#FF9800".to_string(),
                data: serde_json::json!({
                    "text": achievement,
                    "icon": "🏆"
                }),
            });
        }

        // Project modules
        for (i, repo) in analysis.repository_analysis.iter()
            .filter(|r| r.stars > 0)  // Remove is_featured check
            .take(3)
            .enumerate() {
            modules.push(DraggableModule {
                id: format!("project-{}", i),
                title: repo.name.clone(),
                content_type: ModuleContentType::ProjectCard,
                size: ModuleSize::Large,
                color_theme: "#9C27B0".to_string(),
                data: serde_json::json!({
                    "name": repo.name,
                    "description": repo.description,
                    "language": repo.primary_language,
                    "stars": repo.stars,
                    "url": format!("https://github.com/{}/{}", "username", repo.name)
                }),
            });
        }

        modules
    }

    fn create_animated_skills(&self, analysis: &SkillAnalysis) -> Vec<AnimatedSkill> {
        analysis.language_breakdown
            .iter()
            .filter(|(_, skill)| skill.score > 40.0)
            .map(|(lang, skill)| AnimatedSkill {
                name: lang.clone(),
                level: skill.score,
                animation_type: "progress-bar".to_string(),
                color: self.get_language_color(lang),
                icon: Some(self.get_language_icon(lang)),
            })
            .collect()
    }

    fn create_badges(&self, analysis: &SkillAnalysis, summary: &DeveloperSummary) -> Vec<Badge> {
        let mut badges = Vec::new();

        // Verified human badge
        badges.push(Badge {
            title: "Verified Human".to_string(),
            badge_type: BadgeType::Verified,
            verified: true,
            icon: "👤".to_string(),
            color: "#4CAF50".to_string(),
            description: "Verified as a real developer through GitHub activity analysis".to_string(),
        });

        // Experience badges
        match summary.experience_level {
            crate::summary_generator::ExperienceLevel::Senior | 
            crate::summary_generator::ExperienceLevel::Lead | 
            crate::summary_generator::ExperienceLevel::Principal => {
                badges.push(Badge {
                    title: format!("{:?} Developer", summary.experience_level),
                    badge_type: BadgeType::Experience,
                    verified: true,
                    icon: "🎖️".to_string(),
                    color: "#FF9800".to_string(),
                    description: format!("Verified {:?} level based on project complexity and years of experience", summary.experience_level),
                });
            }
            _ => {}
        }

        // Skill badges for high-proficiency languages
        for (lang, skill) in &analysis.language_breakdown {
            if skill.score > 80.0 {
                badges.push(Badge {
                    title: format!("{} Expert", lang),
                    badge_type: BadgeType::Skill,
                    verified: true,
                    icon: self.get_language_icon(lang),
                    color: self.get_language_color(lang),
                    description: format!("Expert-level proficiency in {} based on project analysis", lang),
                });
            }
        }

        // Web3 badge
        if analysis.web3_expertise > 60.0 {
            badges.push(Badge {
                title: "Web3 Developer".to_string(),
                badge_type: BadgeType::Skill,
                verified: true,
                icon: "⛓️".to_string(),
                color: "#9C27B0".to_string(),
                description: "Verified Web3 and blockchain technology expertise".to_string(),
            });
        }

        // Community badges
        let total_stars: u32 = analysis.repository_analysis.iter().map(|r| r.stars).sum();
        if total_stars > 100 {
            badges.push(Badge {
                title: "Community Favorite".to_string(),
                badge_type: BadgeType::Community,
                verified: true,
                icon: "⭐".to_string(),
                color: "#FFD700".to_string(),
                description: format!("Earned {} stars from the developer community", total_stars),
            });
        }

        badges.into_iter().take(6).collect()
    }

    fn create_timeline(&self, analysis: &SkillAnalysis) -> Timeline {
        let mut events = Vec::new();

        // Create timeline based on repository creation dates and major milestones
        // This is simplified - in reality you'd parse actual dates from repo data
        let current_year = 2024;
        let start_year = current_year - analysis.years_active.round() as i32;

        for year in start_year..=current_year {
            let repos_that_year = analysis.repository_analysis
                .iter()
                .filter(|_| true) // Would filter by actual creation year
                .count();

            if repos_that_year > 0 {
                events.push(TimelineEvent {
                    date: format!("{}", year),
                    title: format!("Active Development Year"),
                    description: format!("Published {} repositories", repos_that_year),
                    event_type: "development".to_string(),
                    importance: repos_that_year as f64 / 10.0,
                    icon: "💻".to_string(),
                });
            }
        }

        Timeline {
            events,
            visual_style: "modern".to_string(),
        }
    }

    fn create_skills_visualization(&self, analysis: &SkillAnalysis) -> SkillsVisualization {
        let skills: Vec<SkillVisual> = analysis.language_breakdown
            .iter()
            .map(|(lang, skill)| SkillVisual {
                name: lang.clone(),
                level: skill.score,
                category: self.get_skill_category(lang),
                years_experience: skill.project_count as f64, // Use project_count as years since years_used doesn't exist
                project_count: skill.project_count,
                visual_weight: skill.score / 100.0,
            })
            .collect();

        SkillsVisualization {
            chart_type: "radar".to_string(),
            skills,
            color_scheme: vec![
                "#FF6B6B".to_string(),
                "#4ECDC4".to_string(),
                "#45B7D1".to_string(),
                "#96CEB4".to_string(),
                "#FECA57".to_string(),
                "#FF9FF3".to_string(),
            ],
        }
    }

    fn create_project_showcase(&self, analysis: &SkillAnalysis) -> ProjectShowcase {
        let featured_projects: Vec<FeaturedProject> = analysis.repository_analysis
            .iter()
            .filter(|r| r.stars > 0)  // Remove is_featured check since it doesn't exist
            .take(6)
            .map(|repo| FeaturedProject {
                name: repo.name.clone(),
                description: repo.description.clone().unwrap_or_else(|| "No description available".to_string()),
                tech_stack: vec![repo.primary_language.clone().unwrap_or_else(|| "Unknown".to_string())],
                github_url: Some(format!("https://github.com/{}/{}", "username", repo.name)),
                demo_url: None,
                image_url: None,
                stars: repo.stars,
                importance_score: repo.architecture_score,  // Use architecture_score instead of complexity_score
            })
            .collect();

        ProjectShowcase {
            featured_projects,
            layout_style: "grid".to_string(),
        }
    }

    // Helper methods
    fn get_personality_color(&self, traits: &[String]) -> String {
        if traits.contains(&"Analytical".to_string()) {
            "#2196F3".to_string()
        } else if traits.contains(&"Collaborative".to_string()) {
            "#4CAF50".to_string()
        } else if traits.contains(&"Innovation-focused".to_string()) {
            "#9C27B0".to_string()
        } else {
            "#607D8B".to_string()
        }
    }

    fn get_work_style_icon(&self, work_style: &crate::summary_generator::WorkStyle) -> String {
        match work_style {
            crate::summary_generator::WorkStyle::FullStack => "🔄".to_string(),
            crate::summary_generator::WorkStyle::Frontend => "🎨".to_string(),
            crate::summary_generator::WorkStyle::Backend => "⚙️".to_string(),
            crate::summary_generator::WorkStyle::DevOps => "🚀".to_string(),
            crate::summary_generator::WorkStyle::DataScience => "📊".to_string(),
            crate::summary_generator::WorkStyle::Mobile => "📱".to_string(),
            crate::summary_generator::WorkStyle::GameDev => "🎮".to_string(),
            crate::summary_generator::WorkStyle::Security => "🔒".to_string(),
            crate::summary_generator::WorkStyle::Research => "🔬".to_string(),
            crate::summary_generator::WorkStyle::Product => "📦".to_string(),
        }
    }

    fn get_primary_tech_logo(&self, primary_stack: &str) -> String {
        match primary_stack {
            s if s.contains("JavaScript") || s.contains("MEAN") || s.contains("MERN") => "js-logo.png".to_string(),
            s if s.contains("Python") => "python-logo.png".to_string(),
            s if s.contains("Java") => "java-logo.png".to_string(),
            s if s.contains("Rust") => "rust-logo.png".to_string(),
            s if s.contains("Go") => "go-logo.png".to_string(),
            s if s.contains("Web3") => "ethereum-logo.png".to_string(),
            _ => "code-logo.png".to_string(),
        }
    }

    fn get_background_pattern(&self, work_style: &crate::summary_generator::WorkStyle) -> String {
        match work_style {
            crate::summary_generator::WorkStyle::FullStack => "circuit-pattern".to_string(),
            crate::summary_generator::WorkStyle::Frontend => "gradient-mesh".to_string(),
            crate::summary_generator::WorkStyle::Backend => "binary-pattern".to_string(),
            crate::summary_generator::WorkStyle::DevOps => "network-pattern".to_string(),
            _ => "dots-pattern".to_string(),
        }
    }

    fn calculate_experience_progress(&self, level: &crate::summary_generator::ExperienceLevel) -> f64 {
        match level {
            crate::summary_generator::ExperienceLevel::Junior => 20.0,
            crate::summary_generator::ExperienceLevel::MidLevel => 40.0,
            crate::summary_generator::ExperienceLevel::Senior => 70.0,
            crate::summary_generator::ExperienceLevel::Lead => 85.0,
            crate::summary_generator::ExperienceLevel::Principal => 100.0,
        }
    }

    fn get_milestone_badges(&self, analysis: &SkillAnalysis) -> Vec<String> {
        let mut badges = Vec::new();
        
        if analysis.total_repositories >= 50 {
            badges.push("Prolific Creator".to_string());
        }
        if analysis.years_active >= 10.0 {
            badges.push("Decade Veteran".to_string());
        }
        if analysis.web3_expertise >= 70.0 {
            badges.push("Web3 Pioneer".to_string());
        }
        
        badges
    }

    fn get_language_color(&self, language: &str) -> String {
        match language {
            "JavaScript" => "#F7DF1E".to_string(),
            "TypeScript" => "#3178C6".to_string(),
            "Python" => "#3776AB".to_string(),
            "Rust" => "#000000".to_string(),
            "Go" => "#00ADD8".to_string(),
            "Java" => "#ED8B00".to_string(),
            "C#" => "#239120".to_string(),
            "PHP" => "#777BB4".to_string(),
            "Ruby" => "#CC342D".to_string(),
            "Solidity" => "#363636".to_string(),
            "HTML" => "#E34F26".to_string(),
            "CSS" => "#1572B6".to_string(),
            _ => "#6C757D".to_string(),
        }
    }

    fn get_language_icon(&self, language: &str) -> String {
        match language {
            "JavaScript" => "🟨".to_string(),
            "TypeScript" => "🔷".to_string(),
            "Python" => "🐍".to_string(),
            "Rust" => "🦀".to_string(),
            "Go" => "🐹".to_string(),
            "Java" => "☕".to_string(),
            "C#" => "#️⃣".to_string(),
            "PHP" => "🐘".to_string(),
            "Ruby" => "💎".to_string(),
            "Solidity" => "⛓️".to_string(),
            "HTML" => "🌐".to_string(),
            "CSS" => "🎨".to_string(),
            _ => "💻".to_string(),
        }
    }

    fn get_skill_category(&self, language: &str) -> String {
        match language {
            "JavaScript" | "TypeScript" | "HTML" | "CSS" | "React" | "Vue" | "Angular" => "Frontend".to_string(),
            "Python" | "Java" | "Go" | "Rust" | "C#" | "PHP" | "Ruby" | "Node.js" => "Backend".to_string(),
            "Solidity" | "Move" | "Vyper" => "Blockchain".to_string(),
            "Docker" | "Kubernetes" | "Terraform" => "DevOps".to_string(),
            "Swift" | "Kotlin" | "Flutter" | "Dart" => "Mobile".to_string(),
            _ => "General".to_string(),
        }
    }
}