import { supabase } from './supabase'

// Import types from ai-insights.ts
interface MoodAnalysis {
  averageMood: number
  mostCommonMood: string
  moodTrend: string
  streakDays: number
}

interface JournalAnalysis {
  totalEntries: number
  commonThemes: string[]
  averageLength: number
  emotionalPatterns: string[]
}

// Enhanced AI Insights with real AI integration capabilities
export interface EnhancedAIInsights {
  moodAnalysis: MoodAnalysis
  journalAnalysis: JournalAnalysis
  aiGeneratedInsights: string[]
  sentimentAnalysis: SentimentAnalysis
  predictiveInsights: PredictiveInsights
  personalizedRecommendations: string[]
  weeklyTrend: 'positive' | 'negative' | 'neutral'
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number // -1 to 1
  emotionalKeywords: string[]
  stressIndicators: string[]
}

export interface PredictiveInsights {
  moodPrediction: 'likely_improve' | 'likely_decline' | 'stable'
  riskFactors: string[]
  positiveFactors: string[]
  nextWeekPrediction: string
}

// AI Model Integration Options
export interface AIModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'local' | 'custom'
  model: string
  apiKey?: string
  endpoint?: string
}

// Enhanced AI Insights with real AI capabilities
export async function generateEnhancedAIInsights(
  userId: string, 
  aiConfig?: AIModelConfig
): Promise<EnhancedAIInsights> {
  try {
    // Fetch user's data
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)

    // Basic analysis (existing logic)
    const basicMoodAnalysis = analyzeMoodPatterns(moodEntries || [])
    const basicJournalAnalysis = analyzeJournalPatterns(journalEntries || [])

    // Enhanced AI analysis
    const sentimentAnalysis = await performSentimentAnalysis(journalEntries || [], aiConfig)
    const predictiveInsights = await generatePredictiveInsights(moodEntries || [], journalEntries || [], aiConfig)
    const aiGeneratedInsights = await generateAIInsights(journalEntries || [], moodEntries || [], aiConfig)
    const personalizedRecommendations = await generatePersonalizedRecommendations(
      basicMoodAnalysis, 
      basicJournalAnalysis, 
      sentimentAnalysis, 
      predictiveInsights,
      aiConfig
    )

    return {
      moodAnalysis: basicMoodAnalysis,
      journalAnalysis: basicJournalAnalysis,
      sentimentAnalysis,
      predictiveInsights,
      aiGeneratedInsights,
      personalizedRecommendations,
      weeklyTrend: determineWeeklyTrend(basicMoodAnalysis)
    }
  } catch (error) {
    console.error('Error generating enhanced AI insights:', error)
    throw error
  }
}

// Real AI Integration Functions
async function performSentimentAnalysis(
  journalEntries: any[], 
  aiConfig?: AIModelConfig
): Promise<SentimentAnalysis> {
  if (!aiConfig || journalEntries.length === 0) {
    // Fallback to basic sentiment analysis
    return performBasicSentimentAnalysis(journalEntries)
  }

  try {
    const journalText = journalEntries
      .map(entry => `${entry.title} ${entry.content}`)
      .join(' ')

    if (aiConfig.provider === 'gemini') {
      return await analyzeSentimentWithGemini(journalText, aiConfig)
    } else if (aiConfig.provider === 'openai') {
      return await analyzeSentimentWithOpenAI(journalText, aiConfig)
    } else {
      return performBasicSentimentAnalysis(journalEntries)
    }
  } catch (error) {
    console.error('AI sentiment analysis failed, falling back to basic analysis:', error)
    return performBasicSentimentAnalysis(journalEntries)
  }
}

async function generatePredictiveInsights(
  moodEntries: any[], 
  journalEntries: any[], 
  aiConfig?: AIModelConfig
): Promise<PredictiveInsights> {
  if (!aiConfig) {
    return generateBasicPredictiveInsights(moodEntries, journalEntries)
  }

  try {
    const dataSummary = {
      moodHistory: moodEntries.map(entry => ({
        mood: entry.mood,
        energy: entry.energy_level,
        date: entry.created_at,
        notes: entry.notes
      })),
      journalThemes: journalEntries.map(entry => ({
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        date: entry.created_at
      }))
    }

    if (aiConfig.provider === 'gemini') {
      return await generatePredictionsWithGemini(dataSummary, aiConfig)
    } else if (aiConfig.provider === 'openai') {
      return await generatePredictionsWithOpenAI(dataSummary, aiConfig)
    } else {
      return generateBasicPredictiveInsights(moodEntries, journalEntries)
    }
  } catch (error) {
    console.error('AI prediction failed, falling back to basic analysis:', error)
    return generateBasicPredictiveInsights(moodEntries, journalEntries)
  }
}

