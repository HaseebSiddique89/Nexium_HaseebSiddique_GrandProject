# AI Features Setup Guide

## Overview

The Mental Health Tracker includes AI-powered features for enhanced insights and analysis. These features are **optional** - the app works perfectly without them using basic pattern analysis.

## AI Features Available

1. **Sentiment Analysis** - Analyzes the emotional tone of journal entries
2. **Predictive Insights** - Predicts future mood trends and patterns
3. **Personalized Recommendations** - Provides actionable mental health advice
4. **AI-Generated Insights** - Advanced pattern recognition and analysis

## Setup Instructions

### Option 1: Basic Analysis (No Setup Required)

The app works immediately with basic analysis features:
- Mood pattern analysis
- Journal entry statistics
- Basic recommendations
- Streak tracking

### Option 2: Enhanced AI Features

To enable AI-powered features, follow these steps:

#### 1. Create a `.env.local` file

Copy the example environment variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Configuration (Optional - for enhanced AI features)
# For Gemini AI (predictions, insights, recommendations)
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_MODEL=gemini-2.5-flash-lite
NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key_here

# For Hugging Face (sentiment analysis)
NEXT_PUBLIC_HUGGINGFACE_TOKEN=your_huggingface_token_here
```

#### 2. Get API Keys

**For Gemini AI (Recommended):**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to `NEXT_PUBLIC_AI_API_KEY`

**For Hugging Face (Optional):**
1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Add it to `NEXT_PUBLIC_HUGGINGFACE_TOKEN`

#### 3. Restart the Development Server

```bash
pnpm dev
```

## Error Handling

The app includes robust error handling:

- **Missing API Keys**: Falls back to basic analysis
- **API Rate Limits**: Automatically switches to basic analysis
- **Network Errors**: Graceful fallback with user-friendly messages
- **Invalid Responses**: Manual parsing and fallback mechanisms

## Troubleshooting

### "Failed to fetch" Errors

These errors occur when:
1. API keys are missing or invalid
2. Network connectivity issues
3. API rate limits exceeded

**Solution**: The app automatically falls back to basic analysis. Check your API keys and try again.

### Rate Limit Issues

Free tier limits:
- **Gemini**: 1000 requests/day
- **Hugging Face**: Varies by model

**Solution**: Wait for quota reset or upgrade to paid plans.

## Feature Comparison

| Feature | Basic Analysis | AI Enhanced |
|---------|---------------|-------------|
| Mood Tracking | ✅ | ✅ |
| Journal Analysis | ✅ | ✅ |
| Pattern Recognition | ✅ | ✅ |
| Sentiment Analysis | Basic | Advanced AI |
| Predictive Insights | Basic | AI-Powered |
| Recommendations | Generic | Personalized |
| Emotional Keywords | ❌ | ✅ |
| Stress Indicators | ❌ | ✅ |

## Security Notes

- API keys are stored in environment variables
- No sensitive data is sent to AI services
- All analysis happens server-side
- User data remains in your Supabase database

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your API keys are correct
3. Ensure your environment variables are properly set
4. The app will continue working with basic analysis even if AI features fail 