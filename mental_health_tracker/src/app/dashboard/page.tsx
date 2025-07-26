'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Calendar,
  Plus,
  Brain,
  Lightbulb,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, getMoodEmoji, getMoodColor } from '@/lib/utils'
import { generateEnhancedAIInsights, type EnhancedAIInsights } from '@/lib/ai-insights-enhanced'
import { getAIConfig, isAIEnabled } from '@/lib/ai-config'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalMoodEntries: 0,
    totalJournalEntries: 0,
    currentStreak: 0,
    averageMood: 0,
  })
  const [recentMoodEntries, setRecentMoodEntries] = useState<Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>>([])
  const [recentJournalEntries, setRecentJournalEntries] = useState<Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>>([])
  const [aiInsights, setAiInsights] = useState<EnhancedAIInsights | null>(null)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastDataHash, setLastDataHash] = useState<string>('')

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch mood entries
      const { data: moodEntries, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (moodError) throw moodError

      // Fetch journal entries
      const { data: journalEntries, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (journalError) throw journalError

      // Calculate stats
      const totalMoodEntries = moodEntries?.length || 0
      const totalJournalEntries = journalEntries?.length || 0

      // Calculate average mood
      const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
      const scores = moodEntries?.map(entry => moodScores[entry.mood as keyof typeof moodScores]) || []
      const averageMood = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0

      // Calculate current streak
      let currentStreak = 0
      if (moodEntries && moodEntries.length > 0) {
        const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        for (let i = 0; i < sortedEntries.length - 1; i++) {
          const currentDate = new Date(sortedEntries[i].created_at)
          const nextDate = new Date(sortedEntries[i + 1].created_at)
          const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))

          if (dayDiff <= 1) {
            currentStreak++
          } else {
            break
          }
        }
      }

      setStats({
        totalMoodEntries,
        totalJournalEntries,
        currentStreak,
        averageMood,
      })

      setRecentMoodEntries(moodEntries?.slice(0, 5) || [])
      setRecentJournalEntries(journalEntries?.slice(0, 3) || [])

      // Check if data has changed before calling AI insights
      const currentDataHash = JSON.stringify({
        moodCount: moodEntries?.length || 0,
        journalCount: journalEntries?.length || 0,
        latestMood: moodEntries?.[0]?.created_at || '',
        latestJournal: journalEntries?.[0]?.created_at || ''
      })

      // Only generate AI insights if data has changed or we don't have insights yet
      if (currentDataHash !== lastDataHash || !aiInsights) {
        console.log('🔄 Data has changed, generating AI insights...')
        setLastDataHash(currentDataHash)
        
        try {
          const aiConfig = getAIConfig()
          const aiStatus = isAIEnabled()
          setAiEnabled(!!aiStatus)

          const insights = await generateEnhancedAIInsights(user.id, aiConfig)
          setAiInsights(insights)
        } catch (error) {
          console.error('Error generating AI insights:', error)
          // Don't show error toast for AI insights as it's not critical
        }
      } else {
        console.log('✅ Using existing AI insights (data unchanged)')
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.email}! Here&apos;s your mental health overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mood Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMoodEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Journal Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJournalEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">😊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageMood.toFixed(1)}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Preview */}
      {aiInsights && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
              {aiEnabled ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">AI Powered</span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Basic Analysis</span>
              )}
            </div>
            <Link
              href="/dashboard/ai-insights"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View Full Analysis →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Insights */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Insights</h3>
              <div className="space-y-2">
                {aiInsights.aiGeneratedInsights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recommendation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Top Recommendation</h3>
              {aiInsights.personalizedRecommendations.length > 0 ? (
                <div className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg">
                  <Target className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{aiInsights.personalizedRecommendations[0]}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Keep up the great work!</p>
              )}
            </div>
          </div>

          {/* Sentiment Preview */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sentiment Overview</h3>
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-sm text-gray-600">Overall Sentiment:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  aiInsights.sentimentAnalysis.overallSentiment === 'positive' ? 'bg-green-100 text-green-700' :
                  aiInsights.sentimentAnalysis.overallSentiment === 'negative' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {aiInsights.sentimentAnalysis.overallSentiment.charAt(0).toUpperCase() + aiInsights.sentimentAnalysis.overallSentiment.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Score:</span>
                <span className="ml-2 text-sm font-medium">{aiInsights.sentimentAnalysis.sentimentScore.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/mood/new"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Add Mood Entry</span>
          </Link>
          <Link
            href="/dashboard/journal/new"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Write Journal Entry</span>
          </Link>
          <Link
            href="/dashboard/ai-insights"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-gray-900">View AI Insights</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mood Entries */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Mood Entries</h2>
            <Link href="/dashboard/mood" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentMoodEntries.length > 0 ? (
              recentMoodEntries.map((entry) => (
                <div key={entry.created_at} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <div>
                      <p className="font-medium capitalize">{entry.mood}</p>
                      <p className="text-sm text-gray-600">{formatDate(new Date(entry.created_at))}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getMoodColor(entry.mood)}`}>
                    Energy: {entry.energy_level}/10
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No mood entries yet</p>
            )}
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Journal Entries</h2>
            <Link href="/dashboard/journal" className="text-green-600 hover:text-green-700 text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentJournalEntries.length > 0 ? (
              recentJournalEntries.map((entry) => (
                <div key={entry.created_at} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-1">{entry.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {entry.content && (entry.content.length > 100 ? `${entry.content.substring(0, 100)}...` : entry.content)}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{formatDate(new Date(entry.created_at))}</p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {entry.tags.slice(0, 2).map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No journal entries yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}