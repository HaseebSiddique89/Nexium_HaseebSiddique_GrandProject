'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Activity,
  Heart,
  Calendar,
  Award,
  Star,
  BookOpen,
  Zap
} from 'lucide-react'

interface AnalyticsData {
  moodTrackingDays: number
  journalTrackingDays: number
  totalMoodEntries: number
  totalJournalEntries: number
  averageMood: number
  moodStreak: number
  journalStreak: number
  combinedStreak: number
  weeklyMoodGrowth: number
  weeklyJournalGrowth: number
  moodDistribution: Record<string, number>
  journalLengthStats: {
    averageLength: number
    longestEntry: number
    shortestEntry: number
  }
  recentActivity: Array<{
    type: 'mood' | 'journal'
    date: string
    title: string
    value?: string
  }>
}

interface MoodEntry {
  id: string
  user_id: string
  mood: string
  energy_level: number
  notes?: string
  created_at: string
}

interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const calculateStreak = (entries: (MoodEntry | JournalEntry)[]) => {
    if (entries.length === 0) return 0
    
    const sortedEntries = entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const uniqueDates = [...new Set(sortedEntries.map(entry => new Date(entry.created_at).toDateString()))]
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    let streak = 0
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = new Date(uniqueDates[i])
      const nextDate = new Date(uniqueDates[i + 1])
      const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
      if (dayDiff <= 1) {
        streak++
      } else {
        break
      }
    }
    // Add 1 for the first day if there's at least one entry
    return uniqueDates.length > 0 ? streak + 1 : 0
  }

  const calculateCombinedStreak = useCallback((moodEntries: MoodEntry[], journalEntries: JournalEntry[]) => {
    const allEntries = [...moodEntries, ...journalEntries]
    return calculateStreak(allEntries)
  }, [])

  const fetchAnalytics = useCallback(async () => {
    if (!user) return

    setLoading(true)
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

      // Calculate analytics
      const totalMoodEntries = moodEntries?.length || 0
      const totalJournalEntries = journalEntries?.length || 0

      // Calculate tracking days
      const moodTrackingDays = moodEntries ? 
        new Set(moodEntries.map(entry => new Date(entry.created_at).toDateString())).size : 0
      const journalTrackingDays = journalEntries ? 
        new Set(journalEntries.map(entry => new Date(entry.created_at).toDateString())).size : 0

      // Calculate average mood
      const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
      const scores = moodEntries?.map(entry => moodScores[entry.mood as keyof typeof moodScores]) || []
      const averageMood = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 3

      // Calculate streaks
      const moodStreak = calculateStreak(moodEntries || [])
      const journalStreak = calculateStreak(journalEntries || [])
      const combinedStreak = calculateCombinedStreak(moodEntries || [], journalEntries || [])

      // Calculate mood distribution
      const moodDistribution = moodEntries?.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Calculate journal length stats
      const journalLengthStats = {
        averageLength: journalEntries && journalEntries.length > 0 ? 
          journalEntries.reduce((sum, entry) => sum + entry.content.length, 0) / journalEntries.length : 0,
        longestEntry: journalEntries && journalEntries.length > 0 ? 
          Math.max(...journalEntries.map(entry => entry.content.length)) : 0,
        shortestEntry: journalEntries && journalEntries.length > 0 ? 
          Math.min(...journalEntries.map(entry => entry.content.length)) : 0
      }

      // Calculate weekly growth
      const thisWeekMoods = moodEntries?.filter(entry => {
        const entryDate = new Date(entry.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return entryDate >= weekAgo
      }) || []

      const lastWeekMoods = moodEntries?.filter(entry => {
        const entryDate = new Date(entry.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        return entryDate >= twoWeeksAgo && entryDate < weekAgo
      }) || []

      const weeklyMoodGrowth = lastWeekMoods.length > 0 ? 
        ((thisWeekMoods.length - lastWeekMoods.length) / lastWeekMoods.length) * 100 : 0

      const thisWeekJournals = journalEntries?.filter(entry => {
        const entryDate = new Date(entry.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return entryDate >= weekAgo
      }) || []

      const lastWeekJournals = journalEntries?.filter(entry => {
        const entryDate = new Date(entry.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        return entryDate >= twoWeeksAgo && entryDate < weekAgo
      }) || []

      const weeklyJournalGrowth = lastWeekJournals.length > 0 ? 
        ((thisWeekJournals.length - lastWeekJournals.length) / lastWeekJournals.length) * 100 : 0

      // Create recent activity
      const recentActivity = []
      const allEntries = [
        ...(moodEntries || []).map(entry => ({ ...entry, type: 'mood' as const })),
        ...(journalEntries || []).map(entry => ({ ...entry, type: 'journal' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      recentActivity.push(...allEntries.slice(0, 10).map(entry => ({
        type: entry.type,
        date: entry.created_at,
        title: entry.type === 'mood' ? `Mood: ${entry.mood}` : entry.title || 'Untitled',
        value: entry.type === 'mood' ? entry.mood : entry.content?.substring(0, 50) + '...'
      })))

      setAnalytics({
        moodTrackingDays,
        journalTrackingDays,
        totalMoodEntries,
        totalJournalEntries,
        averageMood,
        moodStreak,
        journalStreak,
        combinedStreak,
        weeklyMoodGrowth,
        weeklyJournalGrowth,
        moodDistribution,
        journalLengthStats,
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [user, calculateCombinedStreak])

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, fetchAnalytics])

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'neutral': return 'text-yellow-600 bg-yellow-100'
      case 'bad': return 'text-orange-600 bg-orange-100'
      case 'terrible': return 'text-red-600 bg-red-100'
      default: return 'text-zinc-600 bg-zinc-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-xl w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Analytics</h1>
          </div>
          <p className="text-zinc-600 mt-2">Detailed insights into your mental health tracking patterns.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-zinc-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tracking Days Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">Mood Tracking Days</p>
              <p className="text-3xl font-bold text-zinc-900">{analytics?.moodTrackingDays || 0}</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Total days tracked</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">Journal Tracking Days</p>
              <p className="text-3xl font-bold text-zinc-900">{analytics?.journalTrackingDays || 0}</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600">Total days tracked</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">Mood Streak</p>
              <p className="text-3xl font-bold text-zinc-900">{analytics?.moodStreak || 0} days</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-600">Consecutive days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">Journal Streak</p>
              <p className="text-3xl font-bold text-zinc-900">{analytics?.journalStreak || 0} days</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Zap className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-600">Consecutive days</span>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Analytics */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Mood Analytics</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-sm font-medium text-zinc-700">Total Entries</span>
              <span className="text-lg font-bold text-zinc-900">{analytics?.totalMoodEntries || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-sm font-medium text-zinc-700">Average Mood</span>
              <span className="text-lg font-bold text-zinc-900">{analytics?.averageMood.toFixed(1) || '3.0'}</span>
            </div>
            
                         <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
               <span className="text-sm font-medium text-zinc-700">Weekly Growth</span>
               <span className={`text-lg font-bold ${(analytics?.weeklyMoodGrowth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                 {(analytics?.weeklyMoodGrowth ?? 0) >= 0 ? '+' : ''}{Math.round(analytics?.weeklyMoodGrowth || 0)}%
               </span>
             </div>
          </div>

          {/* Mood Distribution */}
          {analytics?.moodDistribution && Object.keys(analytics.moodDistribution).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-zinc-700 mb-3">Mood Distribution</h4>
              <div className="space-y-2">
                {Object.entries(analytics.moodDistribution).map(([mood, count]) => (
                  <div key={mood} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMoodColor(mood)}`}>
                      {mood}
                    </span>
                    <span className="text-sm font-medium text-zinc-900">{count} entries</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journal Analytics */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Journal Analytics</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-sm font-medium text-zinc-700">Total Entries</span>
              <span className="text-lg font-bold text-zinc-900">{analytics?.totalJournalEntries || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="text-sm font-medium text-zinc-700">Average Length</span>
              <span className="text-lg font-bold text-zinc-900">{Math.round(analytics?.journalLengthStats.averageLength || 0)} chars</span>
            </div>
            
                         <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
               <span className="text-sm font-medium text-zinc-700">Weekly Growth</span>
               <span className={`text-lg font-bold ${(analytics?.weeklyJournalGrowth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                 {(analytics?.weeklyJournalGrowth ?? 0) >= 0 ? '+' : ''}{Math.round(analytics?.weeklyJournalGrowth || 0)}%
               </span>
             </div>
          </div>

          {/* Journal Length Stats */}
          {analytics?.journalLengthStats && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-zinc-700 mb-3">Length Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                  <span className="text-sm text-zinc-700">Longest Entry</span>
                  <span className="text-sm font-medium text-zinc-900">{analytics.journalLengthStats.longestEntry} chars</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                  <span className="text-sm text-zinc-700">Shortest Entry</span>
                  <span className="text-sm font-medium text-zinc-900">{analytics.journalLengthStats.shortestEntry} chars</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          {analytics?.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-gradient-to-r from-zinc-100 to-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-zinc-500">No recent activity</p>
            </div>
          ) : (
            analytics?.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'mood' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    {activity.type === 'mood' ? (
                      <Heart className="h-4 w-4 text-white" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{activity.title}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.type === 'mood' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {activity.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 