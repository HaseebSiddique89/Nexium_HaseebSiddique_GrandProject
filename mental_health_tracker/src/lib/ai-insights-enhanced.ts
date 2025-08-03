import { supabase } from './supabase'
import { 
  getAIInsightsFromDatabase, 
  storeAIInsightsInDatabase, 
  clearAIInsightsFromDatabase,
  isAIInsightsCacheValid,
  cleanupExpiredAIInsights,
  testDatabaseAccess
} from './ai-insights-database'

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
  clearAIInsightsFromDatabase(userId)
}

export function clearAllAICache() {
  console.log('🗑️ Clearing all AI cache')
  // This would require a more complex implementation to clear all users
  // For now, we'll just log it
  console.log('⚠️ clearAllAICache not implemented for database cache')
}

// Clear cache when new data is added
export function clearUserCache(userId: string) {
  clearAICache(userId)
}

// Clean up expired cache entries - only run occasionally
let lastCleanupTime = 0
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function cleanupExpiredCache() {
  const now = Date.now()
  if (now - lastCleanupTime > CLEANUP_INTERVAL) {
    lastCleanupTime = now
    // Run cleanup in background without blocking
    setTimeout(() => {
      cleanupExpiredAIInsights().catch(error => {
        console.warn('⚠️ Background cleanup failed (non-critical):', error)
      })
    }, 1000)
  }
}

// Test function to verify API connectivity
export async function testAPIConnectivity(config: AIModelConfig): Promise<{
  gemini: { success: boolean; error?: string; response?: unknown };
  huggingface: { success: boolean; error?: string; response?: unknown };
}> {
  console.log('🧪 Testing API connectivity...')
  
  const results = {
    gemini: { success: false, error: undefined as string | undefined, response: undefined as unknown },
    huggingface: { success: false, error: undefined as string | undefined, response: undefined as unknown }
  }
  
  // Test Gemini API
  if (config.apiKey) {
    try {
      console.log('🧪 Testing Gemini API...')
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, this is a test message. Please respond with "Test successful."' }] }]
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        results.gemini = { success: true, response: data, error: undefined }
        console.log('✅ Gemini API test successful')
      } else {
        results.gemini = { success: false, error: `${response.status} ${response.statusText}`, response: undefined }
        console.log('❌ Gemini API test failed:', results.gemini.error)
      }
    } catch (error) {
      results.gemini = { success: false, error: (error as Error).message, response: undefined }
      console.log('❌ Gemini API test error:', results.gemini.error)
    }
  } else {
    results.gemini = { success: false, error: 'No API key provided', response: undefined }
    console.log('❌ Gemini API test failed: No API key')
  }
  
  // Test Hugging Face API
  if (config.huggingfaceToken) {
    try {
      console.log('🧪 Testing Hugging Face API...')
      const response = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.huggingfaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: 'I am feeling happy today!' })
      })
      
      if (response.ok) {
        const data = await response.json()
        results.huggingface = { success: true, response: data, error: undefined }
        console.log('✅ Hugging Face API test successful')
      } else {
        results.huggingface = { success: false, error: `${response.status} ${response.statusText}`, response: undefined }
        console.log('❌ Hugging Face API test failed:', results.huggingface.error)
      }
    } catch (error) {
      results.huggingface = { success: false, error: (error as Error).message, response: undefined }
      console.log('❌ Hugging Face API test error:', results.huggingface.error)
    }
  } else {
    results.huggingface = { success: false, error: 'No Hugging Face token provided', response: undefined }
    console.log('❌ Hugging Face API test failed: No token')
  }
  
  console.log('🧪 API connectivity test results:', results)
  return results
}

