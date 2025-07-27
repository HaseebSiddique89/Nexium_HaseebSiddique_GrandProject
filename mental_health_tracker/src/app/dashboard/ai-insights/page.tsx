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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600 mt-2">
            Advanced analysis of your mental health patterns and personalized recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {aiEnabled ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">AI Powered</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Basic Analysis</span>
            </div>
          )}
        </div>
      </div>

                           {!aiEnabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
        )}



      {insights && (
        <div className="space-y-6">
          {/* Sentiment Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-6 w-6 text-purple-600" />
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
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
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
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Predictive Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
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
                        <div key={index} className="flex items-center space-x-2">
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
                        <div key={index} className="flex items-center space-x-2">
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Generated Insights</h2>
            </div>
            
            <div className="space-y-3">
              {insights.aiGeneratedInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h2>
            </div>
            
            <div className="space-y-3">
              {insights.personalizedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pattern Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mood Patterns */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Mood Patterns</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Average Mood</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.moodAnalysis.averageMood.toFixed(1)}/5</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Most Common Mood</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">{insights.moodAnalysis.mostCommonMood}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weekly Trend</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor(insights.weeklyTrend)}`}>
                    {insights.weeklyTrend.charAt(0).toUpperCase() + insights.weeklyTrend.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Journal Patterns */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Journal Patterns</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.journalAnalysis.totalEntries}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Common Themes</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {insights.journalAnalysis.commonThemes.slice(0, 3).map((theme, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Entry Length</p>
                  <p className="text-lg font-medium text-gray-900">{insights.journalAnalysis.averageLength} words</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 