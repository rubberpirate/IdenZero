use std::env;
use std::io::{self, Write};
use trusthire_skill_analyzer::{GitHubAnalyzer, UserProfile};

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

        // Optional wallet address
        println!("💳 Enter wallet address (optional, press Enter to skip):");
        print!("> ");
        io::stdout().flush().unwrap();
        
        let mut wallet = String::new();
        io::stdin().read_line(&mut wallet).unwrap();
        let wallet = wallet.trim();
        let wallet_address = if wallet.is_empty() { None } else { Some(wallet.to_string()) };

        let profile = UserProfile {
            github_username: username.to_string(),
            wallet_address,
        };

        println!("\n🔍 Analyzing GitHub profile: {}", username);
        println!("This may take a few moments...\n");

        match analyzer.analyze(profile).await {
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
    println!("👤 User: {}", analysis.github_username);
    if let Some(wallet) = &analysis.wallet_address {
        println!("� Wallet: {}", wallet);
    }
    println!("�📅 Analyzed at: {}", analysis.analyzed_at.format("%Y-%m-%d %H:%M UTC"));
    println!("📈 Overall Score: {:.1}/100", analysis.overall_score);
    println!();

    println!("🎯 Skill Breakdown:");
    println!("📊 Consistency:         {:.1}/100", analysis.consistency_score);
    println!("🧠 Complexity:          {:.1}/100", analysis.complexity_score);
    println!("🤝 Collaboration:       {:.1}/100", analysis.collaboration_score);
    println!("🌐 Web3 Expertise:      {:.1}/100", analysis.web3_expertise);
    println!("💬 Commit Quality:      {:.1}/100", analysis.commit_quality_score);
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
        sorted_languages.sort_by(|a, b| b.1.score.partial_cmp(&a.1.score).unwrap());
        
        for (lang, skill) in sorted_languages.iter().take(10) {
            println!("   {:12} {:.1}/100 ({} projects, ~{} lines)", 
                lang, 
                skill.score, 
                skill.project_count,
                skill.lines_of_code
            );
        }
    }
    println!();

    // Repository Analysis
    println!("📚 Top Repositories:");
    println!("---------------------");
    if analysis.repository_analysis.is_empty() {
        println!("   No repository data found");
    } else {
        let mut sorted_repos: Vec<_> = analysis.repository_analysis.iter().collect();
        sorted_repos.sort_by(|a, b| b.stars.cmp(&a.stars));
        
        for repo in sorted_repos.iter().take(5) {
            let web3_indicator = if repo.is_web3_project { "🌐" } else { "  " };
            println!("{} {} | ⭐ {} 🍴 {} | {} | Arch: {:.0} Doc: {:.0} Test: {:.0}", 
                web3_indicator,
                repo.name, 
                repo.stars, 
                repo.forks,
                repo.primary_language.as_deref().unwrap_or("Unknown"),
                repo.architecture_score,
                repo.documentation_score,
                repo.testing_coverage
            );
        }
    }
    println!();

    // Languages Skills
    println!("🔧 Programming Languages:");
    println!("-------------------------");
    if analysis.language_breakdown.is_empty() {
        println!("   No language data found");
    } else {
        let mut sorted_langs: Vec<_> = analysis.language_breakdown.iter().collect();
        sorted_langs.sort_by(|a, b| b.1.score.partial_cmp(&a.1.score).unwrap());
        
        for (lang, skill) in sorted_langs.iter().take(10) {
            println!("   {:15} {:.1}/100 ({} projects, {} commits)", 
                lang, 
                skill.score,
                skill.project_count,
                skill.commit_count
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

    if analysis.commit_quality_score < 50.0 {
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

    // Web3 & Innovation insights
    if analysis.web3_expertise > 70.0 {
        println!("   🚀 High Web3 expertise with blockchain/DeFi experience");
    } else if analysis.web3_expertise > 40.0 {
        println!("   🔧 Some Web3 experience and blockchain technology usage");
    } else {
        println!("   📚 Limited Web3 exposure - potential for growth in blockchain");
    }
}