export async function generateEnhancedAIInsights(
  userId: string, 
  aiConfig?: AIModelConfig
): Promise<EnhancedAIInsights> {
  const callId = Math.random().toString(36).substring(7)
  console.log(`🎯 Starting enhanced AI insights generation for user: ${userId} (call ID: ${callId})`)
  console.log('🔧 AI Config:', aiConfig)
  

  
  // Clean up expired cache entries periodically
  cleanupExpiredCache()
  
  // Test database access first
  await testDatabaseAccess()
  
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

    // Create a stable data hash based on content, not timestamps
    const moodContentHash = moodEntries?.map(entry => `${entry.mood}_${entry.energy_level || 0}`).join('|') || ''
    const journalContentHash = journalEntries?.map(entry => `${entry.title || ''}_${entry.content || ''}_${entry.mood || ''}`).join('|') || ''
    
    const dataHash = JSON.stringify({
      moodCount: moodEntries?.length || 0,
      journalCount: journalEntries?.length || 0,
      moodContentHash: moodContentHash,
      journalContentHash: journalContentHash,
      provider: aiConfig?.provider || 'basic'
    })
    
    console.log('🔍 Data hash created:', {
      moodCount: moodEntries?.length || 0,
      journalCount: journalEntries?.length || 0,
      moodContentHash: moodContentHash.substring(0, 50) + '...',
      journalContentHash: journalContentHash.substring(0, 50) + '...',
      fullDataHash: dataHash.substring(0, 100) + '...'
    })
    
    // Check database cache with data hash validation
    console.log('🔍 Checking database cache for user:', userId)
    
    // Try to get cached insights from database with error handling
    let cachedInsights: EnhancedAIInsights | null = null
    try {
      cachedInsights = await getAIInsightsFromDatabase(userId)
    } catch (error) {
      console.warn('⚠️ Database cache access failed (non-critical):', error)
      // Continue without cache - this is not a critical error
    }
    
    if (cachedInsights) {
      // Check if the cached data hash matches current data
      let isCacheValid = false
      try {
        isCacheValid = await isAIInsightsCacheValid(userId, dataHash)
      } catch (error) {
        console.warn('⚠️ Cache validation failed (non-critical):', error)
        // Assume cache is invalid if validation fails
        isCacheValid = false
      }
      
      if (isCacheValid) {
        console.log('✅ Using cached AI insights from database (data unchanged, cache valid)')
        console.log('📊 Cache retrieval debug:', {
          cachedSentiment: cachedInsights.sentimentAnalysis.overallSentiment,
          cachedScore: cachedInsights.sentimentAnalysis.sentimentScore,
          cachedPrediction: cachedInsights.predictiveInsights.moodPrediction,
          cachedInsightsCount: cachedInsights.aiGeneratedInsights.length,
          cachedRecommendationsCount: cachedInsights.personalizedRecommendations.length
        })
        return cachedInsights
      } else {
        console.log('🔄 Data content has changed, regenerating insights')
      }
    } else {
      console.log('🔄 No cache found in database, generating new insights')
    }

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
      
      // Test API connectivity first
      console.log('🧪 Testing API connectivity before making calls...')
      const apiTest = await testAPIConnectivity(aiConfig)
      console.log('🧪 API test results:', apiTest)
      
      // Check rate limits before making AI calls
      if (isRateLimited(userId)) {
        console.log('⚠️ Rate limit exceeded, using basic analysis')
        sentimentAnalysis = performBasicSentimentAnalysis(journalEntries || [])
        predictiveInsights = generateBasicPredictiveInsights(moodEntries || [], journalEntries || [])
        aiGeneratedInsights = generateBasicInsights(journalEntries || [], moodEntries || [])
        personalizedRecommendations = generateBasicRecommendations(basicMoodAnalysis, basicJournalAnalysis)
      } else {
        // Use optimized single Gemini call for all insights
        try {
          console.log('🚀 Making single optimized Gemini call for all insights...')
          const allInsights = await generateAllInsightsWithSingleGeminiCall(
            moodEntries || [], 
            journalEntries || [], 
            aiConfig
          )
          
          sentimentAnalysis = allInsights.sentimentAnalysis
          predictiveInsights = allInsights.predictiveInsights
          aiGeneratedInsights = allInsights.aiGeneratedInsights
          personalizedRecommendations = allInsights.personalizedRecommendations
          
          // Increment API usage only once for the single call
          incrementAPIUsage(userId)
          
          console.log('✅ Single Gemini call completed successfully')
          console.log('  - Sentiment:', sentimentAnalysis.overallSentiment, sentimentAnalysis.sentimentScore)
          console.log('  - Predictions:', predictiveInsights.moodPrediction)
          console.log('  - Insights count:', aiGeneratedInsights.length)
          console.log('  - Recommendations count:', personalizedRecommendations.length)
        } catch (error) {
          console.error('❌ Single Gemini call failed, falling back to basic analysis:', error)
          console.error('❌ Error details:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            name: (error as Error).name
          })
          sentimentAnalysis = performBasicSentimentAnalysis(journalEntries || [])
          predictiveInsights = generateBasicPredictiveInsights(moodEntries || [], journalEntries || [])
          aiGeneratedInsights = generateBasicInsights(journalEntries || [], moodEntries || [])
          personalizedRecommendations = generateBasicRecommendations(basicMoodAnalysis, basicJournalAnalysis)
        }
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

    // Store the result in database cache
    try {
      await storeAIInsightsInDatabase(userId, dataHash, result)
      console.log('💾 Stored AI insights in database cache (24h expiration)')
      console.log('📊 Cache storage debug:', {
        userId: userId,
        dataHash: dataHash.substring(0, 50) + '...',
        insightsCount: result.aiGeneratedInsights.length,
        recommendationsCount: result.personalizedRecommendations.length
      })
    } catch (error) {
      console.warn('⚠️ Failed to store AI insights in database cache (non-critical):', error)
      // This is not a critical error - insights are still generated and returned
    }

    return result
  } catch (error) {
    console.error('❌ Error generating enhanced AI insights:', error)
    throw error
  }
}



















