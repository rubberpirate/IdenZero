#!/bin/bash

# TrustHire Skill Analysis Example Script

echo "🚀 TrustHire AI-Powered Skill Analysis Tool - Example Usage"
echo "=========================================================="

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is not set!"
    echo
    echo "To get started:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Create a new personal access token with 'repo' scope"
    echo "3. Export it as an environment variable:"
    echo "   export GITHUB_TOKEN=your_token_here"
    echo
    echo "Then run this script again."
    exit 1
fi

echo "✅ GitHub token found!"
echo

# Examples of usernames to analyze (you can change these)
EXAMPLE_USERS=(
    "octocat"
    "torvalds" 
    "gaearon"
    "sindresorhus"
    "tj"
)

echo "Example usernames you can analyze:"
for user in "${EXAMPLE_USERS[@]}"; do
    echo "  - $user"
done

echo
echo "To analyze a specific profile, run:"
echo "  cargo run"
echo
echo "Or to run the release version:"
echo "  ./target/release/trusthire-skill-analyzer"
echo
echo "The tool will:"
echo "  📊 Analyze GitHub repositories and commit history"
echo "  🌐 Detect Web3/blockchain expertise"
echo "  💻 Score programming language proficiency"
echo "  🏆 Generate overall skill assessments"
echo "  💾 Save detailed results to JSON file"
echo

echo "Sample analysis command (non-interactive):"
echo "  echo -e 'octocat\\n0x1234567890123456789012345678901234567890' | cargo run"

echo
echo "Happy analyzing! 🎯"