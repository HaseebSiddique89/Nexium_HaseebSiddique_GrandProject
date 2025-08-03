'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { generateEnhancedAIInsights, type EnhancedAIInsights } from '@/lib/ai-insights-enhanced'
import { getAIConfig, isAIEnabled } from '@/lib/ai-config'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Target,
  Activity,
  BarChart3,
  BookOpen,
  Sparkles,
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface RealMoodData {
  totalEntries: number
  averageMood: number
  mostCommonMood: string
  averageEnergy: number
  moodStability: string
  moodDistribution: Record<string, number>
}

interface RealJournalData {
  totalEntries: number
  averageLength: number
  writingFrequency: string
  totalWords: number
}

export default function AIInsightsPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<EnhancedAIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [realMoodData, setRealMoodData] = useState<RealMoodData | null>(null)
  const [realJournalData, setRealJournalData] = useState<RealJournalData | null>(null)

  const fetchRealData = useCallback(async () => {
    if (!user) return

    try {
      // Fetch mood entries
      const { data: moodEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch journal entries
      const { data: journalEntries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Calculate real mood data
      if (moodEntries && moodEntries.length > 0) {
        const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
        const scores = moodEntries.map(entry => moodScores[entry.mood as keyof typeof moodScores])
        const averageMood = scores.reduce((sum, score) => sum + score, 0) / scores.length

        // Calculate most common mood
        const moodCounts: Record<string, number> = {}
        moodEntries.forEach(entry => {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
        })
        
        let mostCommonMood = 'neutral'
        let maxCount = 0
        for (const [mood, count] of Object.entries(moodCounts)) {
          if (count > maxCount) {
            maxCount = count
            mostCommonMood = mood
          }
        }

        // Calculate average energy
        const energyLevels = moodEntries.filter(entry => entry.energy_level).map(entry => entry.energy_level)
        const averageEnergy = energyLevels.length > 0 ? 
          energyLevels.reduce((sum, level) => sum + (level || 0), 0) / energyLevels.length : 5

        // Calculate mood stability based on variance
        const moodVariance = scores.reduce((sum, score) => sum + Math.pow(score - averageMood, 2), 0) / scores.length
        const moodStability = moodVariance < 0.5 ? 'Very Stable' : 
                             moodVariance < 1.0 ? 'Stable' : 
                             moodVariance < 2.0 ? 'Moderate' : 'Variable'

        setRealMoodData({
          totalEntries: moodEntries.length,
          averageMood,
          mostCommonMood,
          averageEnergy,
          moodStability,
          moodDistribution: moodCounts
        })
      }

      // Calculate real journal data
      if (journalEntries && journalEntries.length > 0) {
        const totalWords = journalEntries.reduce((sum, entry) => {
          return sum + entry.content.split(' ').length
        }, 0)
        
        const averageLength = journalEntries.reduce((sum, entry) => sum + entry.content.length, 0) / journalEntries.length
        
        let writingFrequency = 'No entries'
        if (journalEntries.length >= 20) writingFrequency = 'Very Active'
        else if (journalEntries.length >= 10) writingFrequency = 'Frequent'
        else if (journalEntries.length >= 5) writingFrequency = 'Regular'
        else if (journalEntries.length >= 1) writingFrequency = 'Occasional'

        setRealJournalData({
          totalEntries: journalEntries.length,
          averageLength,
          writingFrequency,
          totalWords
        })
      }
    } catch (error) {
      console.error('Error fetching real data:', error)
    }
  }, [user])

  const fetchAIInsights = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const aiConfig = getAIConfig()
      const aiStatus = isAIEnabled()
      setAiEnabled(Boolean(aiStatus))

      // Debug AI configuration
      console.log('🔧 AI Configuration Debug:')
      console.log('  - AI Enabled:', aiStatus)
      console.log('  - Provider:', aiConfig?.provider)
      console.log('  - Model:', aiConfig?.model)
      console.log('  - API Key Set:', !!aiConfig?.apiKey)
      console.log('  - HuggingFace Token Set:', !!aiConfig?.huggingfaceToken)
      console.log('  - Full Config:', aiConfig)

      // Note: Cache will automatically expire after 24 hours or when new data is added
      console.log('📊 Fetching AI insights (will use cache if available)')

      const enhancedInsights = await generateEnhancedAIInsights(user.id, aiConfig)
      console.log('📊 AI Insights Results:')
      console.log('  - Sentiment:', enhancedInsights.sentimentAnalysis)
      console.log('  - Predictions:', enhancedInsights.predictiveInsights)
      console.log('  - Insights count:', enhancedInsights.aiGeneratedInsights.length)
      console.log('  - Recommendations count:', enhancedInsights.personalizedRecommendations.length)
      console.log('  - Full insights object:', enhancedInsights)
      setInsights(enhancedInsights)
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      toast.error('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchAIInsights()
      fetchRealData()
    }
  }, [user, fetchAIInsights, fetchRealData])



  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'likely_improve': return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'likely_decline': return <TrendingDown className="h-5 w-5 text-red-600" />
      default: return <Minus className="h-5 w-5 text-yellow-600" />
    }
  }

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'likely_improve': return 'text-green-600 bg-green-100'
      case 'likely_decline': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Insights</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Advanced AI-powered analysis of your mental health patterns and personalized recommendations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      ) : !aiEnabled ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">AI Configuration Required</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 p-6">
            <div className="flex items-start space-x-3">
              <Zap className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Enable Real AI</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Add your AI API key to get enhanced insights with real AI analysis. 
                  Currently using basic pattern analysis.
                </p>
                <div className="mt-3 text-xs text-blue-600">
                  <p>Add to your .env.local:</p>
                  <code className="block mt-1 bg-blue-100 p-2 rounded">
                    # For Gemini AI (predictions, insights, recommendations)<br/>
                    NEXT_PUBLIC_AI_PROVIDER=gemini<br/>
                    NEXT_PUBLIC_AI_MODEL=gemini-2.5-flash-lite<br/>
                    NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key_here<br/><br/>
                    # For Hugging Face (sentiment analysis)<br/>
                    NEXT_PUBLIC_HUGGINGFACE_TOKEN=your_huggingface_token_here
                  </code>
                  <p className="mt-2 text-red-600">
                    <strong>Debug Info:</strong> Check browser console for AI configuration details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Real Data Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mood Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Mood Analysis</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Most Common Mood</span>
                  <span className="text-lg font-bold text-gray-900 capitalize">
                    {realMoodData?.mostCommonMood || 'No data'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Average Energy</span>
                  <span className="text-lg font-bold text-gray-900">
                    {realMoodData ? `${Math.round(realMoodData.averageEnergy)}/10` : 'No data'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Mood Stability</span>
                  <span className="text-lg font-bold text-gray-900">
                    {realMoodData?.moodStability || 'No data'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Entries</span>
                  <span className="text-lg font-bold text-gray-900">
                    {realMoodData?.totalEntries || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Journal Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Journal Analysis</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Entries</span>
                  <span className="text-lg font-bold text-gray-900">
                    {realJournalData?.totalEntries || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Average Length</span>
                  <span className="text-lg font-bold text-gray-900">
                    {realJournalData ? `${Math.round(realJournalData.averageLength)} chars` : 'No data'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Writing Frequency</span>
                  <span className="text-lg font-bold text-gray-900">
                    {realJournalData?.writingFrequency || 'No data'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Words</span>
                  <span className="text-lg font-bold text-gray-900">
                    {realJournalData?.totalWords || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sentiment Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-green-900">Overall Sentiment</h3>
                    <p className="text-lg font-bold text-green-700 capitalize">
                      {insights.sentimentAnalysis.overallSentiment || 'Neutral'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Sentiment Score</h3>
                    <p className="text-lg font-bold text-blue-700">
                      {insights.sentimentAnalysis.sentimentScore ? `${(insights.sentimentAnalysis.sentimentScore * 100).toFixed(0)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-purple-900">Emotional Keywords</h3>
                    <p className="text-lg font-bold text-purple-700">
                      {insights.sentimentAnalysis.emotionalKeywords?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Predictive Insights</h2>
            </div>
            
            <div className="space-y-4">
              {/* Mood Prediction */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPredictionIcon(insights.predictiveInsights.moodPrediction)}
                    <div>
                      <h3 className="font-medium text-gray-900">Mood Prediction</h3>
                      <p className="text-sm text-gray-600">
                        {insights.predictiveInsights.nextWeekPrediction}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPredictionColor(insights.predictiveInsights.moodPrediction)}`}>
                    {insights.predictiveInsights.moodPrediction.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Risk Factors */}
              {insights.predictiveInsights.riskFactors && insights.predictiveInsights.riskFactors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="font-medium text-red-900 mb-2">Risk Factors</h3>
                  <div className="space-y-2">
                    {insights.predictiveInsights.riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Positive Factors */}
              {insights.predictiveInsights.positiveFactors && insights.predictiveInsights.positiveFactors.length > 0 && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <h3 className="font-medium text-green-900 mb-2">Positive Factors</h3>
                  <div className="space-y-2">
                    {insights.predictiveInsights.positiveFactors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Generated Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">AI Generated Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.aiGeneratedInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-700">{insight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h2>
            </div>
            
            <div className="space-y-4">
              {insights.personalizedRecommendations.map((recommendation, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-700">{recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="text-center py-8">
            <div className="h-16 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
            <p className="text-gray-600">Start tracking your mood and journal entries to generate insights.</p>
          </div>
        </div>
      )}
    </div>
  )
} 