// Sophisticated JSON repair function
function repairJSONString(text: string): string {
  console.log('🔧 Attempting JSON repair for:', text.substring(0, 100) + '...')
  
  let repaired = text
  
  // Remove markdown code blocks
  repaired = repaired.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  
  // If the response is wrapped in an array, extract the first object
  if (repaired.startsWith('[') && repaired.endsWith(']')) {
    // Extract the content between the brackets
    const arrayContent = repaired.slice(1, -1).trim()
    
    // If the array content is an object, use it directly
    if (arrayContent.startsWith('{') && arrayContent.endsWith('}')) {
      repaired = arrayContent
    } else {
      // Try to find the first complete object in the array
      const objectMatch = arrayContent.match(/\{[^}]*\}/)
      if (objectMatch) {
        repaired = objectMatch[0]
      }
    }
  }
  
  // Ensure it starts and ends with object brackets
  if (!repaired.startsWith('{')) repaired = '{' + repaired
  if (!repaired.endsWith('}')) repaired = repaired + '}'
  
  // Remove trailing commas
  repaired = repaired.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
  
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





// OpenAI Integration (kept for compatibility)








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

function generateBasicPredictiveInsights(moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>, journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>): PredictiveInsights {
  // Basic prediction logic
  const recentMoods = moodEntries.slice(0, 7).map(entry => entry.mood)
  const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
  
  const recentScores = recentMoods.map(mood => moodScores[mood as keyof typeof moodScores])
  const avgRecentScore = recentScores.length > 0 ? recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length : 3
  
  let moodPrediction: 'likely_improve' | 'likely_decline' | 'stable' = 'stable'
  if (avgRecentScore > 3.5) moodPrediction = 'likely_improve'
  else if (avgRecentScore < 2.5) moodPrediction = 'likely_decline'

  const riskFactors: string[] = []
  const positiveFactors: string[] = []

  // Analyze risk factors
  if (avgRecentScore < 3) {
    riskFactors.push('Low mood trend detected')
    riskFactors.push('Potential stress indicators present')
  }
  
  if (recentMoods.filter(mood => ['bad', 'terrible'].includes(mood)).length > 2) {
    riskFactors.push('Multiple negative mood entries recently')
  }

  // Analyze positive factors
  if (avgRecentScore > 3.5) {
    positiveFactors.push('Positive mood trend observed')
    positiveFactors.push('Good emotional consistency')
  }
  
  if (recentMoods.filter(mood => ['excellent', 'good'].includes(mood)).length > 2) {
    positiveFactors.push('Multiple positive mood entries recently')
  }

  // Journal-based factors
  if (journalEntries.length > 5) {
    positiveFactors.push('Active journaling habit supports emotional processing')
  }

  let nextWeekPrediction = 'Based on recent patterns, your mood is likely to remain stable.'
  if (moodPrediction === 'likely_improve') {
    nextWeekPrediction = 'Your recent positive trends suggest continued mood improvement in the coming week.'
  } else if (moodPrediction === 'likely_decline') {
    nextWeekPrediction = 'Your recent patterns suggest you might experience some mood challenges. Consider implementing stress management techniques.'
  }

  return {
    moodPrediction,
    riskFactors,
    positiveFactors,
    nextWeekPrediction
  }
}

