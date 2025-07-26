import { supabase } from './supabase'

export interface MoodAnalysis {
  averageMood: number
  moodTrend: 'improving' | 'declining' | 'stable'
  mostFrequentMood: string
  moodVariability: number
  streakDays: number
  recommendations: string[]
}

export interface JournalAnalysis {
  commonThemes: string[]
  emotionalPatterns: string[]
  positiveTrends: string[]
  areasOfConcern: string[]
  recommendations: string[]
}

export interface AIInsights {
  moodAnalysis: MoodAnalysis
  journalAnalysis: JournalAnalysis
  overallInsights: string[]
  actionableRecommendations: string[]
  weeklyTrend: 'positive' | 'negative' | 'neutral'
}

// Mood scoring system
const moodScores = {
  'excellent': 5,
  'good': 4,
  'neutral': 3,
  'bad': 2,
  'terrible': 1
}

export async function generateAIInsights(userId: string): Promise<AIInsights> {
  try {
    // Fetch user's data
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30) // Last 30 entries

    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20) // Last 20 entries

    // Analyze mood patterns
    const moodAnalysis = analyzeMoodPatterns(moodEntries || [])
    
    // Analyze journal patterns
    const journalAnalysis = analyzeJournalPatterns(journalEntries || [])
    
    // Generate overall insights
    const overallInsights = generateOverallInsights(moodAnalysis, journalAnalysis)
    
    // Generate actionable recommendations
    const actionableRecommendations = generateRecommendations(moodAnalysis, journalAnalysis)
    
    // Determine weekly trend
    const weeklyTrend = determineWeeklyTrend(moodAnalysis)
    
    return {
      moodAnalysis,
      journalAnalysis,
      overallInsights,
      actionableRecommendations,
      weeklyTrend
    }
  } catch (error) {
    console.error('Error generating AI insights:', error)
    throw error
  }
}

function analyzeMoodPatterns(moodEntries: any[]): MoodAnalysis {
  if (moodEntries.length === 0) {
    return {
      averageMood: 3,
      moodTrend: 'stable',
      mostFrequentMood: 'neutral',
      moodVariability: 0,
      streakDays: 0,
      recommendations: ['Start tracking your mood daily to get personalized insights']
    }
  }

  // Calculate average mood
  const scores = moodEntries.map(entry => moodScores[entry.mood as keyof typeof moodScores])
  const averageMood = scores.reduce((sum, score) => sum + score, 0) / scores.length

  // Determine mood trend
  const recentEntries = moodEntries.slice(0, 7)
  const olderEntries = moodEntries.slice(7, 14)
  
  let moodTrend: 'improving' | 'declining' | 'stable' = 'stable'
  if (recentEntries.length >= 3 && olderEntries.length >= 3) {
    const recentAvg = recentEntries.reduce((sum, entry) => sum + moodScores[entry.mood as keyof typeof moodScores], 0) / recentEntries.length
    const olderAvg = olderEntries.reduce((sum, entry) => sum + moodScores[entry.mood as keyof typeof moodScores], 0) / olderEntries.length
    
    if (recentAvg > olderAvg + 0.5) moodTrend = 'improving'
    else if (recentAvg < olderAvg - 0.5) moodTrend = 'declining'
  }

  // Find most frequent mood
  const moodCounts: Record<string, number> = {}
  moodEntries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
  })
  const mostFrequentMood = Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]

  // Calculate mood variability
  const moodVariability = Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - averageMood, 2), 0) / scores.length)

  // Calculate streak days
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

  // Generate mood-specific recommendations
  const recommendations = generateMoodRecommendations(averageMood, moodTrend, mostFrequentMood, streakDays)

  return {
    averageMood,
    moodTrend,
    mostFrequentMood,
    moodVariability,
    streakDays,
    recommendations
  }
}

function analyzeJournalPatterns(journalEntries: any[]): JournalAnalysis {
  if (journalEntries.length === 0) {
    return {
      commonThemes: [],
      emotionalPatterns: [],
      positiveTrends: [],
      areasOfConcern: [],
      recommendations: ['Start journaling regularly to gain deeper insights into your thoughts and feelings']
    }
  }

  // Extract common themes from tags and content
  const allTags = journalEntries.flatMap(entry => entry.tags || [])
  const tagCounts: Record<string, number> = {}
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  })
  const commonThemes = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)

  // Analyze emotional patterns based on mood tags
  const moodEntries = journalEntries.filter(entry => entry.mood)
  const emotionalPatterns = analyzeEmotionalPatterns(moodEntries)

  // Identify positive trends
  const positiveTrends = identifyPositiveTrends(journalEntries)

  // Identify areas of concern
  const areasOfConcern = identifyAreasOfConcern(journalEntries)

  // Generate journal-specific recommendations
  const recommendations = generateJournalRecommendations(commonThemes, emotionalPatterns, positiveTrends, areasOfConcern)

  return {
    commonThemes,
    emotionalPatterns,
    positiveTrends,
    areasOfConcern,
    recommendations
  }
}

