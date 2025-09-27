use trusthire_skill_analyzer::{analyze_profile, UserProfile};
use anyhow::Result;
use tracing_subscriber;
use std::io::{self, Write};
use rand;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    // Get GitHub token from environment variable or prompt user
    let github_token = match std::env::var("GITHUB_TOKEN") {
        Ok(token) => token,
        Err(_) => {
            eprintln!("❌ GITHUB_TOKEN environment variable not found!");
            eprintln!("Please set it with: export GITHUB_TOKEN=your_github_token");
            eprintln!("You can create a token at: https://github.com/settings/tokens");
            std::process::exit(1);
        }
    };
    
    println!("🚀 TrustHire AI-Powered Skill Analysis Tool");
    println!("==========================================\n");
    
    // Get user input for GitHub username
    print!("Enter GitHub username to analyze: ");
    io::stdout().flush().unwrap();
    let mut github_username = String::new();
    io::stdin().read_line(&mut github_username)?;
    let github_username = github_username.trim().to_string();
    
    if github_username.is_empty() {
        eprintln!("❌ GitHub username cannot be empty!");
        std::process::exit(1);
    }
    
    // Get user input for wallet address (optional)
    print!("Enter wallet address (optional, press Enter to skip): ");
    io::stdout().flush().unwrap();
    let mut wallet_address = String::new();
    io::stdin().read_line(&mut wallet_address)?;
    let wallet_address = wallet_address.trim().to_string();
    
    let wallet_address = if wallet_address.is_empty() {
        format!("0x{:040x}", rand::random::<u64>()) // Generate a random address if none provided
    } else {
        wallet_address
    };
    
    let profile = UserProfile {
        github_username: github_username.clone(),
        wallet_address,
    };
    
    println!("\n📊 Starting analysis for GitHub user: {}", github_username);
    println!("This may take a few minutes depending on the number of repositories...\n");
    
    match analyze_profile(profile, github_token).await {
        Ok(analysis) => {
            // Display results
            display_analysis_results(&analysis);
            
            // Save to JSON file
            let filename = format!("{}_skill_analysis.json", github_username);
            let json_output = serde_json::to_string_pretty(&analysis)?;
            tokio::fs::write(&filename, json_output).await?;
            
            println!("\n💾 Analysis saved to: {}", filename);
            println!("✅ Analysis completed successfully!");
        }
        Err(e) => {
            eprintln!("❌ Error analyzing profile: {}", e);
            eprintln!("Common issues:");
            eprintln!("  - User '{}' not found on GitHub", github_username);
            eprintln!("  - Invalid or expired GitHub token");
            eprintln!("  - Rate limit exceeded (wait a few minutes and try again)");
            eprintln!("  - Network connectivity issues");
            std::process::exit(1);
        }
    }
    
    Ok(())
}