function generateBasicInsights(journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>, moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>): string[] {
  const insights: string[] = []
  
  // Journal insights
  if (journalEntries.length > 0) {
    insights.push('You\'ve been actively journaling, which is excellent for self-reflection and emotional processing.')
    
    if (journalEntries.length > 5) {
      insights.push('Your consistent journaling habit shows strong commitment to mental health awareness.')
    }
    
    const avgLength = journalEntries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0) / journalEntries.length
    if (avgLength > 100) {
      insights.push('Your detailed journal entries provide rich insights into your emotional patterns.')
    }
  } else {
    insights.push('Consider starting a journaling practice to better understand your thoughts and feelings.')
  }
  
  // Mood insights
  if (moodEntries.length > 0) {
    insights.push('Regular mood tracking helps identify patterns, triggers, and emotional trends.')
    
    if (moodEntries.length > 10) {
      insights.push('Your extensive mood history provides valuable data for understanding your emotional patterns.')
    }
    
    const recentMoods = moodEntries.slice(0, 7).map(entry => entry.mood)
    const positiveMoods = recentMoods.filter(mood => ['excellent', 'good'].includes(mood))
    const negativeMoods = recentMoods.filter(mood => ['bad', 'terrible'].includes(mood))
    
    if (positiveMoods.length > negativeMoods.length) {
      insights.push('Your recent mood trends show a positive outlook, which is great for overall well-being.')
    } else if (negativeMoods.length > positiveMoods.length) {
      insights.push('Your recent mood patterns suggest you might be experiencing some challenges. Consider reaching out for support.')
    }
  } else {
    insights.push('Start tracking your daily moods to gain insights into your emotional patterns.')
  }
  
  // Combined insights
  if (journalEntries.length > 0 && moodEntries.length > 0) {
    insights.push('Combining mood tracking with journaling provides a comprehensive view of your mental health journey.')
  }
  
  return insights
}

