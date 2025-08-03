#!/bin/bash

# Mental Health Tracker - Deployment Setup Script
echo "🚀 Setting up deployment for Mental Health Tracker..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the project to check for errors
echo "🔨 Building project..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

# Link to Vercel (if not already linked)
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Linking to Vercel..."
    vercel link
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Configure environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_AI_API_KEY (optional)"
echo ""
echo "2. Set up GitHub secrets for CI/CD:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID"
echo ""
echo "3. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "4. Or push to main branch for automatic deployment"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions" 