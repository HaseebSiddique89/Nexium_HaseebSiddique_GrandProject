'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, getMoodEmoji, getMoodColor } from '@/lib/utils'
import { Plus, Calendar, TrendingUp, BarChart3, Heart, Activity, Clock } from 'lucide-react'
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
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
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
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Mood Tracker</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Track your daily mood and energy levels to understand your mental health patterns.
          </p>
        </div>
        <Link
          href="/dashboard/mood/new"
          className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-xl hover:from-blue-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl focus-ring"
        >
          <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add Entry
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{stats.averageMood}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Entries ({entries.length})
            </h2>
          </div>
        </div>
        
        {entries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No mood entries yet. Start tracking your mood!</p>
            <Link
              href="/dashboard/mood/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-xl hover:from-blue-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl focus-ring"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Entry
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50">
            {entries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl animate-float">{getMoodEmoji(entry.mood)}</div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(entry.mood)} shadow-sm`}>
                          {entry.mood}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Activity className="h-4 w-4" />
                          <span>Energy: {entry.energy_level}/10</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {formatDate(new Date(entry.created_at))}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">
                      {new Date(entry.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                {entry.notes && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100/50">
                    <p className="text-gray-700 text-sm leading-relaxed">{entry.notes}</p>
                  </div>
                )}
                
                {entry.activities && entry.activities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Activities:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.activities.map((activity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 text-xs rounded-full border border-blue-200/50 font-medium"
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