use trusthire_skill_analyzer::{SkillAnalysis, LanguageSkill, TechnologySkill, Specialization};
use chrono::Utc;
use std::collections::HashMap;

fn main() {
    println!("🎯 TrustHire Skill Analyzer - Demo");
    println!("===================================");

    let demo_analysis = create_demo_analysis();
    display_analysis(&demo_analysis);
}

fn create_demo_analysis() -> SkillAnalysis {
    // Create sample language skills
    let mut language_breakdown = HashMap::new();
    
    language_breakdown.insert("Rust".to_string(), LanguageSkill {
        language: "Rust".to_string(),
        proficiency_score: 85.3,
        lines_of_code: 45000,
        commit_count: 89,
        project_count: 4,
    });
    
    language_breakdown.insert("TypeScript".to_string(), LanguageSkill {
        language: "TypeScript".to_string(),
        proficiency_score: 78.1,
        lines_of_code: 32000,
        commit_count: 67,
        project_count: 3,
    });
    
    language_breakdown.insert("Python".to_string(), LanguageSkill {
        language: "Python".to_string(),
        proficiency_score: 82.7,
        lines_of_code: 28000,
        commit_count: 45,
        project_count: 5,
    });

    // Create sample technology skills
    let mut technology_breakdown = HashMap::new();
    
    technology_breakdown.insert("React".to_string(), TechnologySkill {
        technology: "React".to_string(),
        usage_count: 3,
        project_count: 3,
        proficiency_score: 75.0,
        recent_usage: true,
    });
    
    technology_breakdown.insert("Docker".to_string(), TechnologySkill {
        technology: "Docker".to_string(),
        usage_count: 4,
        project_count: 4,
        proficiency_score: 80.0,
        recent_usage: true,
    });
    
    technology_breakdown.insert("Machine Learning".to_string(), TechnologySkill {
        technology: "Machine Learning".to_string(),
        usage_count: 2,
        project_count: 2,
        proficiency_score: 65.0,
        recent_usage: true,
    });

    // Create sample specializations
    let specializations = vec![
        Specialization {
            area: "Web Development".to_string(),
            confidence_score: 78.5,
            supporting_projects: vec!["web-portfolio".to_string(), "e-commerce-app".to_string()],
            key_technologies: vec!["React".to_string(), "TypeScript".to_string()],
        },
        Specialization {
            area: "Systems Programming".to_string(),
            confidence_score: 85.2,
            supporting_projects: vec!["blockchain-node".to_string(), "crypto-wallet".to_string()],
            key_technologies: vec!["Rust".to_string()],
        },
    ];

    SkillAnalysis {
        username: "demo-developer".to_string(),
        overall_score: 83.4,
        language_breakdown,
        technology_breakdown,
        specializations,
        years_active: 3.2,
        total_repositories: 12,
        code_quality_score: 76.8,
        project_quality_score: 81.2,
        innovation_score: 79.5,
        analysis_timestamp: Utc::now(),
    }
}

fn display_analysis(analysis: &SkillAnalysis) {
    println!("📊 Analysis Results");
    println!("==================");
    println!("👤 User: {}", analysis.username);
    println!("📅 Analyzed at: {}", analysis.analysis_timestamp.format("%Y-%m-%d %H:%M UTC"));
    println!("📈 Overall Score: {:.1}/100", analysis.overall_score);
    println!();

    println!("🎯 Skill Breakdown:");
    println!("📊 Code Quality:        {:.1}/100", analysis.code_quality_score);
    println!("🏗️  Project Quality:     {:.1}/100", analysis.project_quality_score);
    println!("🚀 Innovation:          {:.1}/100", analysis.innovation_score);
    println!("⏱️  Years Active:        {:.1} years", analysis.years_active);
    println!("📁 Total Repositories:  {}", analysis.total_repositories);
    println!();

    // Language Skills
    println!("💻 Programming Languages:");
    println!("--------------------------");
    let mut sorted_languages: Vec<_> = analysis.language_breakdown.iter().collect();
    sorted_languages.sort_by(|a, b| b.1.proficiency_score.partial_cmp(&a.1.proficiency_score).unwrap());
    
    for (lang, skill) in &sorted_languages {
        println!("   {:12} {:.1}/100 ({} projects, ~{} lines)", 
            lang, 
            skill.proficiency_score, 
            skill.project_count,
            skill.lines_of_code
        );
    }
    println!();

    // Technology Skills
    println!("🔧 Technologies:");
    println!("-----------------");
    let mut sorted_techs: Vec<_> = analysis.technology_breakdown.iter().collect();
    sorted_techs.sort_by(|a, b| b.1.proficiency_score.partial_cmp(&a.1.proficiency_score).unwrap());
    
    for (tech, skill) in &sorted_techs {
        println!("   {:15} {:.1}/100 ({} projects)", 
            tech, 
            skill.proficiency_score,
            skill.project_count
        );
    }
    println!();

    // Specializations
    println!("🎯 Specializations:");
    println!("-------------------");
    for spec in &analysis.specializations {
        println!("   {:20} {:.1}% confidence", spec.area, spec.confidence_score);
        println!("      Technologies: {}", spec.key_technologies.join(", "));
        println!("      Projects: {}", spec.supporting_projects.join(", "));
        println!();
    }

    println!("💡 This is a demonstration of the comprehensive skill analysis capabilities!");
    println!("   The actual analyzer fetches real data from GitHub repositories.");
}