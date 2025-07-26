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
  provider: 'gemini' | 'openai' | 'anthropic' | 'huggingface' | 'local' | 'custom'
  model: string
  apiKey?: string
  endpoint?: string
  huggingfaceToken?: string
}

// Cache management
const aiCache = new Map<string, { data: EnhancedAIInsights; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// API usage tracking
const apiUsage = new Map<string, { count: number; lastReset: number }>()
const DAILY_LIMIT = 1000
const RATE_LIMIT_RESET_HOURS = 24

export function getAPIUsage(userId: string): { count: number; limit: number; resetTime: number } {
  const now = Date.now()
  const userUsage = apiUsage.get(userId)
  
  if (!userUsage || (now - userUsage.lastReset) > (RATE_LIMIT_RESET_HOURS * 60 * 60 * 1000)) {
    // Reset usage counter
    apiUsage.set(userId, { count: 0, lastReset: now })
    return { count: 0, limit: DAILY_LIMIT, resetTime: now + (RATE_LIMIT_RESET_HOURS * 60 * 60 * 1000) }
  }
  
  return { 
    count: userUsage.count, 
    limit: DAILY_LIMIT, 
    resetTime: userUsage.lastReset + (RATE_LIMIT_RESET_HOURS * 60 * 60 * 1000) 
  }
}

export function incrementAPIUsage(userId: string): boolean {
  const usage = getAPIUsage(userId)
  const userUsage = apiUsage.get(userId)!
  
  if (usage.count >= DAILY_LIMIT) {
    return false // Rate limited
  }
  
  userUsage.count++
  apiUsage.set(userId, userUsage)
  return true // Can make API call
}

export function isRateLimited(userId: string): boolean {
  const usage = getAPIUsage(userId)
  return usage.count >= usage.limit
}

export function clearAICache(userId: string) {
  console.log('🗑️ Clearing AI cache for user:', userId)
  const keysToDelete: string[] = []
  
  for (const [key] of aiCache) {
    if (key.startsWith(`${userId}_`)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => aiCache.delete(key))
  console.log(`🗑️ Cleared ${keysToDelete.length} cached entries for user ${userId}`)
}

export function clearAllAICache() {
  console.log('🗑️ Clearing all AI cache')
  aiCache.clear()
}

// Clear cache when new data is added
export function clearUserCache(userId: string) {
  clearAICache(userId)
}

export async function generateEnhancedAIInsights(
  userId: string, 
  aiConfig?: AIModelConfig
): Promise<EnhancedAIInsights> {
  console.log('🎯 Starting enhanced AI insights generation for user:', userId)
  console.log('🔧 AI Config:', aiConfig)
  
  try {
    // Fetch user's data first to check if anything has changed
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

    console.log('📊 Data fetched:')
    console.log('  - Mood entries:', moodEntries?.length || 0)
    console.log('  - Journal entries:', journalEntries?.length || 0)

    // Create a data hash to check if anything has changed
    const dataHash = JSON.stringify({
      moodCount: moodEntries?.length || 0,
      journalCount: journalEntries?.length || 0,
      latestMood: moodEntries?.[0]?.created_at || '',
      latestJournal: journalEntries?.[0]?.created_at || '',
      provider: aiConfig?.provider || 'basic'
    })
    
    // Check cache with data hash
    const cacheKey = `${userId}_${dataHash}`
    const cached = aiCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Using cached AI insights (data unchanged)')
      return cached.data
    }
    
    console.log('🔄 Data has changed or cache expired, regenerating insights')

    // Basic analysis (existing logic)
    const basicMoodAnalysis = analyzeMoodPatterns(moodEntries || [])
    const basicJournalAnalysis = analyzeJournalPatterns(journalEntries || [])

    console.log('📈 Basic analysis completed:')
    console.log('  - Mood analysis:', basicMoodAnalysis)
    console.log('  - Journal analysis:', basicJournalAnalysis)

    // Optimize AI calls - only make calls if we have sufficient data
    const hasEnoughData = (moodEntries?.length || 0) > 0 || (journalEntries?.length || 0) > 0
    
    let sentimentAnalysis: SentimentAnalysis
    let predictiveInsights: PredictiveInsights
    let aiGeneratedInsights: string[]
    let personalizedRecommendations: string[]

    if (hasEnoughData && aiConfig) {
      console.log('🤖 Making AI calls...')
      
      // Check rate limits before making AI calls
      if (isRateLimited(userId)) {
        console.log('⚠️ Rate limit exceeded, using basic analysis')
        sentimentAnalysis = performBasicSentimentAnalysis(journalEntries || [])
        predictiveInsights = generateBasicPredictiveInsights(moodEntries || [], journalEntries || [])
        aiGeneratedInsights = generateBasicInsights(journalEntries || [], moodEntries || [])
        personalizedRecommendations = generateBasicRecommendations(basicMoodAnalysis, basicJournalAnalysis)
      } else {
        // Make AI calls in parallel to reduce total time
        let sentimentResult: SentimentAnalysis
        let predictiveResult: PredictiveInsights
        let insightsResult: string[]
        
        try {
          console.log('🚀 Starting parallel AI calls...')
          const results = await Promise.all([
            performSentimentAnalysis(journalEntries || [], aiConfig),
            generatePredictiveInsights(moodEntries || [], journalEntries || [], aiConfig),
            generateAIInsights(journalEntries || [], moodEntries || [], aiConfig)
          ])
          
          sentimentResult = results[0]
          predictiveResult = results[1]
          insightsResult = results[2]
          
          console.log('✅ All AI calls completed successfully')
          console.log('  - Sentiment result:', sentimentResult)
          console.log('  - Predictive result:', predictiveResult)
          console.log('  - Insights result count:', insightsResult.length)
          
          // Increment API usage after successful AI calls
          incrementAPIUsage(userId)
          incrementAPIUsage(userId)
          incrementAPIUsage(userId)
        } catch (error) {
          console.error('❌ AI calls failed, falling back to basic analysis:', error)
          console.error('❌ Error details:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            name: (error as Error).name
          })
          sentimentResult = performBasicSentimentAnalysis(journalEntries || [])
          predictiveResult = generateBasicPredictiveInsights(moodEntries || [], journalEntries || [])
          insightsResult = generateBasicInsights(journalEntries || [], moodEntries || [])
        }
        
        // Generate recommendations using the already computed sentiment and predictions
        let recommendationsResult: string[]
        try {
          recommendationsResult = await generatePersonalizedRecommendations(
            basicMoodAnalysis, 
            basicJournalAnalysis, 
            sentimentResult,
            predictiveResult,
            aiConfig
          )
          
          // Increment API usage for recommendations call
          incrementAPIUsage(userId)
        } catch (error) {
          console.error('❌ Recommendations failed, using basic recommendations:', error)
          recommendationsResult = generateBasicRecommendations(basicMoodAnalysis, basicJournalAnalysis)
        }
        
        sentimentAnalysis = sentimentResult
        predictiveInsights = predictiveResult
        aiGeneratedInsights = insightsResult
        personalizedRecommendations = recommendationsResult
      }
    } else {
      console.log('⚠️ Using basic analysis (no AI calls)')
      sentimentAnalysis = performBasicSentimentAnalysis(journalEntries || [])
      predictiveInsights = generateBasicPredictiveInsights(moodEntries || [], journalEntries || [])
      aiGeneratedInsights = generateBasicInsights(journalEntries || [], moodEntries || [])
      personalizedRecommendations = generateBasicRecommendations(basicMoodAnalysis, basicJournalAnalysis)
    }

    console.log('🤖 AI analysis completed:')
    console.log('  - Sentiment analysis:', sentimentAnalysis)
    console.log('  - Predictive insights:', predictiveInsights)
    console.log('  - AI insights count:', aiGeneratedInsights.length)
    console.log('  - Recommendations count:', personalizedRecommendations.length)

    const result = {
      moodAnalysis: basicMoodAnalysis,
      journalAnalysis: basicJournalAnalysis,
      sentimentAnalysis,
      predictiveInsights,
      aiGeneratedInsights,
      personalizedRecommendations,
      weeklyTrend: determineWeeklyTrend(basicMoodAnalysis)
    }

    // Cache the result
    aiCache.set(cacheKey, { data: result, timestamp: Date.now() })
    console.log('💾 Cached AI insights for 5 minutes')

    return result
  } catch (error) {
    console.error('❌ Error generating enhanced AI insights:', error)
    throw error
  }
}

