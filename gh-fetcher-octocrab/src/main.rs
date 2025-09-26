use std::env;
use std::io::{self, Write};
use trusthire_skill_analyzer::GitHubAnalyzer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 TrustHire Skill Analyzer - AI-Powered GitHub Analysis");
    println!("========================================================");
    
    // Get GitHub token from environment
    let github_token = env::var("GITHUB_TOKEN")
        .or_else(|_| -> Result<String, std::env::VarError> {
            print!("Enter your GitHub Personal Access Token: ");
            io::stdout().flush().unwrap();
            let mut token = String::new();
            io::stdin().read_line(&mut token).unwrap();
            Ok(token.trim().to_string())
        })?;

    if github_token.is_empty() {
        eprintln!("❌ GitHub token is required!");
        std::process::exit(1);
    }

    // Initialize analyzer
    let mut analyzer = GitHubAnalyzer::new(github_token)?;

    loop {
        println!("\n📝 Enter GitHub username to analyze (or 'quit' to exit):");
        print!("> ");
        io::stdout().flush().unwrap();
        
        let mut username = String::new();
        io::stdin().read_line(&mut username).unwrap();
        let username = username.trim();
        
        if username.is_empty() {
            continue;
        }
        
        if username == "quit" {
            break;
        }

        println!("\n🔍 Analyzing GitHub profile: {}", username);
        println!("This may take a few moments...\n");

        match analyzer.analyze(username).await {
            Ok(analysis) => {
                display_analysis(&analysis);
            }
            Err(e) => {
                eprintln!("❌ Analysis failed: {}", e);
                continue;
            }
        }

        println!("{}", "=".repeat(80));
    }

    println!("👋 Thank you for using TrustHire Skill Analyzer!");
    Ok(())
}

fn display_analysis(analysis: &trusthire_skill_analyzer::SkillAnalysis) {
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
    if analysis.language_breakdown.is_empty() {
        println!("   No language data found");
    } else {
        let mut sorted_languages: Vec<_> = analysis.language_breakdown.iter().collect();
        sorted_languages.sort_by(|a, b| b.1.proficiency_score.partial_cmp(&a.1.proficiency_score).unwrap());
        
        for (lang, skill) in sorted_languages.iter().take(10) {
            println!("   {:12} {:.1}/100 ({} projects, ~{} lines)", 
                lang, 
                skill.proficiency_score, 
                skill.project_count,
                skill.lines_of_code
            );
        }
    }
    println!();

    // Technology Skills
    println!("🔧 Technologies:");
    println!("-----------------");
    if analysis.technology_breakdown.is_empty() {
        println!("   No technology data found");
    } else {
        let mut sorted_techs: Vec<_> = analysis.technology_breakdown.iter().collect();
        sorted_techs.sort_by(|a, b| b.1.proficiency_score.partial_cmp(&a.1.proficiency_score).unwrap());
        
        for (tech, skill) in sorted_techs.iter().take(10) {
            println!("   {:15} {:.1}/100 ({} projects)", 
                tech, 
                skill.proficiency_score,
                skill.project_count
            );
        }
    }
    println!();

    // Specializations
    println!("🎯 Specializations:");
    println!("-------------------");
    if analysis.specializations.is_empty() {
        println!("   No clear specializations identified");
    } else {
        for spec in &analysis.specializations {
            println!("   {:20} {:.1}% confidence", spec.area, spec.confidence_score);
            if !spec.key_technologies.is_empty() {
                println!("      Technologies: {}", spec.key_technologies.join(", "));
            }
            if !spec.supporting_projects.is_empty() {
                println!("      Projects: {}", spec.supporting_projects.join(", "));
            }
            println!();
        }
    }

    // Analysis insights
    println!("💡 Insights:");
    println!("-------------");
    
    if analysis.overall_score >= 80.0 {
        println!("   ⭐ Exceptional developer with high-quality contributions");
    } else if analysis.overall_score >= 60.0 {
        println!("   👍 Strong developer with consistent contributions");
    } else if analysis.overall_score >= 40.0 {
        println!("   📈 Developing skills with room for improvement");
    } else {
        println!("   🌱 Early-stage developer or limited public activity");
    }

    if analysis.code_quality_score < 50.0 {
        println!("   💡 Consider improving repository documentation and descriptions");
    }

    if analysis.years_active > 5.0 {
        println!("   🎖️  Experienced developer with {:.1} years of activity", analysis.years_active);
    } else if analysis.years_active > 2.0 {
        println!("   📅 Moderate experience with {:.1} years of activity", analysis.years_active);
    } else {
        println!("   🆕 Relatively new to GitHub ({:.1} years)", analysis.years_active);
    }

    if analysis.total_repositories == 0 {
        println!("   ⚠️  No accessible repositories found");
    } else if analysis.total_repositories < 5 {
        println!("   📦 Limited public repository portfolio");
    } else if analysis.total_repositories > 20 {
        println!("   🏭 Prolific contributor with {} repositories", analysis.total_repositories);
    }

    // Innovation insights
    if analysis.innovation_score > 70.0 {
        println!("   🚀 Highly innovative with diverse technology usage");
    } else if analysis.innovation_score > 40.0 {
        println!("   🔧 Good technology adoption and recent activity");
    } else {
        println!("   📚 Focus on expanding technology stack and project diversity");
    }
}