use std::env;
use std::io::{self, Write};
use idenzero_analyzer::{GitHubAnalyzer, UserProfile, SummaryGenerator, FrontendAdapter, ApiServer};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 IdenZero Skill Analyzer - AI-Powered GitHub Analysis");
    println!("========================================================");
    
    // Check if server mode is requested
    let args: Vec<String> = env::args().collect();
    let server_mode = args.len() > 1 && args[1] == "server";

    // Get GitHub token from environment
    let github_token = env::var("GITHUB_TOKEN")
        .or_else(|_| -> Result<String, std::env::VarError> {
            if server_mode {
                eprintln!("❌ GITHUB_TOKEN environment variable is required for server mode!");
                std::process::exit(1);
            }
            
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

    if server_mode {
        println!("🌐 Starting API Server Mode...");
        let server = ApiServer::new(github_token)?;
        server.serve().await;
        return Ok(());
    }

    // CLI Mode - Interactive analysis
    println!("💻 Interactive CLI Mode");
    println!("Run with 'cargo run server' to start API server");
    println!();

    // Initialize analyzer and improved components
    let mut analyzer = GitHubAnalyzer::new(github_token)?;
    let summary_generator = SummaryGenerator::new();
    let frontend_adapter = FrontendAdapter::new();

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
                // Display traditional analysis
                display_analysis(&analysis);
                
                // Generate and display AI summary
                println!("\n🤖 AI-Generated Summary:");
                println!("========================");
                let summary = summary_generator.generate_summary(&analysis);
                display_ai_summary(&summary);
                
                // Generate frontend profile data
                println!("\n🎨 Frontend Profile Preview:");
                println!("============================");
                let frontend_profile = frontend_adapter.create_frontend_profile(&analysis, username, None);
                display_frontend_preview(&frontend_profile);
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

fn display_analysis(analysis: &idenzero_analyzer::SkillAnalysis) {
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

fn display_ai_summary(summary: &idenzero_analyzer::DeveloperSummary) {
    println!("👨‍💻 {}", summary.primary_title);
    println!("🎓 Experience Level: {:?}", summary.experience_level);
    println!();
    
    println!("📝 Professional Summary:");
    println!("{}", summary.professional_summary);
    println!();
    
    println!("🚀 Elevator Pitch:");
    println!("{}", summary.elevator_pitch);
    println!();
    
    if !summary.specializations.is_empty() {
        println!("🎯 Specializations: {}", summary.specializations.join(", "));
    }
    
    if !summary.key_strengths.is_empty() {
        println!("💪 Key Strengths: {}", summary.key_strengths.join(", "));
    }
    
    if !summary.personality_traits.is_empty() {
        println!("🧠 Personality Traits: {}", summary.personality_traits.join(", "));
    }
    
    println!();
    println!("🔧 Technology Focus:");
    println!("   Primary Stack: {}", summary.technology_focus.primary_stack);
    if !summary.technology_focus.secondary_skills.is_empty() {
        println!("   Secondary Skills: {}", summary.technology_focus.secondary_skills.join(", "));
    }
    if !summary.technology_focus.emerging_interests.is_empty() {
        println!("   Emerging Interests: {}", summary.technology_focus.emerging_interests.join(", "));
    }
    println!("   Architecture Preference: {}", summary.technology_focus.architecture_preference);
    
    if !summary.achievement_highlights.is_empty() {
        println!();
        println!("🏆 Achievement Highlights:");
        for achievement in &summary.achievement_highlights {
            println!("   • {}", achievement);
        }
    }
}

fn display_frontend_preview(profile: &idenzero_analyzer::FrontendProfile) {
    println!("👤 {}: {}", profile.basic_info.name, profile.basic_info.title);
    println!("📱 Tagline: {}", profile.basic_info.tagline);
    println!();
    
    println!("🎨 Visual Summary:");
    println!("   • Color Theme: {}", profile.visual_summary.personality_color);
    println!("   • Work Style: {} {}", profile.visual_summary.work_style_icon, profile.visual_summary.work_style_icon);
    println!("   • Experience: {} years ({}%)", 
             profile.visual_summary.experience_level_visual.years,
             profile.visual_summary.experience_level_visual.progress_percentage);
    println!();
    
    println!("🎮 Interactive Elements:");
    println!("   • {} draggable modules", profile.interactive_elements.draggable_modules.len());
    println!("   • {} animated skills", profile.interactive_elements.animated_skills.len());
    println!();
    
    println!("🏅 Badges ({}):", profile.badges.len());
    for badge in profile.badges.iter().take(3) {
        let verified = if badge.verified { "✅" } else { "⏳" };
        println!("   {} {} {} - {}", verified, badge.icon, badge.title, badge.description);
    }
    
    if profile.badges.len() > 3 {
        println!("   ... and {} more badges", profile.badges.len() - 3);
    }
    
    println!();
    println!("📊 Skills Visualization:");
    println!("   • Chart Type: {}", profile.skills_visualization.chart_type);
    println!("   • {} skills tracked", profile.skills_visualization.skills.len());
    
    println!();
    println!("🚀 Featured Projects:");
    for project in profile.project_showcase.featured_projects.iter().take(3) {
        println!("   • {} (⭐ {}) - {}", 
                 project.name, 
                 project.stars,
                 project.tech_stack.join(", "));
    }
}