function analyzeEmotionalPatterns(moodEntries: any[]): string[] {
  const patterns: string[] = []
  
  if (moodEntries.length === 0) return patterns

  const moodCounts: Record<string, number> = {}
  moodEntries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
  })

  const totalEntries = moodEntries.length
  const positiveMoods = (moodCounts['excellent'] || 0) + (moodCounts['good'] || 0)
  const negativeMoods = (moodCounts['bad'] || 0) + (moodCounts['terrible'] || 0)

  if (positiveMoods / totalEntries > 0.6) {
    patterns.push('Generally positive emotional state')
  } else if (negativeMoods / totalEntries > 0.4) {
    patterns.push('Frequent negative emotions noted')
  } else {
    patterns.push('Mixed emotional patterns')
  }

  if (moodCounts['excellent'] && moodCounts['excellent'] / totalEntries > 0.2) {
    patterns.push('Experiences moments of high positivity')
  }

  if (moodCounts['terrible'] && moodCounts['terrible'] / totalEntries > 0.1) {
    patterns.push('Occasional very low moods')
  }

  return patterns
}

function identifyPositiveTrends(entries: any[]): string[] {
  const trends: string[] = []
  
  if (entries.length < 2) return trends

  // Check for increasing positive content
  const recentEntries = entries.slice(0, Math.min(5, entries.length))
  const positiveKeywords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'positive', 'grateful']
  
  const positiveCount = recentEntries.filter(entry => 
    positiveKeywords.some(keyword => 
      entry.content.toLowerCase().includes(keyword) || 
      entry.title.toLowerCase().includes(keyword)
    )
  ).length

  if (positiveCount > recentEntries.length * 0.6) {
    trends.push('Increasing positive content in recent entries')
  }

  return trends
}

function identifyAreasOfConcern(entries: any[]): string[] {
  const concerns: string[] = []
  
  if (entries.length === 0) return concerns

  const concernKeywords = ['stress', 'anxiety', 'worry', 'sad', 'depressed', 'lonely', 'overwhelmed', 'tired']
  
  const concernCount = entries.filter(entry => 
    concernKeywords.some(keyword => 
      entry.content.toLowerCase().includes(keyword) || 
      entry.title.toLowerCase().includes(keyword)
    )
  ).length

  if (concernCount > entries.length * 0.3) {
    concerns.push('Frequent mentions of stress or negative emotions')
  }

  return concerns
}

function generateMoodRecommendations(
  averageMood: number, 
  trend: string, 
  mostFrequentMood: string, 
  streakDays: number
): string[] {
  const recommendations: string[] = []

  if (averageMood < 2.5) {
    recommendations.push('Consider reaching out to a mental health professional')
    recommendations.push('Try incorporating more physical activity into your routine')
  } else if (averageMood < 3.5) {
    recommendations.push('Focus on small daily activities that bring you joy')
    recommendations.push('Practice gratitude by noting 3 positive things each day')
  }

  if (trend === 'declining') {
    recommendations.push('Your mood has been trending downward - consider what might be contributing')
    recommendations.push('Try to maintain your daily routine even when feeling low')
  } else if (trend === 'improving') {
    recommendations.push('Great! Your mood is improving - keep up the positive habits')
  }

  if (streakDays < 3) {
    recommendations.push('Try to track your mood more consistently for better insights')
  } else if (streakDays > 7) {
    recommendations.push('Excellent consistency! You\'re building a great habit')
  }

  return recommendations
}

function generateJournalRecommendations(
  themes: string[], 
  patterns: string[], 
  trends: string[], 
  concerns: string[]
): string[] {
  const recommendations: string[] = []

  if (themes.length === 0) {
    recommendations.push('Try adding tags to your journal entries for better organization')
  }

  if (concerns.length > 0) {
    recommendations.push('Consider discussing your concerns with a trusted friend or professional')
    recommendations.push('Practice self-compassion - it\'s okay to have difficult days')
  }

  if (trends.length > 0) {
    recommendations.push('Great progress! Continue focusing on positive experiences')
  }

  recommendations.push('Try journaling at the same time each day to build consistency')

  return recommendations
}

function generateOverallInsights(moodAnalysis: MoodAnalysis, journalAnalysis: JournalAnalysis): string[] {
  const insights: string[] = []

  if (moodAnalysis.averageMood > 4) {
    insights.push('You\'re maintaining a very positive mood overall')
  } else if (moodAnalysis.averageMood < 2.5) {
    insights.push('Your mood has been consistently low - consider seeking support')
  }

  if (moodAnalysis.moodTrend === 'improving') {
    insights.push('Your mood is showing positive improvement over time')
  }

  if (journalAnalysis.commonThemes.length > 0) {
    insights.push(`You frequently write about: ${journalAnalysis.commonThemes.slice(0, 3).join(', ')}`)
  }

  if (journalAnalysis.positiveTrends.length > 0) {
    insights.push('Your journal entries show increasing positivity')
  }

  return insights
}

function generateRecommendations(moodAnalysis: MoodAnalysis, journalAnalysis: JournalAnalysis): string[] {
  const recommendations: string[] = []

  // Combine recommendations from both analyses
  recommendations.push(...moodAnalysis.recommendations)
  recommendations.push(...journalAnalysis.recommendations)

  // Add general recommendations
  if (moodAnalysis.streakDays < 5) {
    recommendations.push('Set a daily reminder to track your mood')
  }

  if (journalAnalysis.commonThemes.length === 0) {
    recommendations.push('Try exploring different topics in your journal entries')
  }

  // Remove duplicates and limit to top recommendations
  return [...new Set(recommendations)].slice(0, 5)
}

function determineWeeklyTrend(moodAnalysis: MoodAnalysis): 'positive' | 'negative' | 'neutral' {
  if (moodAnalysis.moodTrend === 'improving') return 'positive'
  if (moodAnalysis.moodTrend === 'declining') return 'negative'
  return 'neutral'
} 