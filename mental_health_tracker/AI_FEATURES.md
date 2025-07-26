# AI Features Documentation

## Overview

The Mental Health Tracker now includes advanced AI-powered features that provide personalized insights and recommendations based on your mood and journal data, powered by **Google's free Gemini API**.

## 🤖 AI Capabilities

### 1. Sentiment Analysis
- **Deep Text Understanding**: Analyzes the emotional content of your journal entries
- **Sentiment Scoring**: Provides a numerical score (-1 to 1) indicating overall emotional tone
- **Emotional Keywords**: Identifies key emotional words and phrases
- **Stress Indicators**: Detects stress-related language and patterns

### 2. Predictive Insights
- **Mood Prediction**: Forecasts likely mood trends based on historical data
- **Risk Factor Analysis**: Identifies potential risk factors affecting mental health
- **Positive Factor Recognition**: Highlights positive patterns and behaviors
- **Weekly Predictions**: Provides detailed predictions for the upcoming week

### 3. Personalized Recommendations
- **Context-Aware Suggestions**: Recommendations based on your specific patterns
- **Actionable Advice**: Practical steps you can take to improve mental health
- **Progress-Based Guidance**: Suggestions that adapt to your improvement journey
- **Crisis Prevention**: Early warning recommendations when needed

### 4. Enhanced Pattern Recognition
- **Mood Pattern Analysis**: Identifies recurring mood cycles and triggers
- **Journal Theme Detection**: Recognizes common themes in your writing
- **Behavioral Pattern Recognition**: Connects activities with mood outcomes
- **Temporal Pattern Analysis**: Identifies time-based patterns (daily, weekly, seasonal)

## 🔧 Technical Implementation

### AI Providers Supported

#### Google Gemini (Primary - FREE!)
```env
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_AI_API_KEY=your_gemini_key
```

**Models Available:**
- `gemini-1.5-flash`: Fast, cost-effective (FREE - recommended)
- `gemini-1.5-pro`: More powerful, still FREE

#### OpenAI (Alternative - Paid)
```env
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_AI_MODEL=gpt-3.5-turbo
NEXT_PUBLIC_AI_API_KEY=your_openai_key
```

#### Anthropic Claude (Alternative)
```env
NEXT_PUBLIC_AI_PROVIDER=anthropic
NEXT_PUBLIC_AI_MODEL=claude-3-sonnet
NEXT_PUBLIC_AI_API_KEY=your_anthropic_key
```

#### Custom AI Service
```env
NEXT_PUBLIC_AI_PROVIDER=custom
NEXT_PUBLIC_AI_ENDPOINT=https://your-ai-service.com/api
NEXT_PUBLIC_AI_API_KEY=your_custom_key
```

### Fallback System

When AI is not available or fails, the system automatically falls back to:
- **Basic sentiment analysis** using keyword matching
- **Statistical pattern analysis** using predefined rules
- **Simple recommendations** based on mood scores
- **Basic trend detection** using moving averages

## 📊 Data Processing

### What Data is Analyzed

#### Mood Entries
- Mood level (excellent, good, neutral, bad, terrible)
- Energy level (1-10 scale)
- Notes and activities
- Timestamp and frequency

#### Journal Entries
- Entry titles and content
- Associated mood tags
- Writing patterns and themes
- Emotional language detection

### Privacy & Security

#### Data Handling
- **No personal identifiers** sent to AI services
- **Journal content** is processed for analysis
- **Mood data** is used for pattern recognition
- **Data is not stored** by AI providers beyond the request

#### Privacy Controls
- **Optional AI**: Can be disabled for maximum privacy
- **Local Analysis**: Basic features work without external APIs
- **Data Minimization**: Only necessary data is sent to AI services
- **Secure Transmission**: All API calls use HTTPS

## 🎯 Feature Breakdown

### Sentiment Analysis Features

```typescript
interface SentimentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number // -1 to 1
  emotionalKeywords: string[]
  stressIndicators: string[]
}
```

**How it works:**
1. **Text Processing**: Journal entries are cleaned and prepared
2. **AI Analysis**: Sent to Gemini for deep analysis
3. **Keyword Extraction**: Identifies emotional and stress-related words
4. **Score Calculation**: Computes overall sentiment score
5. **Classification**: Categorizes sentiment as positive/negative/neutral

### Predictive Insights Features

```typescript
interface PredictiveInsights {
  moodPrediction: 'likely_improve' | 'likely_decline' | 'stable'
  riskFactors: string[]
  positiveFactors: string[]
  nextWeekPrediction: string
}
```