// Real AI Integration Functions
async function performSentimentAnalysis(
  journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>, 
  aiConfig?: AIModelConfig
): Promise<SentimentAnalysis> {
  console.log('🤖 Starting sentiment analysis...')
  console.log('📊 Journal entries count:', journalEntries.length)
  console.log('🔧 AI Config:', aiConfig)
  
  if (!aiConfig || journalEntries.length === 0) {
    console.log('⚠️ No AI config or no journal entries, using basic analysis')
    return performBasicSentimentAnalysis(journalEntries)
  }

  try {
    const journalText = journalEntries
      .map(entry => `${entry.title || ''} ${entry.content || ''}`)
      .join(' ')
    
    console.log('📝 Combined journal text length:', journalText.length)
    console.log('📝 Journal text preview:', journalText.substring(0, 200) + '...')

    // Use Hugging Face for sentiment analysis (more efficient)
    if (aiConfig.huggingfaceToken) {
      console.log('🚀 Using Hugging Face for sentiment analysis')
      console.log('🔧 HuggingFace Token:', aiConfig.huggingfaceToken ? 'SET' : 'NOT SET')
      try {
        const result = await analyzeSentimentWithHuggingFace(journalText, aiConfig)
        console.log('✅ Hugging Face sentiment analysis completed:', result)
        return result
      } catch (error: unknown) {
        console.error('❌ Hugging Face sentiment analysis failed:', error)
        console.error('❌ Error details:', {
          message: (error as Error).message,
          stack: (error as Error).stack
        })
        console.log('🔄 Falling back to basic sentiment analysis...')
        return performBasicSentimentAnalysis(journalEntries)
      }
    } else if (aiConfig.provider === 'gemini') {
      console.log('🚀 Using Gemini for sentiment analysis')
      try {
        return await analyzeSentimentWithGemini(journalText, aiConfig)
      } catch (error: unknown) {
        if ((error as Error).message?.includes('429') || (error as Error).message?.includes('quota')) {
          console.log('⚠️ Rate limit exceeded, using basic analysis')
          console.log('💡 Consider upgrading to paid plan or wait for quota reset')
        } else {
          console.error('❌ Gemini API error:', error)
        }
        return performBasicSentimentAnalysis(journalEntries)
      }
    } else if (aiConfig.provider === 'openai') {
      console.log('🚀 Using OpenAI for sentiment analysis')
      return await analyzeSentimentWithOpenAI(journalText, aiConfig)
    } else {
      console.log('⚠️ Unknown AI provider, using basic analysis')
      return performBasicSentimentAnalysis(journalEntries)
    }
  } catch (error) {
    console.error('❌ AI sentiment analysis failed, falling back to basic analysis:', error)
    return performBasicSentimentAnalysis(journalEntries)
  }
}

