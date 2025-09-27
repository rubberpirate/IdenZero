# TrustHire AI-Powered Skill Analysis Tool

A comprehensive GitHub profile analyzer that evaluates developer skills for TrustHire's AI-powered hiring platform.

## Features

🎯 **Comprehensive Analysis**
- Overall skill scoring (0-100)
- Language proficiency breakdown
- Repository quality assessment
- Commit pattern analysis
- Web3/blockchain expertise evaluation

🌐 **Web3 Focus**
- Specialized detection of Web3 projects
- Higher scoring for blockchain languages (Solidity, Rust, Move, Cairo)
- Smart contract and DeFi project recognition

📊 **Detailed Metrics**
- Consistency scoring
- Complexity analysis
- Collaboration assessment
- Commit message quality
- Testing coverage evaluation

💡 **Personalized Recommendations**
- Skill improvement suggestions
- Technology learning paths
- Best practices guidance

## Installation

1. **Clone the repository:**
```bash
cd gh-fetcher-octocrab
```

2. **Set up GitHub Token:**
```bash
export GITHUB_TOKEN=your_github_personal_access_token
```

You can create a GitHub token at: https://github.com/settings/tokens

3. **Install dependencies:**
```bash
cargo build
```

## Usage

### Interactive Mode
```bash
cargo run
```

The tool will prompt you to enter:
- GitHub username to analyze
- Wallet address (optional)

### Example Output
```
🚀 TrustHire AI-Powered Skill Analysis Tool
==========================================

📋 === SKILL ANALYSIS RESULTS ===
👤 User: octocat
💳 Wallet: 0x1234567890123456789012345678901234567890
📅 Analyzed at: 2025-09-26 15:30 UTC

🏆 === OVERALL SCORES ===
🎯 Overall Score:     85.3/100
🔄 Consistency:       72.1/100
🧠 Complexity:        89.7/100
🤝 Collaboration:     91.2/100
🌐 Web3 Expertise:    45.8/100
💬 Commit Quality:    78.9/100

💻 === LANGUAGE BREAKDOWN ===
🌐 Solidity      | Score: 156.2 | LOC:     8420 | Commits:   45 | Projects: 3
   TypeScript    | Score:  89.4 | LOC:    15670 | Commits:  123 | Projects: 8
   Python        | Score:  76.8 | LOC:    12340 | Commits:   87 | Projects: 5
   ...

📚 === TOP REPOSITORIES ===
🌐 defi-protocol          | ⭐ 45 🍴 12 | Solidity     | Arch: 85 Doc: 90 Test: 65
   trading-bot            | ⭐ 23 🍴  7 | Python       | Arch: 78 Doc: 85 Test: 45
   ...

💡 === RECOMMENDATIONS ===
1. 🌐 Expand Web3 knowledge with advanced topics like Layer 2 solutions, DAOs, or cross-chain protocols
2. 🧪 Add more tests to your projects to improve code quality and reliability
3. 💬 Improve commit message quality using conventional commit format (feat:, fix:, docs:, etc.)
```

## API Integration

You can also use the analyzer programmatically:

```rust
use trusthire_skill_analyzer::{analyze_profile, UserProfile};

#[tokio::main]
async fn main() -> Result<()> {
    let profile = UserProfile {
        github_username: "username".to_string(),
        wallet_address: "0x...".to_string(),
    };
    
    let github_token = std::env::var("GITHUB_TOKEN")?;
    let analysis = analyze_profile(profile, github_token).await?;
    
    println!("Overall Score: {:.1}/100", analysis.overall_score);
    println!("Web3 Expertise: {:.1}/100", analysis.web3_expertise);
    
    Ok(())
}
```

## Data Structure

The analysis generates a comprehensive `SkillAnalysis` struct containing:

- **User Information**: GitHub username, wallet address
- **Overall Scores**: Weighted combination of all metrics
- **Language Skills**: Proficiency per programming language
- **Repository Analysis**: Individual repo quality assessments
- **Specialized Metrics**: Web3 expertise, collaboration patterns
- **Timestamps**: When the analysis was performed

All results are saved to a JSON file for further processing.

## Web3 Language Weighting

The analyzer applies higher weights to Web3/blockchain languages:

- **Solidity**: 2.5x multiplier
- **Rust**: 2.2x multiplier  
- **Move**: 2.0x multiplier
- **Cairo**: 2.0x multiplier
- **Vyper**: 1.8x multiplier
- **Go**: 1.8x multiplier
- **TypeScript**: 1.7x multiplier
- **JavaScript**: 1.6x multiplier

## Rate Limiting

The tool respects GitHub API rate limits:
- Analyzes up to 1000 repositories per user
- Fetches last 3 months of commit history
- Uses concurrent request limiting (max 5 parallel)
- Implements caching for repeated analyses

## Requirements

- Rust 1.70+
- GitHub Personal Access Token
- Internet connection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the TrustHire platform and is proprietary software.

## Support

For questions or issues, please contact the TrustHire development team.