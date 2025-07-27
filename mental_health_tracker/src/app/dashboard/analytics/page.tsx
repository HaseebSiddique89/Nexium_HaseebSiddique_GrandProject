'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, getMoodEmoji, getMoodColor } from '@/lib/utils'
import { BarChart3, TrendingUp, Calendar, Activity, Target, Lightbulb } from 'lucide-react'
import { fetchAnalyticsDataOptimized } from '@/lib/data-optimization'

interface MoodEntry {
  id: string
  mood: string
  energy_level: number
  created_at: string
}

interface JournalEntry {
  id: string
  mood: string | null
  created_at: string
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user])

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return
    
    try {
      const { moodEntries, journalEntries } = await fetchAnalyticsDataOptimized(user.id)
      setMoodEntries(moodEntries)
      setJournalEntries(journalEntries)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const getMoodDistribution = () => {
    const distribution: Record<string, number> = {}
    moodEntries.forEach(entry => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1
    })
    return distribution
  }

  const getWeeklyTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => {
      const dayEntries = moodEntries.filter(entry => 
        entry.created_at.startsWith(date)
      )
      
      if (dayEntries.length === 0) return { date, averageMood: null }
      
      const moodValues = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
      const averageMood = dayEntries.reduce((sum, entry) => {
        return sum + (moodValues[entry.mood as keyof typeof moodValues] || 3)
      }, 0) / dayEntries.length
      
      return { date, averageMood: Math.round(averageMood * 10) / 10 }
    })
  }

  const getInsights = () => {
    const insights = []
    
    if (moodEntries.length === 0) {
      insights.push("Start tracking your mood to see insights here!")
      return insights
    }

    // Most common mood
    const moodDistribution = getMoodDistribution()
    const mostCommonMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0]
    if (mostCommonMood) {
      insights.push(`Your most common mood is ${mostCommonMood[0]} (${mostCommonMood[1]} times)`)
    }

    // Average energy level
    const avgEnergy = moodEntries.reduce((sum, entry) => sum + entry.energy_level, 0) / moodEntries.length
    insights.push(`Your average energy level is ${Math.round(avgEnergy * 10) / 10}/10`)

    // Streak calculation
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasEntry = moodEntries.some(entry => {
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
    
    if (currentStreak > 0) {
      insights.push(`You're on a ${currentStreak}-day tracking streak!`)
    }

    return insights
  }

  const weeklyTrend = getWeeklyTrend()
  const moodDistribution = getMoodDistribution()
  const insights = getInsights()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Analytics</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Understand your mental health patterns and trends over time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{moodEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Journal Entries</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{journalEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Energy</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {moodEntries.length > 0 
                  ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.energy_level, 0) / moodEntries.length * 10) / 10
                  : 0
                }/10
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tracking Days</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {moodEntries.length > 0 ? Math.ceil((new Date().getTime() - new Date(moodEntries[moodEntries.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Weekly Trend</h2>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyTrend.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{day.date}</div>
              <div className="h-20 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100/50 flex items-end justify-center p-1">
                {day.averageMood ? (
                  <div 
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ height: `${(day.averageMood / 5) * 100}%` }}
                  ></div>
                ) : (
                  <div className="text-xs text-gray-400">No data</div>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {day.averageMood ? `${day.averageMood}/5` : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Mood Distribution</h2>
          </div>
          {Object.keys(moodDistribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(moodDistribution).map(([mood, count]) => (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getMoodEmoji(mood)}</span>
                    <span className="capitalize text-gray-900">{mood}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getMoodColor(mood).split(' ')[1]}`}
                        style={{ width: `${(count / moodEntries.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No mood data available</p>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100/50">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 