async function generatePredictiveInsights(
  moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>, 
  journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>, 
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
      try {
        return await generatePredictionsWithGemini(dataSummary, aiConfig)
      } catch (error: unknown) {
        if ((error as Error).message?.includes('429') || (error as Error).message?.includes('quota')) {
          console.log('⚠️ Rate limit exceeded, using basic predictions')
        } else {
          console.error('❌ Gemini predictions failed:', error)
        }
        return generateBasicPredictiveInsights(moodEntries, journalEntries)
      }
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
  journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>, 
  moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>, 
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
      try {
        return await generateInsightsWithGemini(context, aiConfig)
      } catch (error: unknown) {
        if ((error as Error).message?.includes('429') || (error as Error).message?.includes('quota')) {
          console.log('⚠️ Rate limit exceeded, using basic insights')
        } else {
          console.error('❌ Gemini insights failed:', error)
        }
        return generateBasicInsights(journalEntries, moodEntries)
      }
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
  moodAnalysis: MoodAnalysis,
  journalAnalysis: JournalAnalysis,
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
      try {
        return await generateRecommendationsWithGemini(context, aiConfig)
      } catch (error: unknown) {
        if ((error as Error).message?.includes('429') || (error as Error).message?.includes('quota')) {
          console.log('⚠️ Rate limit exceeded, using basic recommendations')
        } else {
          console.error('❌ Gemini recommendations failed:', error)
        }
        return generateBasicRecommendations(moodAnalysis, journalAnalysis)
      }
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

// Hugging Face API Integration for Sentiment Analysis
async function analyzeSentimentWithHuggingFace(text: string, config: AIModelConfig): Promise<SentimentAnalysis> {
  console.log('🚀 Calling Hugging Face API for sentiment analysis...')
  
  // Check if we have the required token
  if (!config.huggingfaceToken) {
    console.log('⚠️ No Hugging Face token provided, falling back to basic analysis')
    return performBasicSentimentAnalysis([])
  }
  
  try {
    // Use a popular sentiment analysis model
    const model = 'cardiffnlp/twitter-roberta-base-sentiment'
    const requestBody = {
      inputs: text.substring(0, 500) // Limit text length for API
    }
    
    console.log('📤 Sending request to Hugging Face API...')
    console.log('🔗 URL:', `https://api-inference.huggingface.co/models/${model}`)
    console.log('📝 Request body:', requestBody)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let response: Response
    try {
      response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.huggingfaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('📥 Response status:', response.status)
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Hugging Face API error:', response.status, errorText)
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if ((error as Error).name === 'AbortError') {
        console.error('❌ Hugging Face API request timed out after 30 seconds')
        throw new Error('Hugging Face API request timed out')
      }
      throw error
    }

    const data = await response.json()
    console.log('📥 Hugging Face API response:', data)
    
    if (!Array.isArray(data) || data.length === 0) {
      console.error('❌ Invalid Hugging Face response structure:', data)
      throw new Error('Invalid Hugging Face response structure')
    }
    
    // Hugging Face returns array of predictions with scores
    const predictions = data[0]
    console.log('📊 Sentiment predictions:', predictions)
    
    // Map Hugging Face labels to our sentiment types
    let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    let sentimentScore = 0
    
    if (predictions.label === 'POS') {
      overallSentiment = 'positive'
      sentimentScore = predictions.score
    } else if (predictions.label === 'NEG') {
      overallSentiment = 'negative'
      sentimentScore = -predictions.score
    } else {
      overallSentiment = 'neutral'
      sentimentScore = 0
    }
    
    // Enhanced sentiment detection based on emotional keywords
    const emotionalKeywords = extractEmotionalKeywords(text)
    const stressIndicators = extractStressIndicators(text)
    
    // Adjust sentiment based on keyword analysis
    const positiveKeywords = emotionalKeywords.filter(keyword => 
      ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'positive', 'grateful', 'joy', 'excited', 'pleased', 'content', 'satisfied', 'blessed', 'fortunate', 'lucky', 'cheerful', 'optimistic', 'hopeful', 'inspired'].includes(keyword)
    )
    
    const negativeKeywords = emotionalKeywords.filter(keyword => 
      ['sad', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'stress', 'angry', 'frustrated', 'disappointed', 'upset', 'hurt', 'lonely', 'hopeless', 'desperate', 'miserable', 'dreadful', 'horrible', 'devastated'].includes(keyword)
    )
    
    // Override sentiment if keyword analysis is more definitive
    if (positiveKeywords.length > negativeKeywords.length && positiveKeywords.length > 0) {
      overallSentiment = 'positive'
      sentimentScore = Math.max(sentimentScore, 0.3) // Ensure positive score
    } else if (negativeKeywords.length > positiveKeywords.length && negativeKeywords.length > 0) {
      overallSentiment = 'negative'
      sentimentScore = Math.min(sentimentScore, -0.3) // Ensure negative score
    }
    
    // Extract emotional keywords using basic analysis (already extracted above)
    
    console.log('✅ Hugging Face sentiment analysis result:', {
      overallSentiment,
      sentimentScore,
      emotionalKeywords,
      stressIndicators
    })
    
    return {
      overallSentiment,
      sentimentScore,
      emotionalKeywords,
      stressIndicators
    }
  } catch (error) {
    console.error('❌ Hugging Face sentiment analysis failed:', error)
    // Fallback to basic analysis instead of throwing
    return performBasicSentimentAnalysis([])
  }
}

