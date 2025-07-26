'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Calendar, ChevronLeft, ChevronRight, Plus, BarChart3, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { getMoodEmoji, getMoodColor } from '@/lib/utils'

interface CalendarEntry {
  date: string
  moodEntries: any[]
  journalEntries: any[]
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCalendarData()
    }
  }, [user, currentDate])

  const fetchCalendarData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const startDate = startOfMonth(currentDate)
      const endDate = endOfMonth(currentDate)

      // Fetch mood entries for the month
      const { data: moodEntries, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (moodError) throw moodError

      // Fetch journal entries for the month
      const { data: journalEntries, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (journalError) throw journalError

      // Create calendar data
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      const calendarData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayMoodEntries = moodEntries?.filter(entry => 
          isSameDay(new Date(entry.created_at), day)
        ) || []
        const dayJournalEntries = journalEntries?.filter(entry => 
          isSameDay(new Date(entry.created_at), day)
        ) || []

        return {
          date: dateStr,
          moodEntries: dayMoodEntries,
          journalEntries: dayJournalEntries,
        }
      })

      setCalendarData(calendarData)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getDayClass = (day: Date, entries: CalendarEntry) => {
    const baseClass = 'h-24 p-2 border border-gray-200 hover:bg-gray-50 transition-colors'
    
    if (!isSameMonth(day, currentDate)) {
      return `${baseClass} bg-gray-100 text-gray-400`
    }

    if (entries.moodEntries.length > 0 || entries.journalEntries.length > 0) {
      return `${baseClass} bg-blue-50 border-blue-200`
    }

    return baseClass
  }

  const getMoodSummary = (entries: CalendarEntry) => {
    if (entries.moodEntries.length === 0) return null
    
    const moods = entries.moodEntries.map(entry => entry.mood)
    const mostFrequentMood = moods.sort((a, b) => 
      moods.filter(v => v === a).length - moods.filter(v => v === b).length
    ).pop()
    
    return mostFrequentMood
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const days = eachDayOfInterval({ 
    start: startOfMonth(currentDate), 
    end: endOfMonth(currentDate) 
  })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">
            View your mood and journal entries in a calendar format.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/dashboard/mood/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Mood
          </Link>
          <Link
            href="/dashboard/journal/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Journal
          </Link>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {allDays.map((day, index) => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const dayData = calendarData.find(entry => entry.date === dayStr) || {
              date: dayStr,
              moodEntries: [],
              journalEntries: []
            }
            const moodSummary = getMoodSummary(dayData)

            return (
              <div
                key={index}
                className={getDayClass(day, dayData)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isSameMonth(day, currentDate) ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {moodSummary && (
                    <span className="text-lg" title={`Mood: ${moodSummary}`}>
                      {getMoodEmoji(moodSummary)}
                    </span>
                  )}
                </div>

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
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
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