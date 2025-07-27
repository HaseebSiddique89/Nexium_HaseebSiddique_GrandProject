'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, getMoodEmoji, getMoodColor } from '@/lib/utils'
import { Plus, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import { fetchUserDataOptimized } from '@/lib/data-optimization'

interface MoodEntry {
  id: string
  mood: string
  energy_level: number
  notes: string | null
  activities: string[]
  created_at: string
}

export default function MoodTrackerPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMoodEntries()
    }
  }, [user])

  const fetchMoodEntries = useCallback(async () => {
    if (!user) return
    
    try {
      const { moodEntries } = await fetchUserDataOptimized(user.id)
      setEntries(moodEntries)
    } catch (error) {
      console.error('Error fetching mood entries:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const getMoodStats = () => {
    if (!entries.length) return { averageMood: 0, totalEntries: 0, currentStreak: 0 }

    const moodValues = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
    const averageMood = entries.reduce((sum, entry) => {
      return sum + (moodValues[entry.mood as keyof typeof moodValues] || 3)
    }, 0) / entries.length

    // Calculate streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.created_at)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === checkDate.getTime()
      })
      
      if (hasEntry) {
        streak++
      } else {
        break
      }
    }

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries: entries.length,
      currentStreak: streak
    }
  }

  const stats = getMoodStats()

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="text-gray-600 mt-2">
            Track your daily mood and energy levels to understand your mental health patterns.
          </p>
        </div>
        <Link
          href="/dashboard/mood/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageMood}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
        </div>
        
        {entries.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No mood entries yet. Start tracking your mood!</p>
            <Link
              href="/dashboard/mood/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Entry
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                          {entry.mood}
                        </span>
                        <span className="text-sm text-gray-500">
                          Energy: {entry.energy_level}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(new Date(entry.created_at))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                {entry.notes && (
                  <p className="text-gray-700 mt-3 text-sm">{entry.notes}</p>
                )}
                
                {entry.activities && entry.activities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Activities:</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.activities.map((activity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 