// Helper functions for keyword extraction
function extractEmotionalKeywords(text: string): string[] {
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'positive', 'grateful', 'joy', 'excited', 'pleased', 'content', 'satisfied', 'blessed', 'fortunate', 'lucky', 'cheerful', 'optimistic', 'hopeful', 'inspired']
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'stress', 'angry', 'frustrated', 'disappointed', 'upset', 'hurt', 'lonely', 'hopeless', 'desperate', 'miserable', 'dreadful', 'horrible', 'devastated']
  
  const keywords: string[] = []
  const lowerText = text.toLowerCase()
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      keywords.push(word)
    }
  })
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      keywords.push(word)
    }
  })
  
  return [...new Set(keywords)]
}

function extractStressIndicators(text: string): string[] {
  const stressWords = ['stress', 'anxiety', 'overwhelmed', 'tired', 'exhausted', 'pressure', 'tense', 'nervous', 'panicked', 'worried', 'concerned', 'fearful', 'scared', 'frightened', 'terrified', 'paranoid', 'obsessed', 'compulsive']
  
  const indicators: string[] = []
  const lowerText = text.toLowerCase()
  
  stressWords.forEach(word => {
    if (lowerText.includes(word)) {
      indicators.push(word)
    }
  })
  
  return [...new Set(indicators)]
}

// Gemini API Integration
async function analyzeSentimentWithGemini(text: string, config: AIModelConfig): Promise<SentimentAnalysis> {
  console.log('🚀 Calling Gemini API for sentiment analysis...')
  
  // Check if we have the required API key
  if (!config.apiKey) {
    console.log('⚠️ No Gemini API key provided, falling back to basic analysis')
    return performBasicSentimentAnalysis([])
  }
  

  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a mental health AI assistant. Analyze the sentiment of the following journal entries and return ONLY a valid JSON response (no markdown formatting, no code blocks) with this exact structure:
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📥 Gemini API response:', data)
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('❌ Invalid Gemini API response structure:', data)
      throw new Error('Invalid Gemini API response structure')
    }
    
    let responseText = data.candidates[0].content.parts[0].text
    console.log('📝 Raw Gemini response text:', responseText)
    
    // Clean up the response text to extract JSON
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    console.log('🧹 Cleaned response text:', responseText)
    
    try {
      const analysis = JSON.parse(responseText)
      console.log('✅ Parsed sentiment analysis:', analysis)
      
      return {
        overallSentiment: analysis.overallSentiment,
        sentimentScore: analysis.sentimentScore,
        emotionalKeywords: analysis.emotionalKeywords,
        stressIndicators: analysis.stressIndicators
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('❌ Problematic text:', responseText)
      
      // Try to fix common JSON issues
      try {
        let fixedText = responseText
        fixedText = repairJSONString(fixedText)
        
        console.log('🔧 Attempting to fix JSON:', fixedText)
        const fixedAnalysis = JSON.parse(fixedText)
        console.log('✅ Fixed JSON parsed successfully:', fixedAnalysis)
        return {
          overallSentiment: fixedAnalysis.overallSentiment,
          sentimentScore: fixedAnalysis.sentimentScore,
          emotionalKeywords: fixedAnalysis.emotionalKeywords,
          stressIndicators: fixedAnalysis.stressIndicators
        }
      } catch (fixError) {
        console.error('❌ JSON fix attempt failed:', fixError)
        // Fallback: return basic sentiment analysis
        return performBasicSentimentAnalysis([])
      }
    }
  } catch (error) {
    console.error('❌ Gemini sentiment analysis failed:', error)
    throw error
  }
}