**How it works:**
1. **Historical Analysis**: Reviews past mood and journal data
2. **Pattern Recognition**: Identifies recurring patterns and trends
3. **AI Prediction**: Uses machine learning to forecast future trends
4. **Factor Analysis**: Identifies contributing factors
5. **Recommendation Generation**: Creates actionable insights

### Personalized Recommendations

**Types of Recommendations:**
- **Mood Improvement**: Activities and practices to boost mood
- **Stress Management**: Techniques for reducing stress
- **Consistency Building**: Tips for maintaining tracking habits
- **Professional Support**: When to seek professional help
- **Lifestyle Changes**: Long-term improvement suggestions

## 🚀 Getting Started

### 1. Enable AI Features (FREE!)

Add to your `.env.local`:
```env
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key
```

### 2. Test the Integration

Open browser console and run:
```javascript
// Test AI integration
window.testAI()
```

### 3. Monitor Usage

Check your Google AI Studio dashboard for:
- Token consumption (FREE tier is very generous)
- API call frequency
- Usage patterns

## 📈 Performance Optimization

### Cost Optimization (FREE with Gemini!)
- **Use Gemini**: Completely free, no costs involved
- **Limit data sent** to AI services
- **Cache results** when possible
- **No usage limits** to worry about

### Speed Optimization
- **Async processing** for non-blocking analysis
- **Progressive loading** of insights
- **Background processing** for heavy analysis
- **Caching** of recent results

## 🔍 Troubleshooting

### Common Issues

#### AI Not Working
1. Check API key is correct
2. Verify environment variables are loaded
3. Restart your development server
4. Check Google AI Studio account status

#### API errors in console
1. Verify your Google AI Studio account is active
2. Check API key permissions
3. Ensure the model name is correct

#### Slow response times
1. Try using `gemini-1.5-flash` for faster responses
2. Reduce the amount of data sent to AI
3. Check your internet connection

#### Fallback to basic analysis
1. This is normal when AI services are unavailable
2. Check your API key and network connection
3. The app will continue working with basic analysis

### Debug Mode

Add to `.env.local`:
```env
NEXT_PUBLIC_DEBUG_AI=true
```

This will show detailed logs in the console.

## 🔮 Future Enhancements

### Planned Features
- **Real-time Analysis**: Live sentiment analysis as you type
- **Voice Analysis**: Analyze voice recordings for emotional tone
- **Image Analysis**: Analyze mood-related photos
- **Social Integration**: Analyze social media patterns
- **Crisis Detection**: Advanced crisis intervention features

### Advanced AI Models
- **Fine-tuned Models**: Custom models trained on mental health data
- **Multi-modal AI**: Combined text, voice, and image analysis
- **Real-time Learning**: Models that adapt to your patterns
- **Predictive Modeling**: Advanced forecasting algorithms

## 📚 API Reference

### Core Functions

```typescript
// Generate enhanced AI insights
generateEnhancedAIInsights(userId: string, aiConfig?: AIModelConfig): Promise<EnhancedAIInsights>

// Check if AI is enabled
isAIEnabled(): boolean

// Get AI configuration
getAIConfig(): AIModelConfig | undefined
```

### Configuration Interface

```typescript
interface AIModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'local' | 'custom'
  model: string
  apiKey?: string
  endpoint?: string
}
```

## 🎯 Best Practices

### For Users
1. **Start with basic analysis** to understand the features
2. **Gradually enable AI** as you become comfortable
3. **Monitor your data** before sending to AI services
4. **Enjoy free AI** with Gemini API
5. **Review insights regularly** for accuracy

### For Developers
1. **Implement proper error handling** for AI failures
2. **Use fallback systems** for reliability
3. **Cache results** to reduce API calls
4. **Monitor usage** patterns
5. **Test thoroughly** with different data scenarios

## 💰 Cost Benefits

### Why Choose Gemini?
- **Completely FREE**: No costs, no credit card required
- **High Quality**: Powered by Google's advanced AI models
- **Fast**: Quick response times for real-time insights
- **Reliable**: Google's infrastructure ensures high availability
- **Privacy**: Google's strong privacy policies protect your data

### Cost Comparison:
- **Gemini**: $0/month (FREE!)
- **OpenAI**: $2-50/month depending on usage
- **Anthropic**: $5-100/month depending on usage

---

**Note**: The AI features are designed to enhance your mental health journey. They provide insights and recommendations but should not replace professional mental health care when needed. 