async function generateAIInsights(
  journalEntries: any[], 
  moodEntries: any[], 
  aiConfig?: AIModelConfig
): Promise<string[]> {
  if (!aiConfig) {
    return generateBasicInsights(journalEntries, moodEntries)
  }

  try {
    const context = {
      journalEntries: journalEntries.slice(0, 10), // Limit for API
      moodEntries: moodEntries.slice(0, 20),
      userPatterns: analyzeUserPatterns(moodEntries, journalEntries)
    }

    if (aiConfig.provider === 'gemini') {
      return await generateInsightsWithGemini(context, aiConfig)
    } else if (aiConfig.provider === 'openai') {
      return await generateInsightsWithOpenAI(context, aiConfig)
    } else {
      return generateBasicInsights(journalEntries, moodEntries)
    }
  } catch (error) {
    console.error('AI insights generation failed, falling back to basic analysis:', error)
    return generateBasicInsights(journalEntries, moodEntries)
  }
}

async function generatePersonalizedRecommendations(
  moodAnalysis: any,
  journalAnalysis: any,
  sentimentAnalysis: SentimentAnalysis,
  predictiveInsights: PredictiveInsights,
  aiConfig?: AIModelConfig
): Promise<string[]> {
  if (!aiConfig) {
    return generateBasicRecommendations(moodAnalysis, journalAnalysis)
  }

  try {
    const context = {
      moodAnalysis,
      journalAnalysis,
      sentimentAnalysis,
      predictiveInsights
    }

    if (aiConfig.provider === 'gemini') {
      return await generateRecommendationsWithGemini(context, aiConfig)
    } else if (aiConfig.provider === 'openai') {
      return await generateRecommendationsWithOpenAI(context, aiConfig)
    } else {
      return generateBasicRecommendations(moodAnalysis, journalAnalysis)
    }
  } catch (error) {
    console.error('AI recommendations failed, falling back to basic analysis:', error)
    return generateBasicRecommendations(moodAnalysis, journalAnalysis)
  }
}

// Gemini API Integration
async function analyzeSentimentWithGemini(text: string, config: AIModelConfig): Promise<SentimentAnalysis> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a mental health AI assistant. Analyze the sentiment of the following journal entries and return a JSON response with:
          {
            "overallSentiment": "positive|negative|neutral",
            "sentimentScore": -1 to 1,
            "emotionalKeywords": ["keyword1", "keyword2"],
            "stressIndicators": ["indicator1", "indicator2"]
          }
          
          Journal entries: ${text.substring(0, 2000)}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    })
  })

  const data = await response.json()
  const analysis = JSON.parse(data.candidates[0].content.parts[0].text)
  
  return {
    overallSentiment: analysis.overallSentiment,
    sentimentScore: analysis.sentimentScore,
    emotionalKeywords: analysis.emotionalKeywords,
    stressIndicators: analysis.stressIndicators
  }
}

async function generatePredictionsWithGemini(dataSummary: any, config: AIModelConfig): Promise<PredictiveInsights> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a mental health AI assistant. Analyze patterns and predict future mental health trends. Based on this mental health data, provide predictions and insights. Return JSON:
          {
            "moodPrediction": "likely_improve|likely_decline|stable",
            "riskFactors": ["factor1", "factor2"],
            "positiveFactors": ["factor1", "factor2"],
            "nextWeekPrediction": "detailed prediction text"
          }
          
          Data: ${JSON.stringify(dataSummary)}`
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600
      }
    })
  })

  const data = await response.json()
  const predictions = JSON.parse(data.candidates[0].content.parts[0].text)
  
  return {
    moodPrediction: predictions.moodPrediction,
    riskFactors: predictions.riskFactors,
    positiveFactors: predictions.positiveFactors,
    nextWeekPrediction: predictions.nextWeekPrediction
  }
}

async function generateInsightsWithGemini(context: any, config: AIModelConfig): Promise<string[]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a mental health AI assistant. Provide personalized insights based on user data. Based on this mental health data, provide 3-5 personalized insights. Return as JSON array:
          ["insight1", "insight2", "insight3"]
          
          Context: ${JSON.stringify(context)}`
        }]
      }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500
      }
    })
  })

  const data = await response.json()
  return JSON.parse(data.candidates[0].content.parts[0].text)
}

