#!/bin/bash
# Script to safely run ENS record updates
# This ensures the .env file is properly configured before running

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found at $ENV_FILE"
    echo "📝 Please copy .env.example to .env and fill in your credentials:"
    echo "   cp .env.example .env"
    echo "   # Then edit .env with your actual values"
    exit 1
fi

# Check if required variables are set (basic check)
if ! grep -q "INFURA_API_KEY=" "$ENV_FILE" || ! grep -q "PRIVATE_KEY=" "$ENV_FILE"; then
    echo "❌ Missing required environment variables in .env file"
    echo "📝 Please make sure your .env file contains all required variables"
    exit 1
fi

# Warn about sensitive data
echo "⚠️  Warning: This script will use your private key from the .env file"
echo "🔒 Make sure your .env file is never committed to version control"
echo "💰 Ensure your wallet has Sepolia ETH for gas fees"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Run the script
echo "🚀 Running ENS record update script..."
node "$SCRIPT_DIR/setEnsRecords.js"