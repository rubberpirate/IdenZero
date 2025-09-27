use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use sha2::{Sha256, Digest};
use crate::analyzer::SkillAnalysis;

/// IdenScore - A comprehensive, tamper-resistant skill evaluation system
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IdenScore {
    pub overall_score: f64,           // 0-1000 scale
    pub skill_categories: SkillCategories,
    pub growth_potential: GrowthPotential,
    pub verification_hash: String,    // Tamper-proof hash
    pub calculated_at: DateTime<Utc>,
    pub next_evaluation: DateTime<Utc>,
    pub confidence_level: f64,        // 0-100% how confident we are in this score
    pub skill_trajectory: SkillTrajectory,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillCategories {
    pub technical_mastery: CategoryScore,      // Programming languages, frameworks
    pub architecture_design: CategoryScore,   // System design, scalability
    pub code_quality: CategoryScore,          // Best practices, maintainability
    pub innovation: CategoryScore,            // Cutting-edge tech, creativity
    pub collaboration: CategoryScore,         // Team work, open source contributions
    pub domain_expertise: CategoryScore,      // Industry-specific knowledge
    pub leadership: CategoryScore,            // Mentoring, project management
    pub continuous_learning: CategoryScore,   // Adapting to new technologies
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryScore {
    pub score: f64,           // 0-100 for this category
    pub weight: f64,          // How important this category is (0-1)
    pub evidence_count: u32,  // Number of data points supporting this score
    pub confidence: f64,      // How confident we are (0-100)
    pub growth_indicators: Vec<String>, // What suggests growth potential
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GrowthPotential {
    pub overall_growth_score: f64,    // 0-100 potential for improvement
    pub priority_areas: Vec<GrowthArea>,
    pub estimated_timeline: EstimatedTimeline,
    pub recommended_actions: Vec<RecommendedAction>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GrowthArea {
    pub area: String,
    pub current_level: f64,    // 0-100
    pub target_level: f64,     // 0-100
    pub impact_potential: f64, // How much this could improve overall score
    pub difficulty: Difficulty,
    pub timeline_months: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Difficulty {
    Beginner,    // 1-3 months
    Intermediate, // 3-12 months
    Advanced,     // 12+ months
    Expert,       // 24+ months
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EstimatedTimeline {
    pub next_milestone: String,
    pub months_to_next_level: u32,
    pub years_to_expert: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecommendedAction {
    pub action: String,
    pub impact: f64,           // Expected score improvement
    pub effort_required: f64,  // 1-10 scale
    pub priority: Priority,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Priority {
    Critical,   // Do this immediately
    High,       // Next 3 months
    Medium,     // Next 6-12 months
    Low,        // Future consideration
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillTrajectory {
    pub trend: Trend,
    pub velocity: f64,         // Rate of skill improvement (points per month)
    pub acceleration: f64,     // Is the learning rate increasing?
    pub consistency: f64,      // How consistent is the growth (0-100)
    pub peak_performance_indicators: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Trend {
    RapidGrowth,      // >10% improvement per year
    SteadyGrowth,     // 5-10% improvement per year
    ModerateGrowth,   // 2-5% improvement per year
    SlowGrowth,       // <2% improvement per year
    Plateau,          // <1% improvement
    Declining,        // Negative trend
}

pub struct IdenScoreCalculator {
    weights: CategoryWeights,
}

#[derive(Debug, Clone)]
struct CategoryWeights {
    technical_mastery: f64,
    architecture_design: f64,
    code_quality: f64,
    innovation: f64,
    collaboration: f64,
    domain_expertise: f64,
    leadership: f64,
    continuous_learning: f64,
}

impl Default for CategoryWeights {
    fn default() -> Self {
        Self {
            technical_mastery: 0.20,      // 20% - Core programming skills
            architecture_design: 0.15,    // 15% - System design capabilities
            code_quality: 0.15,           // 15% - Best practices and maintainability
            innovation: 0.12,             // 12% - Cutting-edge technology adoption
            collaboration: 0.12,          // 12% - Teamwork and communication
            domain_expertise: 0.10,       // 10% - Industry-specific knowledge
            leadership: 0.08,             // 8% - Mentoring and project leadership
            continuous_learning: 0.08,    // 8% - Adaptation and growth mindset
        }
    }
}

impl IdenScoreCalculator {
    pub fn new() -> Self {
        Self {
            weights: CategoryWeights::default(),
        }
    }

    pub fn calculate_iden_score(&self, analysis: &SkillAnalysis) -> IdenScore {
        let skill_categories = self.calculate_skill_categories(analysis);
        let overall_score = self.calculate_weighted_score(&skill_categories);
        let growth_potential = self.calculate_growth_potential(analysis, &skill_categories);
        let skill_trajectory = self.calculate_skill_trajectory(analysis);
        let confidence_level = self.calculate_confidence_level(analysis, &skill_categories);
        
        let verification_data = format!(
            "{}|{}|{}|{}|{}",
            analysis.github_username,
            overall_score,
            analysis.analyzed_at.timestamp(),
            analysis.total_repositories,
            analysis.years_active
        );
        let verification_hash = self.generate_verification_hash(&verification_data);

        IdenScore {
            overall_score,
            skill_categories,
            growth_potential,
            verification_hash,
            calculated_at: Utc::now(),
            next_evaluation: Utc::now() + chrono::Duration::days(30), // Re-evaluate monthly
            confidence_level,
            skill_trajectory,
        }
    }

    fn calculate_skill_categories(&self, analysis: &SkillAnalysis) -> SkillCategories {
        SkillCategories {
            technical_mastery: self.calculate_technical_mastery(analysis),
            architecture_design: self.calculate_architecture_design(analysis),
            code_quality: self.calculate_code_quality(analysis),
            innovation: self.calculate_innovation(analysis),
            collaboration: self.calculate_collaboration(analysis),
            domain_expertise: self.calculate_domain_expertise(analysis),
            leadership: self.calculate_leadership(analysis),
            continuous_learning: self.calculate_continuous_learning(analysis),
        }
    }

    fn calculate_technical_mastery(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let mut score = 0.0;
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Language diversity and depth
        let language_count = analysis.language_breakdown.len() as f64;
        let language_diversity_score = (language_count / 10.0).min(1.0) * 25.0; // Max 25 points for diversity
        score += language_diversity_score;

        // Language proficiency depth
        let total_lines: u64 = analysis.language_breakdown.values().map(|l| l.lines_of_code).sum();
        let proficiency_score = (total_lines as f64 / 100000.0).min(1.0) * 25.0; // Max 25 points for code volume
        score += proficiency_score;

        // Modern technology adoption
        let modern_languages = ["Rust", "TypeScript", "Go", "Kotlin", "Swift", "Solidity"];
        let modern_count = analysis.language_breakdown.keys()
            .filter(|lang| modern_languages.contains(&lang.as_str()))
            .count();
        let modern_tech_score = (modern_count as f64 / 3.0).min(1.0) * 25.0; // Max 25 points for modern tech
        score += modern_tech_score;

        // Framework and ecosystem knowledge (inferred from project complexity)
        let complexity_score = analysis.complexity_score.min(1.0) * 25.0; // Max 25 points
        score += complexity_score;

        evidence_count += analysis.language_breakdown.len() as u32;
        evidence_count += analysis.total_repositories;

        if modern_count > 0 {
            growth_indicators.push("Uses modern programming languages".to_string());
        }
        if total_lines > 50000 {
            growth_indicators.push("High code output demonstrates experience".to_string());
        }
        if language_count > 5.0 {
            growth_indicators.push("Polyglot programmer with diverse skills".to_string());
        }

        CategoryScore {
            score: score.min(100.0), // Cap at 100
            weight: self.weights.technical_mastery,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_architecture_design(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let mut score = 0.0;
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Repository architecture quality
        let avg_arch_score = analysis.repository_analysis.iter()
            .map(|r| r.architecture_score)
            .sum::<f64>() / analysis.repository_analysis.len().max(1) as f64;
        score += avg_arch_score * 40.0; // Max 40 points

        // Project complexity and scale
        let large_projects = analysis.repository_analysis.iter()
            .filter(|r| r.stars > 10 || r.forks > 5)
            .count();
        let scale_score = (large_projects as f64 / 5.0).min(1.0) * 30.0; // Max 30 points
        score += scale_score;

        // Multi-language projects (indicates system design skills)
        let multi_lang_projects = analysis.repository_analysis.iter()
            .filter(|r| r.languages.len() > 2)
            .count();
        let integration_score = (multi_lang_projects as f64 / 3.0).min(1.0) * 30.0; // Max 30 points
        score += integration_score;

        evidence_count += analysis.repository_analysis.len() as u32;

        if avg_arch_score > 0.7 {
            growth_indicators.push("High architecture quality in projects".to_string());
        }
        if large_projects > 2 {
            growth_indicators.push("Experience with larger scale projects".to_string());
        }
        if multi_lang_projects > 1 {
            growth_indicators.push("Multi-technology integration experience".to_string());
        }

        CategoryScore {
            score: score.min(100.0), // Cap at 100
            weight: self.weights.architecture_design,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_code_quality(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let mut score = analysis.commit_quality_score; // Base score from analysis
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Documentation quality
        let avg_doc_score = analysis.repository_analysis.iter()
            .map(|r| r.documentation_score)
            .sum::<f64>() / analysis.repository_analysis.len().max(1) as f64;
        score += avg_doc_score * 30.0; // Max 30 additional points

        // Testing coverage
        let avg_testing = analysis.repository_analysis.iter()
            .map(|r| r.testing_coverage)
            .sum::<f64>() / analysis.repository_analysis.len().max(1) as f64;
        score += avg_testing * 30.0; // Max 30 additional points

        evidence_count += analysis.repository_analysis.len() as u32;

        if avg_doc_score > 0.7 {
            growth_indicators.push("Good documentation practices".to_string());
        }
        if avg_testing > 0.5 {
            growth_indicators.push("Testing-oriented development approach".to_string());
        }
        if analysis.consistency_score > 80.0 {
            growth_indicators.push("Consistent coding patterns".to_string());
        }

        CategoryScore {
            score: score.min(100.0),
            weight: self.weights.code_quality,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_innovation(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let mut score = 0.0;
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Web3 and blockchain innovation
        score += analysis.web3_expertise; // Max 100 points already

        // Use of cutting-edge languages and technologies
        let innovative_languages = ["Rust", "Solidity", "Move", "Cairo", "Vyper"];
        let innovation_count = analysis.language_breakdown.keys()
            .filter(|lang| innovative_languages.contains(&lang.as_str()))
            .count();
        
        if innovation_count > 0 {
            score = (score + (innovation_count as f64 * 20.0)).min(100.0);
            growth_indicators.push("Early adoption of cutting-edge technologies".to_string());
        }

        // Recent activity in emerging fields
        let recent_projects = analysis.repository_analysis.iter()
            .filter(|r| r.is_web3_project)
            .count();
        
        if recent_projects > 0 {
            growth_indicators.push("Active in emerging technology sectors".to_string());
        }

        evidence_count += innovation_count as u32;
        evidence_count += recent_projects as u32;

        CategoryScore {
            score: score.min(100.0),
            weight: self.weights.innovation,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_collaboration(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let score = analysis.collaboration_score; // Use existing collaboration score
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Fork and star indicators
        let total_stars: u32 = analysis.repository_analysis.iter().map(|r| r.stars).sum();
        let total_forks: u32 = analysis.repository_analysis.iter().map(|r| r.forks).sum();

        evidence_count += total_stars + total_forks;

        if total_stars > 50 {
            growth_indicators.push("Community recognition through stars".to_string());
        }
        if total_forks > 10 {
            growth_indicators.push("Code reuse and collaboration through forks".to_string());
        }
        if analysis.total_repositories > 20 {
            growth_indicators.push("Active contributor with many projects".to_string());
        }

        CategoryScore {
            score: score.min(100.0), // Cap at 100
            weight: self.weights.collaboration,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_domain_expertise(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let mut score = 0.0;
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Specialization strength
        if !analysis.specializations.is_empty() {
            let max_specialization = analysis.specializations.iter()
                .map(|s| s.confidence_score)
                .fold(0.0, f64::max);
            score += max_specialization; // Max 100 points

            evidence_count += analysis.specializations.len() as u32;
            growth_indicators.push(format!("Strong specialization in {}", 
                analysis.specializations[0].area));
        }

        CategoryScore {
            score: score.min(100.0), // Cap at 100
            weight: self.weights.domain_expertise,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_leadership(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let mut score = 0.0;
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Project ownership and maintenance
        let maintained_projects = analysis.repository_analysis.iter()
            .filter(|r| r.stars > 5 || r.forks > 2)
            .count();
        
        score += (maintained_projects as f64 / 5.0).min(1.0) * 50.0; // Max 50 points

        // Long-term commitment (years active)
        let experience_score = (analysis.years_active / 10.0).min(1.0) * 50.0; // Max 50 points
        score += experience_score;

        evidence_count += maintained_projects as u32;

        if maintained_projects > 2 {
            growth_indicators.push("Maintains multiple successful projects".to_string());
        }
        if analysis.years_active > 3.0 {
            growth_indicators.push("Long-term commitment to software development".to_string());
        }

        CategoryScore {
            score: score.min(100.0), // Cap at 100
            weight: self.weights.leadership,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_continuous_learning(&self, analysis: &SkillAnalysis) -> CategoryScore {
        let mut score = 0.0;
        let mut evidence_count = 0;
        let mut growth_indicators = Vec::new();

        // Language diversity as learning indicator
        let language_count = analysis.language_breakdown.len();
        score += (language_count as f64 / 8.0).min(1.0) * 40.0; // Max 40 points

        // Recent activity pattern
        let recent_projects = analysis.repository_analysis.iter()
            .filter(|r| {
                if let Some(updated) = r.updated_at {
                    let months_since_update = (Utc::now() - updated).num_days() / 30;
                    months_since_update < 6 // Updated in last 6 months
                } else {
                    false
                }
            })
            .count();

        let activity_score = (recent_projects as f64 / analysis.repository_analysis.len().max(1) as f64) * 60.0;
        score += activity_score; // Max 60 points

        evidence_count += language_count as u32;
        evidence_count += recent_projects as u32;

        if language_count > 5 {
            growth_indicators.push("Polyglot learning approach".to_string());
        }
        if recent_projects > 0 {
            growth_indicators.push("Recent activity shows ongoing learning".to_string());
        }

        CategoryScore {
            score: score.min(100.0), // Cap at 100
            weight: self.weights.continuous_learning,
            evidence_count,
            confidence: self.calculate_category_confidence(evidence_count, analysis.years_active),
            growth_indicators,
        }
    }

    fn calculate_weighted_score(&self, categories: &SkillCategories) -> f64 {
        // Ensure each category score is capped at 100 before weighting
        let capped_technical = categories.technical_mastery.score.min(100.0);
        let capped_architecture = categories.architecture_design.score.min(100.0);
        let capped_quality = categories.code_quality.score.min(100.0);
        let capped_innovation = categories.innovation.score.min(100.0);
        let capped_collaboration = categories.collaboration.score.min(100.0);
        let capped_domain = categories.domain_expertise.score.min(100.0);
        let capped_leadership = categories.leadership.score.min(100.0);
        let capped_learning = categories.continuous_learning.score.min(100.0);
        
        let weighted_sum = 
            capped_technical * categories.technical_mastery.weight +
            capped_architecture * categories.architecture_design.weight +
            capped_quality * categories.code_quality.weight +
            capped_innovation * categories.innovation.weight +
            capped_collaboration * categories.collaboration.weight +
            capped_domain * categories.domain_expertise.weight +
            capped_leadership * categories.leadership.weight +
            capped_learning * categories.continuous_learning.weight;

        // Scale to 1000-point system and cap at 1000
        (weighted_sum * 10.0).min(1000.0)
    }

    fn calculate_growth_potential(&self, analysis: &SkillAnalysis, categories: &SkillCategories) -> GrowthPotential {
        let mut priority_areas = Vec::new();

        // Identify areas with lowest scores as growth opportunities
        let category_scores = vec![
            ("Technical Mastery", categories.technical_mastery.score),
            ("Architecture Design", categories.architecture_design.score),
            ("Code Quality", categories.code_quality.score),
            ("Innovation", categories.innovation.score),
            ("Collaboration", categories.collaboration.score),
            ("Domain Expertise", categories.domain_expertise.score),
            ("Leadership", categories.leadership.score),
            ("Continuous Learning", categories.continuous_learning.score),
        ];

        let mut sorted_categories = category_scores.clone();
        sorted_categories.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap());

        // Create growth areas for the 3 lowest scoring categories
        for (area, current_score) in sorted_categories.iter().take(3) {
            let target_score = (current_score + 25.0).min(100.0);
            let impact_potential = (target_score - current_score) * 0.1; // 10% of improvement
            
            let difficulty = if *current_score < 30.0 {
                Difficulty::Beginner
            } else if *current_score < 60.0 {
                Difficulty::Intermediate
            } else if *current_score < 80.0 {
                Difficulty::Advanced
            } else {
                Difficulty::Expert
            };

            let timeline_months = match difficulty {
                Difficulty::Beginner => 3,
                Difficulty::Intermediate => 6,
                Difficulty::Advanced => 12,
                Difficulty::Expert => 24,
            };

            priority_areas.push(GrowthArea {
                area: area.to_string(),
                current_level: *current_score,
                target_level: target_score,
                impact_potential,
                difficulty,
                timeline_months,
            });
        }

        let overall_growth_score = self.calculate_overall_growth_potential(analysis, categories);
        
        let recommended_actions = self.generate_recommended_actions(analysis, categories);

        let estimated_timeline = EstimatedTimeline {
            next_milestone: "Improve lowest scoring skill category".to_string(),
            months_to_next_level: 6,
            years_to_expert: (1000.0 - self.calculate_weighted_score(categories)) / 100.0, // Rough estimate
        };

        GrowthPotential {
            overall_growth_score,
            priority_areas,
            estimated_timeline,
            recommended_actions,
        }
    }

    fn calculate_overall_growth_potential(&self, analysis: &SkillAnalysis, categories: &SkillCategories) -> f64 {
        let mut growth_score: f64 = 0.0;

        // Young developers have more growth potential
        if analysis.years_active < 5.0 {
            growth_score += 30.0;
        } else if analysis.years_active < 10.0 {
            growth_score += 20.0;
        } else {
            growth_score += 10.0;
        }

        // Low scores in key areas = high growth potential
        let avg_score = (categories.technical_mastery.score + categories.code_quality.score + 
                        categories.innovation.score) / 3.0;
        if avg_score < 50.0 {
            growth_score += 40.0;
        } else if avg_score < 70.0 {
            growth_score += 25.0;
        } else {
            growth_score += 10.0;
        }

        // Recent activity suggests growth mindset
        if analysis.repository_analysis.iter().any(|r| {
            r.updated_at.map_or(false, |u| (Utc::now() - u).num_days() < 90)
        }) {
            growth_score += 20.0;
        }

        // Language diversity suggests learning ability
        if analysis.language_breakdown.len() > 5 {
            growth_score += 10.0;
        }

        growth_score.min(100.0)
    }

    fn generate_recommended_actions(&self, analysis: &SkillAnalysis, categories: &SkillCategories) -> Vec<RecommendedAction> {
        let mut actions = Vec::new();

        // Technical mastery recommendations
        if categories.technical_mastery.score < 60.0 {
            actions.push(RecommendedAction {
                action: "Learn a modern programming language (Rust, Go, or TypeScript)".to_string(),
                impact: 15.0,
                effort_required: 7.0,
                priority: Priority::High,
            });
        }

        // Code quality recommendations
        if categories.code_quality.score < 60.0 {
            actions.push(RecommendedAction {
                action: "Implement comprehensive testing in your projects".to_string(),
                impact: 12.0,
                effort_required: 5.0,
                priority: Priority::High,
            });
        }

        // Innovation recommendations
        if categories.innovation.score < 40.0 {
            actions.push(RecommendedAction {
                action: "Explore Web3/blockchain technologies or AI/ML".to_string(),
                impact: 20.0,
                effort_required: 8.0,
                priority: Priority::Medium,
            });
        }

        // Collaboration recommendations
        if categories.collaboration.score < 50.0 {
            actions.push(RecommendedAction {
                action: "Contribute to open source projects and engage with developer community".to_string(),
                impact: 10.0,
                effort_required: 4.0,
                priority: Priority::High,
            });
        }

        // Leadership recommendations
        if categories.leadership.score < 40.0 && analysis.years_active > 2.0 {
            actions.push(RecommendedAction {
                action: "Start mentoring junior developers or leading team projects".to_string(),
                impact: 18.0,
                effort_required: 6.0,
                priority: Priority::Medium,
            });
        }

        actions
    }

    fn calculate_skill_trajectory(&self, analysis: &SkillAnalysis) -> SkillTrajectory {
        // This is a simplified implementation - in practice, you'd want historical data
        let trend = if analysis.years_active < 2.0 {
            Trend::RapidGrowth
        } else if analysis.overall_score > 75.0 {
            Trend::SteadyGrowth
        } else if analysis.overall_score > 50.0 {
            Trend::ModerateGrowth
        } else {
            Trend::SlowGrowth
        };

        let velocity = match trend {
            Trend::RapidGrowth => 8.0,
            Trend::SteadyGrowth => 5.0,
            Trend::ModerateGrowth => 3.0,
            Trend::SlowGrowth => 1.0,
            Trend::Plateau => 0.5,
            Trend::Declining => -1.0,
        };

        let consistency = analysis.consistency_score;

        let mut peak_performance_indicators = Vec::new();
        if analysis.overall_score > 80.0 {
            peak_performance_indicators.push("High overall skill score".to_string());
        }
        if analysis.language_breakdown.len() > 8 {
            peak_performance_indicators.push("Mastery of multiple technologies".to_string());
        }

        SkillTrajectory {
            trend,
            velocity,
            acceleration: 0.0, // Would need historical data
            consistency,
            peak_performance_indicators,
        }
    }

    fn calculate_confidence_level(&self, analysis: &SkillAnalysis, categories: &SkillCategories) -> f64 {
        let total_evidence = categories.technical_mastery.evidence_count +
                           categories.architecture_design.evidence_count +
                           categories.code_quality.evidence_count +
                           categories.collaboration.evidence_count;

        let data_richness = (total_evidence as f64 / 50.0).min(1.0) * 40.0; // Max 40 points
        let time_factor = (analysis.years_active / 5.0).min(1.0) * 30.0; // Max 30 points
        let repository_factor = (analysis.total_repositories as f64 / 20.0).min(1.0) * 30.0; // Max 30 points

        data_richness + time_factor + repository_factor
    }

    fn calculate_category_confidence(&self, evidence_count: u32, years_active: f64) -> f64 {
        let evidence_factor = (evidence_count as f64 / 10.0).min(1.0) * 60.0;
        let time_factor = (years_active / 5.0).min(1.0) * 40.0;
        evidence_factor + time_factor
    }

    fn generate_verification_hash(&self, data: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}

impl IdenScore {
    /// Verify that the score hasn't been tampered with
    pub fn verify_integrity(&self, original_analysis: &SkillAnalysis) -> bool {
        let verification_data = format!(
            "{}|{}|{}|{}|{}",
            original_analysis.github_username,
            self.overall_score,
            original_analysis.analyzed_at.timestamp(),
            original_analysis.total_repositories,
            original_analysis.years_active
        );
        
        let mut hasher = Sha256::new();
        hasher.update(verification_data.as_bytes());
        let expected_hash = format!("{:x}", hasher.finalize());
        
        self.verification_hash == expected_hash
    }

    /// Get a human-readable skill level
    pub fn get_skill_level(&self) -> &'static str {
        match self.overall_score {
            s if s >= 900.0 => "Expert",
            s if s >= 750.0 => "Senior",
            s if s >= 600.0 => "Mid-Level",
            s if s >= 400.0 => "Junior",
            s if s >= 200.0 => "Beginner",
            _ => "Novice",
        }
    }

    /// Get next milestone target
    pub fn get_next_milestone(&self) -> f64 {
        match self.overall_score {
            s if s < 200.0 => 200.0,
            s if s < 400.0 => 400.0,
            s if s < 600.0 => 600.0,
            s if s < 750.0 => 750.0,
            s if s < 900.0 => 900.0,
            _ => 1000.0,
        }
    }
}