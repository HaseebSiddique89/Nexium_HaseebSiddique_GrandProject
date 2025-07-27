'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
import { fetchUserDataOptimized, clearUserCache } from '@/lib/data-optimization'
import { DashboardSkeleton } from '@/components/LoadingSkeleton'

const DashboardPage = React.memo(function DashboardPage() {
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

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // Use optimized data fetching
      const { moodEntries, journalEntries } = await fetchUserDataOptimized(user.id)

      // Calculate stats using memoization
      const totalMoodEntries = moodEntries.length
      const totalJournalEntries = journalEntries.length

      // Calculate average mood
      const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
      const scores = moodEntries.map((entry: any) => moodScores[entry.mood as keyof typeof moodScores])
      const averageMood = scores.length > 0 ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0

      // Calculate current streak - using the same logic as mood tracker
      let currentStreak = 0
      if (moodEntries.length > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(today.getDate() - i)
          
          const hasEntry = moodEntries.some((entry: any) => {
            const entryDate = new Date(entry.created_at)
            entryDate.setHours(0, 0, 0, 0)
            return entryDate.getTime() === checkDate.getTime()
          })
          
          if (hasEntry) {
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

      setRecentMoodEntries(moodEntries.slice(0, 5))
      setRecentJournalEntries(journalEntries.slice(0, 3))

      // Check if data has changed before calling AI insights
      const currentDataHash = JSON.stringify({
        moodCount: moodEntries.length,
        journalCount: journalEntries.length,
        latestMood: moodEntries[0]?.created_at || '',
        latestJournal: journalEntries[0]?.created_at || ''
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
  }, [user, lastDataHash, aiInsights])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.email}! Here&apos;s your mental health overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mood Entries</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalMoodEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Journal Entries</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalJournalEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <span className="text-2xl">😊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{stats.averageMood.toFixed(1)}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Preview */}
      {aiInsights && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Insights */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Insights</h3>
              <div className="space-y-2">
                {aiInsights.aiGeneratedInsights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recommendation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Top Recommendation</h3>
              {aiInsights.personalizedRecommendations.length > 0 ? (
                <div className="flex items-start space-x-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100/50">
                  <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{aiInsights.personalizedRecommendations[0]}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Keep up the great work!</p>
              )}
            </div>
          </div>

          {/* Sentiment Preview */}
          <div className="mt-4 pt-4 border-t border-gray-200/50">
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
                <span className="ml-2 text-sm text-gray-600 font-medium">{aiInsights.sentimentAnalysis.sentimentScore.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center shadow-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/mood/new"
            className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 hover-lift"
          >
            <Plus className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-gray-900">Add Mood Entry</span>
          </Link>
          <Link
            href="/dashboard/journal/new"
            className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover-lift"
          >
            <Plus className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-gray-900">Write Journal Entry</span>
          </Link>
          <Link
            href="/dashboard/ai-insights"
            className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover-lift"
          >
            <Brain className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-gray-900">View AI Insights</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mood Entries */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Mood Entries</h2>
              </div>
              <Link href="/dashboard/mood" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentMoodEntries.length > 0 ? (
                recentMoodEntries.map((entry) => (
                  <div key={entry.created_at} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100/50 hover:from-gray-100 hover:to-white transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <div>
                        <p className="font-medium capitalize text-gray-900">{entry.mood}</p>
                        <p className="text-sm text-gray-600">{formatDate(new Date(entry.created_at))}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)} shadow-sm`}>
                      Energy: {entry.energy_level}/10
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No mood entries yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Journal Entries</h2>
              </div>
              <Link href="/dashboard/journal" className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentJournalEntries.length > 0 ? (
                recentJournalEntries.map((entry) => (
                  <div key={entry.created_at} className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100/50 hover:from-gray-100 hover:to-white transition-all duration-300">
                    <h3 className="font-medium text-gray-900 mb-1">{entry.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {entry.content && (entry.content.length > 100 ? `${entry.content.substring(0, 100)}...` : entry.content)}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{formatDate(new Date(entry.created_at))}</p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {entry.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs rounded-full border border-green-200/50">
                              {tag}
                            </span>
                          ))}
                          {entry.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{entry.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No journal entries yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default DashboardPage