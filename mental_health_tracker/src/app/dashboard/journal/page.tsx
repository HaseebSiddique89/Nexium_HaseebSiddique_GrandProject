'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, getMoodEmoji } from '@/lib/utils'
import { Plus, BookOpen, Calendar, Search, Tag, TrendingUp } from 'lucide-react'
import { fetchUserDataOptimized } from '@/lib/data-optimization'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

interface DatabaseJournalEntry {
  id: string
  title: string
  content: string
  created_at: string
  mood?: string
  tags?: string[]
  updated_at?: string
}

export default function JournalPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('all')

  const fetchJournalEntries = useCallback(async () => {
    if (!user) return
    
    try {
      const { journalEntries } = await fetchUserDataOptimized(user.id)
      // Transform the data to match the JournalEntry interface
      const transformedEntries = journalEntries.map((entry: DatabaseJournalEntry) => ({
        id: entry.id,
        title: entry.title || '',
        content: entry.content || '',
        mood: entry.mood || null,
        tags: entry.tags || [],
        created_at: entry.created_at,
        updated_at: entry.updated_at || entry.created_at
      }))
      setEntries(transformedEntries)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchJournalEntries()
    }
  }, [user, fetchJournalEntries])

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood
    
    return matchesSearch && matchesMood
  })

  const getUniqueMoods = () => {
    const moods = entries.map(entry => entry.mood).filter((mood): mood is string => mood !== null)
    return [...new Set(moods)]
  }

  const calculateJournalStats = () => {
    if (entries.length === 0) return null

    // Calculate journal streak
    let streakDays = 0
    if (entries.length > 0) {
      const journalDates = [...new Set(entries.map(entry => new Date(entry.created_at).toDateString()))]
      journalDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      
      for (let i = 0; i < journalDates.length - 1; i++) {
        const currentDate = new Date(journalDates[i])
        const nextDate = new Date(journalDates[i + 1])
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

    // Calculate average length
    const totalLength = entries.reduce((sum, entry) => sum + entry.content.length, 0)
    const averageLength = entries.length > 0 ? totalLength / entries.length : 0

    // Calculate total words
    const totalWords = entries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0)

    return {
      totalEntries: entries.length,
      streakDays,
      averageLength,
      totalWords
    }
  }

  const stats = calculateJournalStats()

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
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Journal</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Write and reflect on your thoughts, feelings, and experiences.
          </p>
        </div>
        <Link
          href="/dashboard/journal/new"
          className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl focus-ring"
        >
          <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500/50 text-black transition-all duration-300 hover:border-green-300 focus-ring"
              />
            </div>
          </div>

          {/* Mood Filter */}
          <div className="md:w-48">
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 focus-ring"
              style={{ color: "rgba(0, 0, 0, 0.5)" }}
            >
              <option value="all">All moods</option>
              {getUniqueMoods().map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats?.totalEntries || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Writing Streak</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats?.streakDays || 0} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover-lift group">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {entries.filter(entry => {
                  const entryDate = new Date(entry.created_at)
                  const now = new Date()
                  return entryDate.getMonth() === now.getMonth() && 
                         entryDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Journal Entries ({filteredEntries.length})
            </h2>
          </div>
        </div>
        
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">
              {entries.length === 0 
                ? "No journal entries yet. Start writing to reflect on your thoughts!"
                : "No entries match your search criteria."
              }
            </p>
            {entries.length === 0 && (
              <Link
                href="/dashboard/journal/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl focus-ring"
              >
                <Plus className="h-5 w-5 mr-2" />
                Write First Entry
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white/50 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{entry.title}</h3>
                      {entry.mood && (
                        <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {entry.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(new Date(entry.created_at))}</span>
                      </span>
                      {entry.tags.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4" />
                          <div className="flex space-x-2">
                            {entry.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs rounded-full border border-green-200/50"
                              >
                                {tag}
                              </span>
                            ))}
                            {entry.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{entry.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/journal/${entry.id}`}
                    className="ml-4 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover-lift shadow-md hover:shadow-lg focus-ring"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 