function generateBasicRecommendations(moodAnalysis: MoodAnalysis, journalAnalysis: JournalAnalysis): string[] {
  const recommendations: string[] = []
  
  // Mood-based recommendations
  if (moodAnalysis.averageMood < 3) {
    recommendations.push('Consider reaching out to a mental health professional for support')
    recommendations.push('Try incorporating more physical activity into your daily routine')
  } else if (moodAnalysis.averageMood > 4) {
    recommendations.push('Great job maintaining positive moods! Keep up the good work')
  }
  
  // Journal-based recommendations
  if (journalAnalysis.totalEntries === 0) {
    recommendations.push('Start journaling regularly to track your thoughts and feelings')
  } else if (journalAnalysis.totalEntries < 5) {
    recommendations.push('Try to journal more frequently to build a consistent habit')
  } else {
    recommendations.push('Excellent journaling consistency! Consider adding more detailed entries')
  }
  
  // General wellness recommendations
  recommendations.push('Practice mindfulness or meditation for 10-15 minutes daily')
  recommendations.push('Ensure you\'re getting adequate sleep (7-9 hours per night)')
  recommendations.push('Stay hydrated and maintain a balanced diet')
  
  // Streak-based recommendations
  if (moodAnalysis.streakDays > 7) {
    recommendations.push('Impressive mood tracking streak! Keep up the consistency')
  } else if (moodAnalysis.streakDays < 3) {
    recommendations.push('Try to track your mood daily to build a consistent habit')
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

// New optimized function that makes a single Gemini call for all insights
async function generateAllInsightsWithSingleGeminiCall(
  moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>,
  journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>,
  config: AIModelConfig
): Promise<{
  sentimentAnalysis: SentimentAnalysis;
  predictiveInsights: PredictiveInsights;
  aiGeneratedInsights: string[];
  personalizedRecommendations: string[];
}> {
  if (!config.apiKey) {
    console.log('⚠️ No API key provided, using basic analysis')
    const basicSentiment = performBasicSentimentAnalysis(journalEntries)
    const basicPredictions = generateBasicPredictiveInsights(moodEntries, journalEntries)
    const basicInsights = generateBasicInsights(journalEntries, moodEntries)
    const basicRecommendations = generateBasicRecommendations(
      analyzeMoodPatterns(moodEntries),
      analyzeJournalPatterns(journalEntries)
    )
    
    console.log('📊 Basic analysis results:')
    console.log('  - Sentiment:', basicSentiment)
    console.log('  - Predictions:', basicPredictions)
    console.log('  - Insights count:', basicInsights.length)
    console.log('  - Recommendations count:', basicRecommendations.length)
    
    return {
      sentimentAnalysis: basicSentiment,
      predictiveInsights: basicPredictions,
      aiGeneratedInsights: basicInsights,
      personalizedRecommendations: basicRecommendations
    }
  }

  try {
    console.log('🚀 Making single optimized Gemini call for all insights...')
    
    // Prepare data for the single call
    const moodHistory = moodEntries.map(entry => ({
      mood: entry.mood,
      energy: entry.energy_level,
      date: entry.created_at,
      notes: entry.notes
    }))

    const journalThemes = journalEntries.map(entry => ({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      date: entry.created_at
    }))

    const userPatterns = analyzeUserPatterns(moodEntries, journalEntries)

    // Create comprehensive prompt for single call
    const prompt = `Analyze this mental health data and provide insights in JSON format:

MOOD DATA (${moodEntries.length} entries):
${moodHistory.map(entry => `- ${entry.date}: ${entry.mood} (energy: ${entry.energy || 'N/A'}) ${entry.notes ? `- ${entry.notes}` : ''}`).join('\n')}

JOURNAL DATA (${journalEntries.length} entries):
${journalThemes.map(entry => `- ${entry.date}: ${entry.title || 'No title'} - ${entry.content?.substring(0, 100)}...`).join('\n')}

USER PATTERNS:
- Mood frequency: ${userPatterns.moodFrequency} entries per week
- Journal frequency: ${userPatterns.journalFrequency} entries per week  
- Average mood score: ${userPatterns.averageMood}

Respond with ONLY a valid JSON object in this exact format (no markdown, no explanations):
{
  "sentiment": {
    "overallSentiment": "positive",
    "sentimentScore": 0.5,
    "emotionalKeywords": ["happy", "good"],
    "stressIndicators": []
  },
  "predictions": {
    "moodPrediction": "likely_improve",
    "riskFactors": [],
    "positiveFactors": ["positive mood trend"],
    "nextWeekPrediction": "Your mood is likely to improve based on recent patterns."
  },
  "insights": [
    "You have been consistently tracking your mood",
    "Your journaling habit shows good self-reflection"
  ],
  "recommendations": [
    "Continue your daily mood tracking",
    "Keep journaling regularly for better insights"
  ]
}`

    console.log('🌐 Making Gemini API call to:', `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`)
    console.log('🔑 Using API key:', config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'NOT SET')
    console.log('📝 Prompt length:', prompt.length, 'characters')
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    console.log('📡 Gemini API response status:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('❌ Gemini API error:', response.status, response.statusText)
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📥 Raw Gemini API response data:', JSON.stringify(data, null, 2))
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('📥 Extracted response text:', responseText)

    // Try to parse the JSON response
    let parsedData: {
      sentiment?: {
        overallSentiment?: string;
        sentimentScore?: number;
        emotionalKeywords?: string[];
        stressIndicators?: string[];
      };
      predictions?: {
        moodPrediction?: string;
        riskFactors?: string[];
        positiveFactors?: string[];
        nextWeekPrediction?: string;
      };
      insights?: string[];
      recommendations?: string[];
    }
    
    console.log('🔍 Attempting to parse Gemini response...')
    console.log('📝 Raw response text:', responseText)
    
    try {
      const cleanedResponse = repairJSONString(responseText)
      console.log('🧹 Cleaned response:', cleanedResponse)
      parsedData = JSON.parse(cleanedResponse)
      console.log('✅ Successfully parsed JSON:', parsedData)
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError)
      console.error('❌ Parse error details:', {
        message: (parseError as Error).message,
        stack: (parseError as Error).stack
      })
      
      console.log('🔄 Falling back to basic analysis due to JSON parse failure')
      
      // Manual extraction fallback
      const sentimentAnalysis = performBasicSentimentAnalysis(journalEntries)
      const predictiveInsights = generateBasicPredictiveInsights(moodEntries, journalEntries)
      const aiGeneratedInsights = generateBasicInsights(journalEntries, moodEntries)
      const personalizedRecommendations = generateBasicRecommendations(
        analyzeMoodPatterns(moodEntries),
        analyzeJournalPatterns(journalEntries)
      )
      
      console.log('📊 Fallback analysis results:')
      console.log('  - Sentiment:', sentimentAnalysis)
      console.log('  - Predictions:', predictiveInsights)
      console.log('  - Insights count:', aiGeneratedInsights.length)
      console.log('  - Recommendations count:', personalizedRecommendations.length)
      
      return {
        sentimentAnalysis,
        predictiveInsights,
        aiGeneratedInsights,
        personalizedRecommendations
      }
    }

    // Extract and validate the data
    // Handle case where parsedData might be an array
    const extractedData = Array.isArray(parsedData) ? parsedData[0] : parsedData
    
    console.log('📊 Extracted data from parsed response:')
    console.log('  - Parsed data type:', Array.isArray(parsedData) ? 'array' : 'object')
    console.log('  - Data to use:', extractedData)
    
    const sentimentAnalysis: SentimentAnalysis = {
      overallSentiment: (extractedData?.sentiment?.overallSentiment as 'positive' | 'negative' | 'neutral') || 'neutral',
      sentimentScore: extractedData?.sentiment?.sentimentScore || 0,
      emotionalKeywords: extractedData?.sentiment?.emotionalKeywords || [],
      stressIndicators: extractedData?.sentiment?.stressIndicators || []
    }

    const predictiveInsights: PredictiveInsights = {
      moodPrediction: (extractedData?.predictions?.moodPrediction as 'likely_improve' | 'likely_decline' | 'stable') || 'stable',
      riskFactors: extractedData?.predictions?.riskFactors || [],
      positiveFactors: extractedData?.predictions?.positiveFactors || [],
      nextWeekPrediction: extractedData?.predictions?.nextWeekPrediction || 'No prediction available'
    }

    const aiGeneratedInsights = extractedData?.insights || []
    const personalizedRecommendations = extractedData?.recommendations || []

    console.log('✅ Single Gemini call completed successfully')
    console.log('  - Sentiment:', sentimentAnalysis.overallSentiment, sentimentAnalysis.sentimentScore)
    console.log('  - Predictions:', predictiveInsights.moodPrediction)
    console.log('  - Insights count:', aiGeneratedInsights.length)
    console.log('  - Recommendations count:', personalizedRecommendations.length)

    return {
      sentimentAnalysis,
      predictiveInsights,
      aiGeneratedInsights,
      personalizedRecommendations
    }

  } catch (error) {
    console.error('❌ Single Gemini call failed:', error)
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    
    // Fallback to basic analysis
    console.log('🔄 Falling back to basic analysis due to Gemini call failure')
    const fallbackSentiment = performBasicSentimentAnalysis(journalEntries)
    const fallbackPredictions = generateBasicPredictiveInsights(moodEntries, journalEntries)
    const fallbackInsights = generateBasicInsights(journalEntries, moodEntries)
    const fallbackRecommendations = generateBasicRecommendations(
      analyzeMoodPatterns(moodEntries),
      analyzeJournalPatterns(journalEntries)
    )
    
    console.log('📊 Fallback analysis results:')
    console.log('  - Sentiment:', fallbackSentiment)
    console.log('  - Predictions:', fallbackPredictions)
    console.log('  - Insights count:', fallbackInsights.length)
    console.log('  - Recommendations count:', fallbackRecommendations.length)
    
    return {
      sentimentAnalysis: fallbackSentiment,
      predictiveInsights: fallbackPredictions,
      aiGeneratedInsights: fallbackInsights,
      personalizedRecommendations: fallbackRecommendations
    }
  }
} 