async function generatePredictionsWithGemini(dataSummary: { moodHistory: Array<{ mood: string; energy?: number; date: string; notes?: string }>; journalThemes: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; date: string }> }, config: AIModelConfig): Promise<PredictiveInsights> {
  console.log('🚀 Calling Gemini API for predictions...')
  
  // Check if we have the required API key
  if (!config.apiKey) {
    console.log('⚠️ No Gemini API key provided, falling back to basic predictions')
    return generateBasicPredictiveInsights([], [])
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a mental health AI assistant. Analyze patterns and predict future mental health trends. Based on this mental health data, provide predictions and insights. Return ONLY a valid JSON response (no markdown formatting, no code blocks) with this exact structure:
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📥 Gemini API response:', data)
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('❌ Invalid Gemini API response structure:', data)
      throw new Error('Invalid Gemini API response structure')
    }
    
    let responseText = data.candidates[0].content.parts[0].text
    console.log('📝 Raw Gemini response text:', responseText)
    
    // Enhanced cleanup for malformed JSON
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    // Remove any trailing commas or incomplete JSON
    responseText = responseText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
    
    console.log('🧹 Cleaned response text:', responseText)
    
    try {
      const predictions = JSON.parse(responseText)
      console.log('✅ Parsed predictions:', predictions)
      return {
        moodPrediction: predictions.moodPrediction || 'stable',
        riskFactors: predictions.riskFactors || [],
        positiveFactors: predictions.positiveFactors || [],
        nextWeekPrediction: predictions.nextWeekPrediction || 'No specific prediction available'
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('❌ Problematic text:', responseText)
      
      // Try to fix common JSON issues
      try {
        let fixedText = responseText
        fixedText = repairJSONString(fixedText)
        
        console.log('🔧 Attempting to fix JSON:', fixedText)
        const fixedPredictions = JSON.parse(fixedText)
        console.log('✅ Fixed JSON parsed successfully:', fixedPredictions)
        return {
          moodPrediction: fixedPredictions.moodPrediction || 'stable',
          riskFactors: fixedPredictions.riskFactors || [],
          positiveFactors: fixedPredictions.positiveFactors || [],
          nextWeekPrediction: fixedPredictions.nextWeekPrediction || 'No specific prediction available'
        }
      } catch (fixError) {
        console.error('❌ JSON fix attempt failed:', fixError)
        // Fallback: return basic predictions
        return {
          moodPrediction: 'stable',
          riskFactors: [],
          positiveFactors: [],
          nextWeekPrediction: 'Continue monitoring your patterns'
        }
      }
    }
  } catch (error) {
    console.error('❌ Gemini predictions failed:', error)
    throw error
  }
}

