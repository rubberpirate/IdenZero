use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

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