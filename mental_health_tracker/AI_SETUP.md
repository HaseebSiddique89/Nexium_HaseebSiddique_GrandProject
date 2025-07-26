# AI Setup Guide for Mental Health Tracker

This guide will help you enable real AI features in your Mental Health Tracker application using Google's **free** Gemini API.

## 🚀 Quick Start

### 1. Get a Google AI Studio API Key (FREE!)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" in the top right
4. Create a new API key or use an existing one
5. Copy the generated API key

### 2. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Configuration (FREE with Gemini!)
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key_here
```

### 3. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
pnpm dev
```

## 🤖 AI Features Available

### With Real AI Enabled (FREE with Gemini!):
- **Sentiment Analysis**: Deep understanding of emotional content in journal entries
- **Predictive Insights**: ML-based mood predictions and trend analysis
- **Personalized Recommendations**: Context-aware, actionable suggestions
- **Emotional Pattern Detection**: Advanced pattern recognition in your data
- **Natural Language Understanding**: Better analysis of journal content

### Without AI (Fallback Mode):
- **Basic Pattern Analysis**: Rule-based mood and journal analysis
- **Keyword Detection**: Simple word matching for insights
- **Statistical Calculations**: Averages, streaks, and basic trends

## 🔧 Advanced Configuration

### Using Different AI Models

#### Gemini Models (FREE!):
```env
NEXT_PUBLIC_AI_MODEL=gemini-1.5-flash    # Fast, cost-effective (recommended)
NEXT_PUBLIC_AI_MODEL=gemini-1.5-pro       # More powerful, still free
```

#### OpenAI Models (Paid):
```env
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_AI_MODEL=gpt-3.5-turbo        # Fast, cost-effective
NEXT_PUBLIC_AI_MODEL=gpt-4                # More powerful, higher cost
NEXT_PUBLIC_AI_MODEL=gpt-4-turbo          # Balanced performance
```

#### Anthropic Claude (Alternative):
```env
NEXT_PUBLIC_AI_PROVIDER=anthropic
NEXT_PUBLIC_AI_MODEL=claude-3-sonnet
NEXT_PUBLIC_AI_API_KEY=your_anthropic_api_key
```

### Custom AI Endpoint
If you have your own AI service:
```env
NEXT_PUBLIC_AI_PROVIDER=custom
NEXT_PUBLIC_AI_ENDPOINT=https://your-ai-service.com/api
NEXT_PUBLIC_AI_API_KEY=your_custom_api_key
```

## 💰 Cost Considerations

### Gemini API (FREE!):
- **gemini-1.5-flash**: Completely FREE
- **gemini-1.5-pro**: Completely FREE
- **No usage limits** for reasonable usage
- **No credit card required**

### OpenAI Pricing (as of 2024):
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **GPT-4**: ~$0.03 per 1K tokens
- **GPT-4-turbo**: ~$0.01 per 1K tokens

### Estimated Monthly Costs:
- **Gemini (Recommended)**: $0/month (FREE!)
- **Light usage** (10 insights/day): $0/month with Gemini
- **Moderate usage** (50 insights/day): $0/month with Gemini
- **Heavy usage** (100+ insights/day): $0/month with Gemini

## 🔒 Privacy & Security

### Data Handling:
- **Journal entries** are sent to AI services for analysis
- **Mood data** is processed for patterns
- **No personal identifiers** are included in AI requests
- **Data is not stored** by AI providers beyond the request

### Recommendations:
- Review your journal entries before enabling AI
- Consider using pseudonyms in sensitive entries
- Monitor your API usage regularly
- Use the basic analysis mode for maximum privacy

## 🛠️ Troubleshooting

### Common Issues:

#### 1. "AI Powered" not showing
- Check that your API key is correct
- Ensure environment variables are loaded
- Restart your development server

#### 2. API errors in console
- Verify your Google AI Studio account is active
- Check API key permissions
- Ensure the model name is correct

#### 3. Slow response times
- Try using `gemini-1.5-flash` for faster responses
- Reduce the amount of data sent to AI
- Check your internet connection

#### 4. Fallback to basic analysis
- This is normal when AI services are unavailable
- Check your API key and network connection
- The app will continue working with basic analysis

### Debug Mode:
Add this to your `.env.local` for detailed logging:
```env
NEXT_PUBLIC_DEBUG_AI=true
```

## 📊 Monitoring Usage

### Check Gemini Usage:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Navigate to "API keys" section
3. Monitor your usage (FREE tier is very generous)

### Set Usage Limits:
1. Go to Google Cloud Console
2. Set up billing alerts if needed
3. Monitor usage in Google AI Studio

## 🔄 Switching Between Modes

### Enable AI (FREE with Gemini):
```env
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_API_KEY=your_gemini_key_here
```

### Disable AI (Basic Mode):
```env
NEXT_PUBLIC_AI_PROVIDER=local
# Remove or comment out AI_API_KEY
```

## 🎯 Best Practices

1. **Start with Gemini**: Use the free Gemini API for cost efficiency
2. **Monitor Usage**: Check your Google AI Studio dashboard regularly
3. **Test Thoroughly**: Try both AI and basic modes
4. **Backup Data**: Ensure your Supabase data is backed up
5. **Privacy First**: Review what data is sent to AI services

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your environment variables
3. Test with a simple API call
4. Check Google AI Studio service status
5. Review the troubleshooting section above

## 🚀 Next Steps

Once AI is enabled:

1. **Test the features**: Try adding mood entries and journal entries
2. **Explore insights**: Visit the AI Insights page
3. **Monitor usage**: Keep track of your API usage (FREE with Gemini!)
4. **Customize**: Adjust the AI configuration as needed
5. **Scale**: Consider upgrading to more powerful models if needed

---

**Note**: The AI features are designed to enhance your mental health journey. They provide insights and recommendations but should not replace professional mental health care when needed.

## 🎉 Why Choose Gemini?

- **Completely FREE**: No costs, no credit card required
- **High Quality**: Powered by Google's advanced AI models
- **Fast**: Quick response times for real-time insights
- **Reliable**: Google's infrastructure ensures high availability
- **Privacy**: Google's strong privacy policies protect your data 