async function generateInsightsWithGemini(context: { journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>; moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>; userPatterns: { moodFrequency: number; journalFrequency: number; averageMood: number } }, config: AIModelConfig): Promise<string[]> {
  console.log('🚀 Calling Gemini API for insights...')
  
  // Check if we have the required API key
  if (!config.apiKey) {
    console.log('⚠️ No Gemini API key provided, falling back to basic insights')
    return generateBasicInsights([], [])
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a mental health AI assistant. Provide personalized insights based on user data. Based on this mental health data, provide 3-5 personalized insights. 

IMPORTANT: Return ONLY a valid JSON array with properly escaped quotes. If your insights contain quotes, escape them with backslashes. Example:
["You've had a very positive day", "Your mood shows improvement", "Consider maintaining these positive habits"]

Context: ${JSON.stringify(context)}`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 500
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📥 Gemini API response:', data)
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('❌ Invalid Gemini API response structure:', data)
      throw new Error('Invalid Gemini API response structure')
    }
    
    let responseText = data.candidates[0].content.parts[0].text
    console.log('📝 Raw Gemini response text:', responseText)
    
    // Enhanced cleanup for malformed JSON
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    // Remove any trailing commas or incomplete JSON
    responseText = responseText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
    // Ensure it starts and ends with brackets
    if (!responseText.startsWith('[')) responseText = '[' + responseText
    if (!responseText.endsWith(']')) responseText = responseText + ']'
    
    console.log('🧹 Cleaned response text:', responseText)
    
    try {
      const insights = JSON.parse(responseText)
      console.log('✅ Parsed insights:', insights)
      return Array.isArray(insights) ? insights : [insights]
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('❌ Problematic text:', responseText)
      
      // Try to fix common JSON issues
      try {
        let fixedText = responseText
        
        // More sophisticated JSON repair
        fixedText = repairJSONString(fixedText)
        
        console.log('🔧 Attempting to fix JSON:', fixedText)
        const fixedInsights = JSON.parse(fixedText)
        console.log('✅ Fixed JSON parsed successfully:', fixedInsights)
        return Array.isArray(fixedInsights) ? fixedInsights : [fixedInsights]
      } catch (fixError) {
        console.error('❌ JSON fix attempt failed:', fixError)
        
        // Last resort: try to extract insights manually
        try {
          const manualInsights = extractInsightsManually(responseText)
          console.log('✅ Manually extracted insights:', manualInsights)
          return manualInsights
        } catch (manualError) {
          console.error('❌ Manual extraction failed:', manualError)
          // Fallback: return basic insights
          return [
            "Your mood patterns show regular tracking habits",
            "Journal entries provide valuable emotional context",
            "Consider maintaining consistent daily reflections"
          ]
        }
      }
    }
  } catch (error) {
    console.error('❌ Gemini insights failed:', error)
    throw error
  }
}

// Sophisticated JSON repair function
function repairJSONString(text: string): string {
  console.log('🔧 Attempting JSON repair for:', text.substring(0, 100) + '...')
  
  let repaired = text
  
  // Remove markdown code blocks
  repaired = repaired.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  
  // Ensure it starts and ends with brackets
  if (!repaired.startsWith('[')) repaired = '[' + repaired
  if (!repaired.endsWith(']')) repaired = repaired + ']'
  
  // Remove trailing commas
  repaired = repaired.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
  
  // Try to parse as-is first
  try {
    JSON.parse(repaired)
    return repaired
  } catch {
    console.log('🔧 JSON parsing failed, will use manual extraction instead')
    // Return the original text for manual extraction
    return text
  }
}

// Helper function to manually extract insights from malformed JSON
function extractInsightsManually(text: string): string[] {
  console.log('🔍 Attempting manual extraction from:', text)
  
  const insights: string[] = []
  
  // Handle the specific pattern from the error messages
  // The AI returns: ["text with "quotes" inside", "more text"]
  // We need to extract each string element properly
  
  // First, try to find the array pattern
  const arrayMatch = text.match(/\[(.*)\]/)
  if (arrayMatch) {
    const arrayContent = arrayMatch[1]
    console.log('📝 Found array content, length:', arrayContent.length)
    
    // Better approach: split by comma and handle each element
    const elements = arrayContent.split(',').map(element => {
      element = element.trim()
      
      // Remove surrounding quotes if they exist
      if (element.startsWith('"') && element.endsWith('"')) {
        element = element.slice(1, -1)
      }
      
      return element
    })
    
    // Filter out empty elements and add valid ones
    elements.forEach(element => {
      if (element.length > 10) {
        insights.push(element)
      }
    })
  }
  
  // If manual parsing didn't work, try regex approach
  if (insights.length === 0) {
    console.log('📝 Trying regex extraction...')
    
    // Look for quoted strings that are at least 10 characters long
    const quotePattern = /"([^"]{10,})"/g
    let match
    while ((match = quotePattern.exec(text)) !== null) {
      const content = match[1]
      if (content.length > 10 && !insights.includes(content)) {
        insights.push(content)
      }
    }
  }
  
  // If still no insights found, try to extract sentences
  if (insights.length === 0) {
    console.log('📝 Trying sentence extraction...')
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
    insights.push(...sentences.slice(0, 3).map(s => s.trim()))
  }
  
  // Clean up insights
  const cleanedInsights = insights
    .map(insight => insight.trim())
    .filter(insight => insight.length > 10 && insight.length < 500)
    .slice(0, 5)
  
  console.log('📝 Manually extracted insights:', cleanedInsights)
  return cleanedInsights.length > 0 ? cleanedInsights : [
    "Your mood patterns show regular tracking habits",
    "Journal entries provide valuable emotional context",
    "Consider maintaining consistent daily reflections"
  ]
}

async function generateRecommendationsWithGemini(context: { moodAnalysis: MoodAnalysis; journalAnalysis: JournalAnalysis; sentimentAnalysis: SentimentAnalysis; predictiveInsights: PredictiveInsights }, config: AIModelConfig): Promise<string[]> {
  console.log('🚀 Calling Gemini API for recommendations...')
  
  // Check if we have the required API key
  if (!config.apiKey) {
    console.log('⚠️ No Gemini API key provided, falling back to basic recommendations')
    return generateBasicRecommendations(context.moodAnalysis, context.journalAnalysis)
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a mental health AI assistant. Provide actionable, personalized recommendations. Based on this mental health analysis, provide 3-5 actionable recommendations. 

IMPORTANT: Return ONLY a valid JSON array with properly escaped quotes. If your recommendations contain quotes, escape them with backslashes. Example:
["Maintain your daily mood tracking", "Consider journaling regularly", "Practice mindfulness exercises"]

Analysis: ${JSON.stringify(context)}`
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📥 Gemini API response:', data)
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('❌ Invalid Gemini API response structure:', data)
      throw new Error('Invalid Gemini API response structure')
    }
    
    let responseText = data.candidates[0].content.parts[0].text
    console.log('📝 Raw Gemini response text:', responseText)
    
    // Enhanced cleanup for malformed JSON
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    // Remove any trailing commas or incomplete JSON
    responseText = responseText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
    // Ensure it starts and ends with brackets
    if (!responseText.startsWith('[')) responseText = '[' + responseText
    if (!responseText.endsWith(']')) responseText = responseText + ']'
    
    console.log('🧹 Cleaned response text:', responseText)
    
    try {
      const recommendations = JSON.parse(responseText)
      console.log('✅ Parsed recommendations:', recommendations)
      return Array.isArray(recommendations) ? recommendations : [recommendations]
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('❌ Problematic text:', responseText)
      
      // Try to fix common JSON issues
      try {
        let fixedText = responseText
        
        // More sophisticated JSON repair
        fixedText = repairJSONString(fixedText)
        
        console.log('🔧 Attempting to fix JSON:', fixedText)
        const fixedRecommendations = JSON.parse(fixedText)
        console.log('✅ Fixed JSON parsed successfully:', fixedRecommendations)
        return Array.isArray(fixedRecommendations) ? fixedRecommendations : [fixedRecommendations]
      } catch (fixError) {
        console.error('❌ JSON fix attempt failed:', fixError)
        
        // Last resort: try to extract recommendations manually
        try {
          const manualRecommendations = extractRecommendationsManually(responseText)
          console.log('✅ Manually extracted recommendations:', manualRecommendations)
          return manualRecommendations
        } catch (manualError) {
          console.error('❌ Manual extraction failed:', manualError)
          // Fallback: return basic recommendations
          return [
            "Maintain regular mood tracking habits",
            "Consider journaling daily for better emotional awareness",
            "Practice mindfulness and self-reflection"
          ]
        }
      }
    }
  } catch (error) {
    console.error('❌ Gemini recommendations failed:', error)
    throw error
  }
}

