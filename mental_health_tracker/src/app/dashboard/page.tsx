'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Target,
  Calendar,
  Clock,
  Award,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  Users,
  Star,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  BookOpen
} from 'lucide-react'

interface DashboardStats {
  totalMoodEntries: number
  totalJournalEntries: number
  averageMood: number
  moodStreakDays: number
  journalStreakDays: number
  weeklyTrend: 'up' | 'down' | 'stable'
  recentMoods: Array<{ mood: string; created_at: string; energy_level?: number }>
  recentJournalEntries: Array<{ title: string; content: string; created_at: string }>
  weeklyGrowth: number
  journalGrowth: number
  moodTrackingDays: number
  journalTrackingDays: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

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

      // Calculate stats
      const totalMoodEntries = moodEntries?.length || 0
      const totalJournalEntries = journalEntries?.length || 0
      
      const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
      const scores = moodEntries?.map(entry => moodScores[entry.mood as keyof typeof moodScores]) || []
      const averageMood = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 3

      // Calculate mood tracking days (unique days with mood entries)
      const moodTrackingDays = moodEntries ? 
        new Set(moodEntries.map(entry => new Date(entry.created_at).toDateString())).size : 0

      // Calculate journal tracking days (unique days with journal entries)
      const journalTrackingDays = journalEntries ? 
        new Set(journalEntries.map(entry => new Date(entry.created_at).toDateString())).size : 0

      // Calculate mood streak (consecutive days with mood entries)
      let moodStreakDays = 0
      if (moodEntries && moodEntries.length > 0) {
        const moodDates = [...new Set(moodEntries.map(entry => new Date(entry.created_at).toDateString()))]
        moodDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        
        for (let i = 0; i < moodDates.length - 1; i++) {
          const currentDate = new Date(moodDates[i])
          const nextDate = new Date(moodDates[i + 1])
          const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
          if (dayDiff <= 1) {
            moodStreakDays++
          } else {
            break
          }
        }
        // Add 1 for the first day
        moodStreakDays++
      }

      // Calculate journal streak (consecutive days with journal entries)
      let journalStreakDays = 0
      if (journalEntries && journalEntries.length > 0) {
        const journalDates = [...new Set(journalEntries.map(entry => new Date(entry.created_at).toDateString()))]
        journalDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        
        for (let i = 0; i < journalDates.length - 1; i++) {
          const currentDate = new Date(journalDates[i])
          const nextDate = new Date(journalDates[i + 1])
          const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
          if (dayDiff <= 1) {
            journalStreakDays++
          } else {
            break
          }
        }
        // Add 1 for the first day
        journalStreakDays++
      }

      // Determine weekly trend
      const recentMoods = moodEntries?.slice(0, 7) || []
      const olderMoods = moodEntries?.slice(7, 14) || []
      
      const recentAvg = recentMoods.length > 0 ? 
        recentMoods.reduce((sum, entry) => sum + moodScores[entry.mood as keyof typeof moodScores], 0) / recentMoods.length : 3
      const olderAvg = olderMoods.length > 0 ? 
        olderMoods.reduce((sum, entry) => sum + moodScores[entry.mood as keyof typeof moodScores], 0) / olderMoods.length : 3
      
      let weeklyTrend: 'up' | 'down' | 'stable' = 'stable'
      if (recentAvg > olderAvg + 0.5) weeklyTrend = 'up'
      else if (recentAvg < olderAvg - 0.5) weeklyTrend = 'down'

      // Calculate weekly growth percentages
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

      const weeklyGrowth = lastWeekMoods.length > 0 ? 
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

      const journalGrowth = lastWeekJournals.length > 0 ? 
        ((thisWeekJournals.length - lastWeekJournals.length) / lastWeekJournals.length) * 100 : 0