async function generateRecommendationsWithGemini(context: any, config: AIModelConfig): Promise<string[]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a mental health AI assistant. Provide actionable, personalized recommendations. Based on this mental health analysis, provide 3-5 actionable recommendations. Return as JSON array:
          ["recommendation1", "recommendation2", "recommendation3"]
          
          Analysis: ${JSON.stringify(context)}`
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500
      }
    })
  })

  const data = await response.json()
  return JSON.parse(data.candidates[0].content.parts[0].text)
}

// OpenAI Integration (kept for compatibility)
async function analyzeSentimentWithOpenAI(text: string, config: AIModelConfig): Promise<SentimentAnalysis> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a mental health AI assistant. Analyze the sentiment of the following journal entries and provide insights.'
        },
        {
          role: 'user',
          content: `Analyze the sentiment of these journal entries and return a JSON response with:
          {
            "overallSentiment": "positive|negative|neutral",
            "sentimentScore": -1 to 1,
            "emotionalKeywords": ["keyword1", "keyword2"],
            "stressIndicators": ["indicator1", "indicator2"]
          }
          
          Journal entries: ${text.substring(0, 2000)}`
        }
      ],
      temperature: 0.3
    })
  })

  const data = await response.json()
  const analysis = JSON.parse(data.choices[0].message.content)
  
  return {
    overallSentiment: analysis.overallSentiment,
    sentimentScore: analysis.sentimentScore,
    emotionalKeywords: analysis.emotionalKeywords,
    stressIndicators: analysis.stressIndicators
  }
}

async function generatePredictionsWithOpenAI(dataSummary: any, config: AIModelConfig): Promise<PredictiveInsights> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a mental health AI assistant. Analyze patterns and predict future mental health trends.'
        },
        {
          role: 'user',
          content: `Based on this mental health data, provide predictions and insights. Return JSON:
          {
            "moodPrediction": "likely_improve|likely_decline|stable",
            "riskFactors": ["factor1", "factor2"],
            "positiveFactors": ["factor1", "factor2"],
            "nextWeekPrediction": "detailed prediction text"
          }
          
          Data: ${JSON.stringify(dataSummary)}`
        }
      ],
      temperature: 0.4
    })
  })

  const data = await response.json()
  const predictions = JSON.parse(data.choices[0].message.content)
  
  return {
    moodPrediction: predictions.moodPrediction,
    riskFactors: predictions.riskFactors,
    positiveFactors: predictions.positiveFactors,
    nextWeekPrediction: predictions.nextWeekPrediction
  }
}

async function generateInsightsWithOpenAI(context: any, config: AIModelConfig): Promise<string[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a mental health AI assistant. Provide personalized insights based on user data.'
        },
        {
          role: 'user',
          content: `Based on this mental health data, provide 3-5 personalized insights. Return as JSON array:
          ["insight1", "insight2", "insight3"]
          
          Context: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.5
    })
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

