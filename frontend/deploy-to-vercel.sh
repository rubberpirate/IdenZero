#!/bin/bash
# Deployment script for Vercel + ENS setup

echo "🚀 IdenZero Deployment to Vercel + ENS Setup"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Deployment successful!"

# Get the deployment URL
echo "📋 Getting deployment URL..."
VERCEL_URL=$(vercel ls --meta url | head -n 1)

if [ -z "$VERCEL_URL" ]; then
    echo "⚠️  Could not automatically get Vercel URL."
    echo "Please manually update your .env file with your Vercel URL:"
    echo "VERCEL_URL=https://your-actual-vercel-url.vercel.app"
    echo ""
    echo "Then run: ./scripts/run-ens-update.sh"
    exit 0
fi

echo "🔗 Deployment URL: $VERCEL_URL"

# Ask if user wants to update ENS record
echo ""
read -p "🌐 Update ENS record (idenzero.eth) to point to this URL? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Update .env file with new URL
    sed -i "s|VERCEL_URL=.*|VERCEL_URL=$VERCEL_URL|" .env
    
    # Run ENS update
    echo "🔄 Updating ENS record..."
    ./scripts/run-ens-update.sh
else
    echo "⚠️  ENS record not updated. You can run './scripts/run-ens-update.sh' later."
fi

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Your app: $VERCEL_URL"
echo "🏷️  ENS domain: idenzero.eth"