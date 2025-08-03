'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Calendar, BarChart3, BookOpen } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWithinInterval } from 'date-fns'
import { getMoodEmoji } from '@/lib/utils'
import { fetchUserDataOptimized } from '@/lib/data-optimization'
import { CalendarSkeleton } from '@/components/LoadingSkeleton'

interface CalendarEntry {
  date: string
  moodEntries: Array<{ mood: string; energy_level?: number; notes?: string; created_at: string }>
  journalEntries: Array<{ title?: string; content?: string; mood?: string; tags?: string[]; created_at: string }>
}

interface MoodEntry {
  mood: string
  energy_level?: number
  notes?: string
  created_at: string
}

interface JournalEntry {
  title?: string
  content?: string
  mood?: string
  tags?: string[]
  created_at: string
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<Record<string, CalendarEntry>>({})
  const [loading, setLoading] = useState(true)

  const fetchCalendarData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { moodEntries, journalEntries } = await fetchUserDataOptimized(user.id)
      
      // Filter entries for current month
      const currentMonthStart = startOfMonth(currentDate)
      const currentMonthEnd = endOfMonth(currentDate)
      
      const filteredMoodEntries = moodEntries.filter((entry: MoodEntry) => {
        const entryDate = new Date(entry.created_at)
        return isWithinInterval(entryDate, { start: currentMonthStart, end: currentMonthEnd })
      })
      
      const filteredJournalEntries = journalEntries.filter((entry: JournalEntry) => {
        const entryDate = new Date(entry.created_at)
        return isWithinInterval(entryDate, { start: currentMonthStart, end: currentMonthEnd })
      })

      // Group entries by date
      const groupedData: Record<string, CalendarEntry> = {}
      
      filteredMoodEntries.forEach((entry: MoodEntry) => {
        const dateStr = format(new Date(entry.created_at), 'yyyy-MM-dd')
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { date: dateStr, moodEntries: [], journalEntries: [] }
        }
        groupedData[dateStr].moodEntries.push(entry)
      })
      
      filteredJournalEntries.forEach((entry: JournalEntry) => {
        const dateStr = format(new Date(entry.created_at), 'yyyy-MM-dd')
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { date: dateStr, moodEntries: [], journalEntries: [] }
        }
        groupedData[dateStr].journalEntries.push(entry)
      })

      setCalendarData(groupedData)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }, [user, currentDate])

  useEffect(() => {
    if (user) {
      fetchCalendarData()
    }
  }, [user, fetchCalendarData])

  const getMoodSummary = (dayData: CalendarEntry) => {
    if (!dayData || !dayData.moodEntries || dayData.moodEntries.length === 0) {
      return null
    }
    
    // Get the most common mood for the day
    const moodCounts: Record<string, number> = {}
    dayData.moodEntries.forEach((entry: MoodEntry) => {
      const mood = entry.mood || 'neutral'
      moodCounts[mood] = (moodCounts[mood] || 0) + 1
    })
    
    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    return mostCommonMood || null
  }

  if (loading) {
    return <CalendarSkeleton />
  }



  // Add padding days for proper calendar layout
  const firstDay = startOfMonth(currentDate)
  const startPadding = new Date(firstDay)
  startPadding.setDate(startPadding.getDate() - firstDay.getDay())

  const lastDay = endOfMonth(currentDate)
  const endPadding = new Date(lastDay)
  endPadding.setDate(endPadding.getDate() + (6 - lastDay.getDay()))

  const allDays = eachDayOfInterval({ start: startPadding, end: endPadding })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Calendar</h1>
        </div>
        <p className="text-gray-600 mt-2">
          View your mood and journal entries in a calendar format.
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Monthly Overview</h2>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center">
              <div className="text-sm font-medium text-gray-600">{day}</div>
            </div>
          ))}
          
          {/* Calendar Days */}
          {allDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayData = calendarData[dateStr] || { moodEntries: [], journalEntries: [] }
            
            return (
              <div
                key={index}
                className={`p-2 min-h-[80px] ${
                  isSameMonth(day, currentDate) 
                    ? 'bg-gradient-to-r from-gray-50 to-white border border-gray-100/50' 
                    : 'bg-gray-50/50'
                } rounded-lg hover:from-gray-100 hover:to-white transition-all duration-300`}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {format(day, 'd')}
                </div>
                
                {(dayData.moodEntries.length > 0 || dayData.journalEntries.length > 0) && (
                  <div className="space-y-1">
                    {/* Mood Summary */}
                    {getMoodSummary(dayData) && (
                      <div className="flex items-center justify-center">
                        <span className="text-lg" title={`Mood: ${getMoodSummary(dayData)}`}>
                          {getMoodEmoji(getMoodSummary(dayData) || 'neutral')}
                        </span>
                      </div>
                    )}

                    {/* Entry Indicators */}
                    <div className="space-y-1">
                      {dayData.moodEntries.length > 0 && (
                        <div className="flex items-center text-xs text-blue-600">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          <span>{dayData.moodEntries.length} mood{dayData.moodEntries.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {dayData.journalEntries.length > 0 && (
                        <div className="flex items-center text-xs text-green-600">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>{dayData.journalEntries.length} journal{dayData.journalEntries.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Legend</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded"></div>
            <span className="text-sm text-gray-600">Days with entries</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Mood entries</span>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">Journal entries</span>
          </div>
        </div>
      </div>
    </div>
  )
} 