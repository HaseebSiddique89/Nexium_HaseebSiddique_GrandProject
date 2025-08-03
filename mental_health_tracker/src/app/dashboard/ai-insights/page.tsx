'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { generateEnhancedAIInsights, type EnhancedAIInsights } from '@/lib/ai-insights-enhanced'
import { getAIConfig, isAIEnabled } from '@/lib/ai-config'
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

export default function AIInsightsPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<EnhancedAIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAIInsights()
    }
  }, [user])

  const fetchAIInsights = async () => {
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
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

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

  // Helper function to calculate average energy from mood entries
  const calculateAverageEnergy = () => {
    if (!insights) return 0
    // This would need to be calculated from the actual mood entries
    // For now, we'll use a placeholder calculation based on average mood
    const moodScores = { excellent: 9, good: 7, neutral: 5, bad: 3, terrible: 1 }
    const score = moodScores[insights.moodAnalysis.mostCommonMood as keyof typeof moodScores] || 5
    return score
  }

  // Helper function to calculate mood stability
  const calculateMoodStability = () => {
    if (!insights) return 'Stable'
    // This would need to be calculated from the actual mood entries
    // For now, we'll use a placeholder based on average mood
    if (insights.moodAnalysis.averageMood > 4) return 'Very Stable'
    if (insights.moodAnalysis.averageMood > 3) return 'Stable'
    if (insights.moodAnalysis.averageMood > 2) return 'Moderate'
    return 'Variable'
  }

  // Helper function to calculate writing frequency
  const calculateWritingFrequency = () => {
    if (!insights) return 'No entries'
    const totalEntries = insights.journalAnalysis.totalEntries
    if (totalEntries === 0) return 'No entries'
    if (totalEntries < 5) return 'Occasional'
    if (totalEntries < 10) return 'Regular'
    if (totalEntries < 20) return 'Frequent'
    return 'Very Active'
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
          {/* Sentiment Analysis */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sentiment Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Overall Sentiment</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(insights.sentimentAnalysis.overallSentiment)}`}>
                  {insights.sentimentAnalysis.overallSentiment.charAt(0).toUpperCase() + insights.sentimentAnalysis.overallSentiment.slice(1)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Sentiment Score: {insights.sentimentAnalysis.sentimentScore.toFixed(2)} (-1 to 1)
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Emotional Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.sentimentAnalysis.emotionalKeywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full border border-purple-200/50">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {insights.sentimentAnalysis.stressIndicators.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Stress Indicators</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.sentimentAnalysis.stressIndicators.map((indicator, index) => (
                    <span key={index} className="px-2 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs rounded-full border border-red-200/50">
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Predictive Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Predictive Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Mood Prediction</h3>
                <div className="flex items-center space-x-2">
                  {getPredictionIcon(insights.predictiveInsights.moodPrediction)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor(insights.predictiveInsights.moodPrediction)}`}>
                    {insights.predictiveInsights.moodPrediction.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {insights.predictiveInsights.nextWeekPrediction}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Risk & Positive Factors</h3>
                {insights.predictiveInsights.riskFactors.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-red-700 mb-1">Risk Factors</h4>
                    <div className="space-y-1">
                      {insights.predictiveInsights.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100/50">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {insights.predictiveInsights.positiveFactors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-1">Positive Factors</h4>
                    <div className="space-y-1">
                      {insights.predictiveInsights.positiveFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100/50">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Generated Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">AI Generated Insights</h2>
            </div>
            
            <div className="space-y-3">
              {insights.aiGeneratedInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100/50">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h2>
            </div>
            
            <div className="space-y-3">
              {insights.personalizedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100/50">
                  <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pattern Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Mood Analysis</h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Most Common Mood:</strong> {insights.moodAnalysis.mostCommonMood}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Average Energy:</strong> {calculateAverageEnergy()}/10
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Mood Stability:</strong> {calculateMoodStability()}
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Journal Analysis</h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Total Entries:</strong> {insights.journalAnalysis.totalEntries}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Average Length:</strong> {insights.journalAnalysis.averageLength} words
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Writing Frequency:</strong> {calculateWritingFrequency()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
} 