fn display_analysis_results(analysis: &trusthire_skill_analyzer::SkillAnalysis) {
    println!("📋 === SKILL ANALYSIS RESULTS ===");
    println!("👤 User: {}", analysis.github_username);
    println!("💳 Wallet: {}", analysis.user_address);
    println!("📅 Analyzed at: {}", analysis.analyzed_at.format("%Y-%m-%d %H:%M UTC"));
    
    println!("\n🏆 === OVERALL SCORES ===");
    println!("🎯 Overall Score:     {:.1}/100", analysis.overall_score);
    println!("🔄 Consistency:       {:.1}/100", analysis.consistency_score);
    println!("🧠 Complexity:        {:.1}/100", analysis.complexity_score);
    println!("🤝 Collaboration:     {:.1}/100", analysis.collaboration_score);
    println!("🌐 Web3 Expertise:    {:.1}/100", analysis.web3_expertise);
    println!("💬 Commit Quality:    {:.1}/100", analysis.commit_quality_score);
    
    println!("\n💻 === LANGUAGE BREAKDOWN ===");
    let mut languages: Vec<_> = analysis.language_breakdown.iter().collect();
    languages.sort_by(|a, b| b.1.proficiency_score.partial_cmp(&a.1.proficiency_score).unwrap());
    
    for (language, skill) in languages.iter().take(10) {
        let web3_indicator = if matches!(language.as_str(), "Solidity" | "Rust" | "Move" | "Cairo" | "Vyper") {
            "🌐"
        } else {
            "  "
        };
        
        println!("{} {:<12} | Score: {:>5.1} | LOC: {:>8} | Commits: {:>4} | Projects: {}", 
                 web3_indicator,
                 language, 
                 skill.proficiency_score, 
                 skill.lines_of_code,
                 skill.commit_count, 
                 skill.project_count);
    }
    
    if languages.len() > 10 {
        println!("   ... and {} more languages", languages.len() - 10);
    }
    
    println!("\n📚 === TOP REPOSITORIES ===");
    let mut repos = analysis.repository_analysis.clone();
    repos.sort_by(|a, b| {
        let score_a = a.architecture_score + a.documentation_score + a.innovation_score;
        let score_b = b.architecture_score + b.documentation_score + b.innovation_score;
        score_b.partial_cmp(&score_a).unwrap()
    });
    
    for repo in repos.iter().take(10) {
        let web3_indicator = if repo.is_web3_project { "🌐" } else { "  " };
        let language = repo.primary_language.as_ref().unwrap_or(&"Unknown".to_string()).clone();
        
        println!("{} {:<25} | ⭐{:>3} 🍴{:>3} | {} | Arch: {:.0} Doc: {:.0} Test: {:.0}", 
                 web3_indicator,
                 format!("{}...", &repo.name.chars().take(22).collect::<String>()),
                 repo.stars, 
                 repo.forks,
                 format!("{:<12}", language.chars().take(12).collect::<String>()),
                 repo.architecture_score,
                 repo.documentation_score,
                 repo.testing_coverage);
    }
    
    if repos.len() > 10 {
        println!("   ... and {} more repositories", repos.len() - 10);
    }
    
    // Provide recommendations
    println!("\n💡 === RECOMMENDATIONS ===");
    provide_recommendations(analysis);
}

fn provide_recommendations(analysis: &trusthire_skill_analyzer::SkillAnalysis) {
    let mut recommendations = Vec::new();

    // Web3 expertise recommendations
    if analysis.web3_expertise < 30.0 {
        recommendations.push("🌐 Consider learning Web3 technologies like Solidity, smart contracts, or DeFi protocols");
    } else if analysis.web3_expertise < 70.0 {
        recommendations.push("🌐 Expand Web3 knowledge with advanced topics like Layer 2 solutions, DAOs, or cross-chain protocols");
    }

    // Commit quality recommendations
    if analysis.commit_quality_score < 60.0 {
        recommendations.push("💬 Improve commit message quality using conventional commit format (feat:, fix:, docs:, etc.)");
    }

    // Consistency recommendations
    if analysis.consistency_score < 50.0 {
        recommendations.push("🔄 Maintain more consistent coding patterns and commit schedules");
    }

    // Collaboration recommendations
    if analysis.collaboration_score < 40.0 {
        recommendations.push("🤝 Engage more with the community - contribute to open source or collaborate on projects");
    }

    // Language diversity recommendations
    let language_count = analysis.language_breakdown.len();
    if language_count < 3 {
        recommendations.push("🔧 Learn additional programming languages to diversify your skill set");
    }

    // Documentation recommendations
    let avg_doc_score = analysis.repository_analysis.iter()
        .map(|r| r.documentation_score)
        .sum::<f64>() / analysis.repository_analysis.len() as f64;
    
    if avg_doc_score < 60.0 {
        recommendations.push("📚 Improve project documentation with detailed READMEs and code comments");
    }

    // Testing recommendations
    let avg_test_coverage = analysis.repository_analysis.iter()
        .map(|r| r.testing_coverage)
        .sum::<f64>() / analysis.repository_analysis.len() as f64;
    
    if avg_test_coverage < 30.0 {
        recommendations.push("🧪 Add more tests to your projects to improve code quality and reliability");
    }

    // Display recommendations
    for (i, recommendation) in recommendations.iter().enumerate() {
        println!("{}. {}", i + 1, recommendation);
    }

    if recommendations.is_empty() {
        println!("🎉 Excellent work! Your profile shows strong technical skills across all areas.");
        println!("   Continue building innovative projects and contributing to the community!");
    }
}