async function generateRecommendationsWithOpenAI(context: any, config: AIModelConfig): Promise<string[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a mental health AI assistant. Provide actionable, personalized recommendations.'
        },
        {
          role: 'user',
          content: `Based on this mental health analysis, provide 3-5 actionable recommendations. Return as JSON array:
          ["recommendation1", "recommendation2", "recommendation3"]
          
          Analysis: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.4
    })
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

// Fallback Functions (Basic Analysis)
function performBasicSentimentAnalysis(journalEntries: any[]): SentimentAnalysis {
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'positive', 'grateful']
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'stress']
  const stressWords = ['stress', 'anxiety', 'overwhelmed', 'tired', 'exhausted', 'pressure']

  let positiveCount = 0
  let negativeCount = 0
  let stressCount = 0
  const emotionalKeywords: string[] = []
  const stressIndicators: string[] = []

  journalEntries.forEach(entry => {
    const text = `${entry.title} ${entry.content}`.toLowerCase()
    
    positiveWords.forEach(word => {
      if (text.includes(word)) {
        positiveCount++
        emotionalKeywords.push(word)
      }
    })
    
    negativeWords.forEach(word => {
      if (text.includes(word)) {
        negativeCount++
        emotionalKeywords.push(word)
      }
    })
    
    stressWords.forEach(word => {
      if (text.includes(word)) {
        stressCount++
        stressIndicators.push(word)
      }
    })
  })

  const totalEntries = journalEntries.length
  const sentimentScore = totalEntries > 0 ? (positiveCount - negativeCount) / totalEntries : 0
  
  let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  if (sentimentScore > 0.1) overallSentiment = 'positive'
  else if (sentimentScore < -0.1) overallSentiment = 'negative'

  return {
    overallSentiment,
    sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
    emotionalKeywords: [...new Set(emotionalKeywords)],
    stressIndicators: [...new Set(stressIndicators)]
  }
}

function generateBasicPredictiveInsights(moodEntries: any[], journalEntries: any[]): PredictiveInsights {
  // Basic prediction logic
  const recentMoods = moodEntries.slice(0, 7).map(entry => entry.mood)
  const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
  
  const recentScores = recentMoods.map(mood => moodScores[mood as keyof typeof moodScores])
  const avgRecentScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length
  
  let moodPrediction: 'likely_improve' | 'likely_decline' | 'stable' = 'stable'
  if (avgRecentScore > 3.5) moodPrediction = 'likely_improve'
  else if (avgRecentScore < 2.5) moodPrediction = 'likely_decline'

  return {
    moodPrediction,
    riskFactors: avgRecentScore < 3 ? ['Low mood trend', 'Potential stress indicators'] : [],
    positiveFactors: avgRecentScore > 3.5 ? ['Positive mood trend', 'Good consistency'] : [],
    nextWeekPrediction: `Based on recent patterns, your mood is likely to ${moodPrediction.replace('_', ' ')}.`
  }
}

function generateBasicInsights(journalEntries: any[], moodEntries: any[]): string[] {
  const insights: string[] = []
  
  if (journalEntries.length > 0) {
    insights.push('You\'ve been actively journaling, which is great for self-reflection.')
  }
  
  if (moodEntries.length > 5) {
    insights.push('Consistent mood tracking helps identify patterns and triggers.')
  }
  
  return insights
}

function generateBasicRecommendations(moodAnalysis: any, journalAnalysis: any): string[] {
  const recommendations: string[] = []
  
  if (moodAnalysis.averageMood < 3) {
    recommendations.push('Consider reaching out to a mental health professional')
  }
  
  if (journalAnalysis.commonThemes.length === 0) {
    recommendations.push('Try adding tags to your journal entries for better organization')
  }
  
  return recommendations
}

function analyzeUserPatterns(moodEntries: any[], journalEntries: any[]): any {
  // Basic pattern analysis
  return {
    moodFrequency: moodEntries.length,
    journalFrequency: journalEntries.length,
    averageMood: moodEntries.length > 0 ? 
      moodEntries.reduce((sum, entry) => sum + (entry.energy_level || 5), 0) / moodEntries.length : 0
  }
}

// Import existing functions from ai-insights.ts

// Re-export the functions we need
function analyzeMoodPatterns(moodEntries: any[]): MoodAnalysis {
  if (moodEntries.length === 0) {
    return {
      averageMood: 3,
      mostCommonMood: 'neutral',
      moodTrend: 'stable',
      streakDays: 0
    }
  }

  // Calculate average mood
  const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
  const scores = moodEntries.map(entry => moodScores[entry.mood as keyof typeof moodScores])
  const averageMood = scores.reduce((sum, score) => sum + score, 0) / scores.length

  // Find most common mood
  const moodCounts: Record<string, number> = {}
  moodEntries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
  })
  const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b)

  // Calculate streak
  let streakDays = 0
  const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const currentDate = new Date(sortedEntries[i].created_at)
    const nextDate = new Date(sortedEntries[i + 1].created_at)
    const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
    if (dayDiff <= 1) {
      streakDays++
    } else {
      break
    }
  }

  return {
    averageMood,
    mostCommonMood,
    moodTrend: 'stable',
    streakDays
  }
}

function analyzeJournalPatterns(journalEntries: any[]): JournalAnalysis {
  if (journalEntries.length === 0) {
    return {
      totalEntries: 0,
      commonThemes: [],
      averageLength: 0,
      emotionalPatterns: []
    }
  }

  // Calculate average length
  const totalLength = journalEntries.reduce((sum, entry) => sum + entry.content.length, 0)
  const averageLength = Math.round(totalLength / journalEntries.length)

  // Extract common themes from tags
  const allTags: string[] = []
  journalEntries.forEach(entry => {
    if (entry.tags && Array.isArray(entry.tags)) {
      allTags.push(...entry.tags)
    }
  })
  
  const tagCounts: Record<string, number> = {}
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  })
  
  const commonThemes = Object.keys(tagCounts)
    .sort((a, b) => tagCounts[b] - tagCounts[a])
    .slice(0, 5)

  return {
    totalEntries: journalEntries.length,
    commonThemes,
    averageLength,
    emotionalPatterns: []
  }
}

function determineWeeklyTrend(moodAnalysis: MoodAnalysis): 'positive' | 'negative' | 'neutral' {
  if (moodAnalysis.averageMood > 3.5) return 'positive'
  if (moodAnalysis.averageMood < 2.5) return 'negative'
  return 'neutral'
} 