// Helper function to manually extract recommendations from malformed JSON
function extractRecommendationsManually(text: string): string[] {
  console.log('🔍 Attempting manual extraction from:', text)
  
  const recommendations: string[] = []
  
  // Handle the specific pattern from the error messages
  // The AI returns: ["text with "quotes" inside", "more text"]
  // We need to extract each string element properly
  
  // First, try to find the array pattern
  const arrayMatch = text.match(/\[(.*)\]/)
  if (arrayMatch) {
    const arrayContent = arrayMatch[1]
    console.log('📝 Found array content, length:', arrayContent.length)
    
    // Better approach: split by comma and handle each element
    const elements = arrayContent.split(',').map(element => {
      element = element.trim()
      
      // Remove surrounding quotes if they exist
      if (element.startsWith('"') && element.endsWith('"')) {
        element = element.slice(1, -1)
      }
      
      return element
    })
    
    // Filter out empty elements and add valid ones
    elements.forEach(element => {
      if (element.length > 10) {
        recommendations.push(element)
      }
    })
  }
  
  // If manual parsing didn't work, try regex approach
  if (recommendations.length === 0) {
    console.log('📝 Trying regex extraction...')
    
    // Look for quoted strings that are at least 10 characters long
    const quotePattern = /"([^"]{10,})"/g
    let match
    while ((match = quotePattern.exec(text)) !== null) {
      const content = match[1]
      if (content.length > 10 && !recommendations.includes(content)) {
        recommendations.push(content)
      }
    }
  }
  
  // If still no recommendations found, try to extract sentences
  if (recommendations.length === 0) {
    console.log('📝 Trying sentence extraction...')
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
    recommendations.push(...sentences.slice(0, 3).map(s => s.trim()))
  }
  
  // Clean up recommendations
  const cleanedRecommendations = recommendations
    .map(recommendation => recommendation.trim())
    .filter(recommendation => recommendation.length > 10 && recommendation.length < 500)
    .slice(0, 5)
  
  console.log('📝 Manually extracted recommendations:', cleanedRecommendations)
  return cleanedRecommendations.length > 0 ? cleanedRecommendations : [
    "Maintain regular mood tracking habits",
    "Consider journaling daily for better emotional awareness",
    "Practice mindfulness and self-reflection"
  ]
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

