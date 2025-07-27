'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, getMoodEmoji, getMoodColor } from '@/lib/utils'
import { BarChart3, TrendingUp, Calendar, Activity, Target } from 'lucide-react'
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Understand your mental health patterns and trends over time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{moodEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Journal Entries</p>
              <p className="text-2xl font-bold text-gray-900">{journalEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Energy</p>
              <p className="text-2xl font-bold text-gray-900">
                {moodEntries.length > 0 
                  ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.energy_level, 0) / moodEntries.length * 10) / 10
                  : 0
                }/10
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tracking Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(moodEntries.map(entry => entry.created_at.split('T')[0])).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Mood Trend</h2>
        <div className="grid grid-cols-7 gap-2">
          {weeklyTrend.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="h-20 bg-gray-100 rounded flex items-end justify-center p-1">
                {day.averageMood ? (
                  <div 
                    className="w-full bg-blue-500 rounded"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h2>
          {Object.keys(moodDistribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(moodDistribution).map(([mood, count]) => (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getMoodEmoji(mood)}</span>
                    <span className="capitalize">{mood}</span>
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
            <p className="text-gray-500 text-center">No mood data available</p>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 