      setStats({
        totalMoodEntries,
        totalJournalEntries,
        averageMood,
        moodStreakDays,
        journalStreakDays,
        weeklyTrend,
        recentMoods: moodEntries || [],
        recentJournalEntries: journalEntries || [],
        weeklyGrowth,
        journalGrowth,
        moodTrackingDays,
        journalTrackingDays
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'down': return <TrendingDown className="h-5 w-5 text-red-600" />
      default: return <Activity className="h-5 w-5 text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-xl w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-2xl"></div>
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
          <h1 className="text-3xl font-bold text-zinc-900">Welcome back!</h1>
          <p className="text-zinc-600 mt-2">Here's what's happening with your mental health journey.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Today</span>
          </button>
          <button 
            onClick={() => router.push('/dashboard/mood/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Total Mood Entries */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-600 mb-1">Total Mood Entries</p>
              <p className="text-xl font-bold text-zinc-900">{stats?.totalMoodEntries || 0}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {stats?.weeklyGrowth !== undefined && (
              <>
                {stats.weeklyGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${stats.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.weeklyGrowth >= 0 ? '+' : ''}{Math.round(stats.weeklyGrowth)}% this week
                </span>
              </>
            )}
          </div>
        </div>

        {/* Journal Entries */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-600 mb-1">Journal Entries</p>
              <p className="text-xl font-bold text-zinc-900">{stats?.totalJournalEntries || 0}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {stats?.journalGrowth !== undefined && (
              <>
                {stats.journalGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${stats.journalGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.journalGrowth >= 0 ? '+' : ''}{Math.round(stats.journalGrowth)}% this week
                </span>
              </>
            )}
          </div>
        </div>

        {/* Average Mood */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-600 mb-1">Average Mood</p>
              <p className="text-xl font-bold text-zinc-900">{stats?.averageMood.toFixed(1) || '3.0'}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon(stats?.weeklyTrend || 'stable')}
            <span className={`text-xs font-medium ${stats?.weeklyTrend === 'up' ? 'text-green-600' : stats?.weeklyTrend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
              {stats?.weeklyTrend === 'up' ? 'Improving' : stats?.weeklyTrend === 'down' ? 'Declining' : 'Stable'}
            </span>
          </div>
        </div>

        {/* Mood Streak */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-600 mb-1">Mood Streak</p>
              <p className="text-xl font-bold text-zinc-900">{stats?.moodStreakDays || 0} days</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">
              {stats?.moodStreakDays === 0 ? 'Start tracking!' : 'Keep it up!'}
            </span>
          </div>
        </div>

        {/* Journal Streak */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-600 mb-1">Journal Streak</p>
              <p className="text-xl font-bold text-zinc-900">{stats?.journalStreakDays || 0} days</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">
              {stats?.journalStreakDays === 0 ? 'Start writing!' : 'Great progress!'}
            </span>
          </div>
        </div>
      </div>

      {/* Tracking Days Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">Mood Tracking Days</p>
              <p className="text-3xl font-bold text-zinc-900">{stats?.moodTrackingDays || 0} days</p>
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
              <p className="text-3xl font-bold text-zinc-900">{stats?.journalTrackingDays || 0} days</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600">Total days tracked</span>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Chart */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">Mood Trends</h3>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {stats?.recentMoods.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gradient-to-r from-zinc-100 to-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-zinc-500">No mood entries yet</p>
              </div>
            ) : (
              stats?.recentMoods.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${entry.mood === 'excellent' ? 'bg-green-500' : entry.mood === 'good' ? 'bg-blue-500' : entry.mood === 'neutral' ? 'bg-yellow-500' : entry.mood === 'bad' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-zinc-900 capitalize">{entry.mood}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    {entry.energy_level && (
                      <span className="text-xs text-zinc-500">Energy: {entry.energy_level}/10</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">Recent Journal Entries</h3>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {stats?.recentJournalEntries.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gradient-to-r from-zinc-100 to-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-zinc-500">No journal entries yet</p>
              </div>
            ) : (
              stats?.recentJournalEntries.slice(0, 3).map((entry, index) => (
                <div key={index} className="p-4 bg-zinc-50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-zinc-900 line-clamp-1">
                      {entry.title || 'Untitled Entry'}
                    </h4>
                    <span className="text-xs text-zinc-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="flex items-center space-x-2 mt-3">
                    <button className="text-xs text-green-600 hover:text-green-700">View</button>
                    <button className="text-xs text-zinc-600 hover:text-zinc-700">Edit</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Quick Actions</h3>
            <p className="text-zinc-600">Track your mood, write in your journal, or explore AI insights.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard/mood/new')}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-zinc-700 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
            >
              <Heart className="h-4 w-4" />
              <span>Track Mood</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/journal/new')}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-zinc-700 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
            >
              <Activity className="h-4 w-4" />
              <span>Write Journal</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/ai-insights')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
            >
              <Brain className="h-4 w-4" />
              <span>AI Insights</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Mood Tracker</h4>
              <p className="text-sm text-zinc-600">{stats?.moodStreakDays || 0}-day streak</p>
            </div>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" 
              style={{ width: `${Math.min((stats?.moodStreakDays || 0) * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Journal Writer</h4>
              <p className="text-sm text-zinc-600">{stats?.journalStreakDays || 0}-day streak</p>
            </div>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
              style={{ width: `${Math.min((stats?.journalStreakDays || 0) * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Tracking Days</h4>
              <p className="text-sm text-zinc-600">{stats?.moodTrackingDays || 0} total days</p>
            </div>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" 
              style={{ width: `${Math.min((stats?.moodTrackingDays || 0) * 2, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}