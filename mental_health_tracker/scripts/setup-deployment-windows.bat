@echo off
echo 🚀 Setting up deployment for Mental Health Tracker on Windows...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing pnpm...
    npm install -g pnpm
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Build the project to check for errors
echo 🔨 Building project...
pnpm build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed. Please fix the errors before deploying.
    pause
    exit /b 1
)

REM Link to Vercel (if not already linked)
if not exist ".vercel\project.json" (
    echo 🔗 Linking to Vercel...
    vercel link
)

echo.
echo 🎉 Setup complete! Next steps:
echo.
echo 1. Configure environment variables in Vercel dashboard:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo    - NEXT_PUBLIC_AI_API_KEY (optional)
echo.
echo 2. Set up GitHub secrets for CI/CD:
echo    - VERCEL_TOKEN
echo    - VERCEL_ORG_ID
echo    - VERCEL_PROJECT_ID
echo.
echo 3. Deploy to production:
echo    vercel --prod
echo.
echo 4. Or push to main branch for automatic deployment
echo.
echo 📚 See DEPLOYMENT.md for detailed instructions
pause 