async function generatePredictionsWithOpenAI(dataSummary: { moodHistory: Array<{ mood: string; energy?: number; date: string; notes?: string }>; journalThemes: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; date: string }> }, config: AIModelConfig): Promise<PredictiveInsights> {
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

async function generateInsightsWithOpenAI(context: { journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>; moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>; userPatterns: { moodFrequency: number; journalFrequency: number; averageMood: number } }, config: AIModelConfig): Promise<string[]> {
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

async function generateRecommendationsWithOpenAI(context: { moodAnalysis: MoodAnalysis; journalAnalysis: JournalAnalysis; sentimentAnalysis: SentimentAnalysis; predictiveInsights: PredictiveInsights }, config: AIModelConfig): Promise<string[]> {
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
function performBasicSentimentAnalysis(journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>): SentimentAnalysis {
  console.log('🔍 Performing basic sentiment analysis on', journalEntries.length, 'journal entries')
  
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'positive', 'grateful', 'joy', 'excited', 'pleased', 'content', 'satisfied', 'blessed', 'fortunate', 'lucky', 'cheerful', 'optimistic', 'hopeful', 'inspired']
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'stress', 'angry', 'frustrated', 'disappointed', 'upset', 'hurt', 'lonely', 'hopeless', 'desperate', 'miserable', 'dreadful', 'horrible', 'devastated']
  const stressWords = ['stress', 'anxiety', 'overwhelmed', 'tired', 'exhausted', 'pressure', 'tense', 'nervous', 'panicked', 'worried', 'concerned', 'fearful', 'scared', 'frightened', 'terrified', 'paranoid', 'obsessed', 'compulsive']

  let positiveCount = 0
  let negativeCount = 0
  let stressCount = 0
  const emotionalKeywords: string[] = []
  const stressIndicators: string[] = []

  journalEntries.forEach((entry, index) => {
    const text = `${entry.title || ''} ${entry.content || ''}`.toLowerCase()
    console.log(`📝 Analyzing entry ${index + 1}:`, text.substring(0, 100) + '...')
    
    positiveWords.forEach(word => {
      if (text.includes(word)) {
        positiveCount++
        emotionalKeywords.push(word)
        console.log(`✅ Found positive word: ${word}`)
      }
    })
    
    negativeWords.forEach(word => {
      if (text.includes(word)) {
        negativeCount++
        emotionalKeywords.push(word)
        console.log(`❌ Found negative word: ${word}`)
      }
    })
    
    stressWords.forEach(word => {
      if (text.includes(word)) {
        stressCount++
        stressIndicators.push(word)
        console.log(`⚠️ Found stress word: ${word}`)
      }
    })
  })

  const totalEntries = journalEntries.length
  const sentimentScore = totalEntries > 0 ? (positiveCount - negativeCount) / Math.max(totalEntries, 1) : 0
  
  let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  if (sentimentScore > 0.1) overallSentiment = 'positive'
  else if (sentimentScore < -0.1) overallSentiment = 'negative'

  console.log(`📊 Sentiment Analysis Results:
    - Positive words found: ${positiveCount}
    - Negative words found: ${negativeCount}
    - Stress words found: ${stressCount}
    - Sentiment score: ${sentimentScore}
    - Overall sentiment: ${overallSentiment}
    - Emotional keywords: ${emotionalKeywords.join(', ')}
    - Stress indicators: ${stressIndicators.join(', ')}
  `)

  return {
    overallSentiment,
    sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
    emotionalKeywords: [...new Set(emotionalKeywords)],
    stressIndicators: [...new Set(stressIndicators)]
  }
}

function generateBasicPredictiveInsights(moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>, _journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>): PredictiveInsights {
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

function generateBasicInsights(journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>, moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>): string[] {
  const insights: string[] = []
  
  if (journalEntries.length > 0) {
    insights.push('You\'ve been actively journaling, which is great for self-reflection.')
  }
  
  if (moodEntries.length > 5) {
    insights.push('Consistent mood tracking helps identify patterns and triggers.')
  }
  
  return insights
}

function generateBasicRecommendations(moodAnalysis: MoodAnalysis, journalAnalysis: JournalAnalysis): string[] {
  const recommendations: string[] = []
  
  if (moodAnalysis.averageMood < 3) {
    recommendations.push('Consider reaching out to a mental health professional')
  }
  
  if (journalAnalysis.commonThemes.length === 0) {
    recommendations.push('Try adding tags to your journal entries for better organization')
  }
  
  return recommendations
}

function analyzeUserPatterns(moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>, journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>): { moodFrequency: number; journalFrequency: number; averageMood: number } {
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
function analyzeMoodPatterns(moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>): MoodAnalysis {
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

function analyzeJournalPatterns(journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>): JournalAnalysis {
  if (journalEntries.length === 0) {
    return {
      totalEntries: 0,
      commonThemes: [],
      averageLength: 0,
      emotionalPatterns: []
    }
  }

  // Calculate average length
  const totalLength = journalEntries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0)
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