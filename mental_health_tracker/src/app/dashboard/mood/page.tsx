'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Target,
  Award,
  Smile,
  Frown,
  Meh,
  Zap,
  Star
} from 'lucide-react'

interface MoodEntry {
  id: string
  mood: string
  energy_level?: number
  notes?: string
  created_at: string
}

export default function MoodPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMoodEntries = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMoodEntries(data || [])
    } catch (error) {
      console.error('Error fetching mood entries:', error)
      toast.error('Failed to load mood entries')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchMoodEntries()
    }
  }, [user, fetchMoodEntries])

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent': return <Smile className="h-6 w-6 text-green-600" />
      case 'good': return <Smile className="h-5 w-5 text-blue-600" />
      case 'neutral': return <Meh className="h-5 w-5 text-yellow-600" />
      case 'bad': return <Frown className="h-5 w-5 text-orange-600" />
      case 'terrible': return <Frown className="h-6 w-6 text-red-600" />
      default: return <Meh className="h-5 w-5 text-zinc-600" />
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'neutral': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'bad': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'terrible': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
  }

  const calculateStats = () => {
    if (moodEntries.length === 0) return null

    const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
    const scores = moodEntries.map(entry => moodScores[entry.mood as keyof typeof moodScores])
    const averageMood = scores.reduce((sum, score) => sum + score, 0) / scores.length

    // Calculate most common mood
    const moodCounts = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'

    // Calculate streak
    let streakDays = 0
    if (moodEntries.length > 0) {
      const moodDates = [...new Set(moodEntries.map(entry => new Date(entry.created_at).toDateString()))]
      moodDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      
      for (let i = 0; i < moodDates.length - 1; i++) {
        const currentDate = new Date(moodDates[i])
        const nextDate = new Date(moodDates[i + 1])
        const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff <= 1) {
          streakDays++
        } else {
          break
        }
      }
      // Add 1 for the first day
      streakDays++
    }

    // Calculate recent trend
    const recentEntries = moodEntries.slice(0, 7)
    const olderEntries = moodEntries.slice(7, 14)
    
    const recentAvg = recentEntries.length > 0 ? 
      recentEntries.reduce((sum, entry) => sum + moodScores[entry.mood as keyof typeof moodScores], 0) / recentEntries.length : 3
    const olderAvg = olderEntries.length > 0 ? 
      olderEntries.reduce((sum, entry) => sum + moodScores[entry.mood as keyof typeof moodScores], 0) / olderEntries.length : 3
    
    let recentTrend: 'up' | 'down' | 'stable' = 'stable'
    if (recentAvg > olderAvg + 0.5) recentTrend = 'up'
    else if (recentAvg < olderAvg - 0.5) recentTrend = 'down'

    return {
      totalEntries: moodEntries.length,
      averageMood,
      mostCommonMood,
      streakDays,
      recentTrend
    }
  }

  const stats = calculateStats()

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
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Mood Tracking</h1>
          </div>
          <p className="text-zinc-600 mt-2">Track your daily moods and energy levels to understand your patterns.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/mood/new')}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Add Mood Entry</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Total Entries</p>
                <p className="text-3xl font-bold text-zinc-900">{stats.totalEntries}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+5 this week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Average Mood</p>
                <p className="text-3xl font-bold text-zinc-900">{stats.averageMood.toFixed(1)}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              {stats.recentTrend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : stats.recentTrend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : (
                <Activity className="h-4 w-4 text-yellow-600" />
              )}
              <span className={`text-sm ${stats.recentTrend === 'up' ? 'text-green-600' : stats.recentTrend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                {stats.recentTrend === 'up' ? 'Improving' : stats.recentTrend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Most Common</p>
                <p className="text-3xl font-bold text-zinc-900 capitalize">{stats.mostCommonMood}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                {getMoodIcon(stats.mostCommonMood)}
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-600">Your pattern</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Current Streak</p>
                <p className="text-3xl font-bold text-zinc-900">{stats.streakDays} days</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-600">Keep it up!</span>
            </div>
          </div>
        </div>
      )}

      {/* Mood Entries */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-900">Recent Entries</h2>
        </div>
        
        {moodEntries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-zinc-100 to-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">No mood entries yet</h3>
            <p className="text-zinc-600 mb-6">Start tracking your mood to see patterns and insights.</p>
            <button
              onClick={() => router.push('/dashboard/mood/new')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Entry</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {moodEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${getMoodColor(entry.mood)}`}>
                      {getMoodIcon(entry.mood)}
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-900 capitalize">{entry.mood}</h3>
                      <p className="text-sm text-zinc-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                      {entry.energy_level && (
                        <p className="text-xs text-zinc-500">Energy: {entry.energy_level}/10</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {entry.notes && (
                  <div className="mt-3 p-3 bg-zinc-50 rounded-lg">
                    <p className="text-sm text-zinc-700">{entry.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/mood/new')}
            className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors"
          >
            <Plus className="h-5 w-5 text-green-600" />
            <span className="font-medium text-zinc-900">Add New Entry</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-zinc-900">View Analytics</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-zinc-900">Set Goals</span>
          </button>
        </div>
      </div>
    </div>
  )
} 