# Mental Health Tracker - Windows Deployment Setup Script
Write-Host "🚀 Setting up deployment for Mental Health Tracker on Windows..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm found: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Build the project to check for errors
Write-Host "🔨 Building project..." -ForegroundColor Yellow
pnpm build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix the errors before deploying." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Link to Vercel (if not already linked)
if (-not (Test-Path ".vercel\project.json")) {
    Write-Host "🔗 Linking to Vercel..." -ForegroundColor Yellow
    vercel link
}

Write-Host ""
Write-Host "🎉 Setup complete! Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Configure environment variables in Vercel dashboard:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_AI_API_KEY (optional)" -ForegroundColor White
Write-Host ""
Write-Host "2. Set up GitHub secrets for CI/CD:" -ForegroundColor Cyan
Write-Host "   - VERCEL_TOKEN" -ForegroundColor White
Write-Host "   - VERCEL_ORG_ID" -ForegroundColor White
Write-Host "   - VERCEL_PROJECT_ID" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy to production:" -ForegroundColor Cyan
Write-Host "   vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "4. Or push to main branch for automatic deployment" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow
Read-Host "Press Enter to continue" 