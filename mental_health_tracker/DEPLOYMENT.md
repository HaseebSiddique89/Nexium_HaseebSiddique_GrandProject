# Deployment Guide - Mental Health Tracker

This guide will help you deploy your mental health tracker application to Vercel using CI/CD.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project** - For database and authentication
4. **AI API Keys** - For enhanced features (optional)

## Step 1: Set Up Vercel Project

### Option A: Connect via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `mental_health_tracker`
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
   - **Output Directory**: `.next`

### Option B: Use Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd mental_health_tracker
vercel
```

## Step 2: Configure Environment Variables

In your Vercel dashboard, go to **Settings > Environment Variables** and add:

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables (for AI features)
```
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_MODEL=gemini-2.5-flash-lite
NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_HUGGINGFACE_TOKEN=your_huggingface_token
```

## Step 3: Set Up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

### Required Secrets
- `VERCEL_TOKEN` - Get from [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` - Get from Vercel dashboard or CLI
- `VERCEL_PROJECT_ID` - Get from Vercel dashboard or CLI

### How to Get Vercel IDs
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login and link project
vercel login
vercel link

# This will show your org and project IDs
```

## Step 4: Configure CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) is already configured to:

1. **Test and Build** on every push and pull request
2. **Deploy to Production** only when pushing to `main` branch
3. **Run Linting** and **Type Checking**
4. **Cache Dependencies** for faster builds

## Step 5: Deploy

### Automatic Deployment
- Push to `main` branch → Automatic production deployment
- Push to `develop` branch → Automatic preview deployment
- Create pull request → Automatic preview deployment

### Manual Deployment
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Step 6: Verify Deployment

1. **Check Build Logs** - In Vercel dashboard
2. **Test Application** - Visit your deployed URL
3. **Monitor Performance** - Use Vercel Analytics
4. **Set Up Custom Domain** - In Vercel dashboard

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Verify all dependencies are in `package.json`
   - Check TypeScript errors locally first

2. **Environment Variables**
   - Ensure all required variables are set in Vercel
   - Check variable names match exactly
   - Verify Supabase project is active

3. **Database Connection**
   - Verify Supabase project is running
   - Check RLS (Row Level Security) policies
   - Ensure database tables are created

### Debug Commands
```bash
# Test build locally
pnpm build

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database connection
pnpm dev
```

## Monitoring and Maintenance

1. **Set up Vercel Analytics** for performance monitoring
2. **Configure Error Tracking** (Sentry, LogRocket, etc.)
3. **Set up Uptime Monitoring** (UptimeRobot, Pingdom)
4. **Regular Security Updates** - Keep dependencies updated

## Security Considerations

1. **Environment Variables** - Never commit sensitive data
2. **API Keys** - Rotate regularly
3. **Database Access** - Use least privilege principle
4. **HTTPS** - Vercel provides this automatically

## Performance Optimization

1. **Image Optimization** - Use Next.js Image component
2. **Code Splitting** - Automatic with Next.js
3. **Caching** - Configure in `vercel.json`
4. **CDN** - Vercel Edge Network

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs) 