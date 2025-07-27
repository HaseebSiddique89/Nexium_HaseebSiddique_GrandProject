'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { clearAICache } from '@/lib/ai-insights-enhanced'
import { toast } from 'sonner'
import { ArrowLeft, Save, Smile, Frown, Meh, Activity, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const moodOptions = [
  { value: 'excellent', label: 'Excellent', emoji: '😊', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-100 text-blue-800' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'bad', label: 'Bad', emoji: '😔', color: 'bg-orange-100 text-orange-800' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'bg-red-100 text-red-800' },
]

const activityOptions = [
  'Exercise', 'Work', 'Socializing', 'Reading', 'Gaming', 'Cooking', 'Cleaning',
  'Shopping', 'Walking', 'Meditation', 'Music', 'Movies', 'Sleep', 'Family time',
  'Friends', 'Hobbies', 'Learning', 'Travel', 'Rest', 'Other'
]

export default function NewMoodEntryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState('')
  const [energyLevel, setEnergyLevel] = useState(5)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood)
  }

  const handleEnergyChange = (level: number) => {
    setEnergyLevel(level)
  }

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev => prev.includes(activity)
      ? prev.filter(a => a !== activity)
      : [...prev, activity]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMood) {
      toast.error('Please select a mood')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user?.id,
          mood: selectedMood,
          energy_level: energyLevel,
          notes: notes || null,
          activities: selectedActivities,
        })

      if (error) throw error

      // Clear AI cache to ensure fresh insights
      if (user?.id) {
        clearAICache(user.id)
      }

      toast.success('Mood entry added successfully!')
      router.push('/dashboard/mood')
    } catch (error) {
      console.error('Error adding mood entry:', error)
      toast.error('Failed to add mood entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Add Mood Entry</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Track your current mood and energy level to understand your mental health patterns.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedMood === mood.value
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-900">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Energy Level (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gradient-to-r from-red-200 to-yellow-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent min-w-[2rem] text-center">
                {energyLevel}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Exhausted</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What activities did you do today? (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {activityOptions.map((activity) => (
                <button
                  key={activity}
                  type="button"
                  onClick={() => handleActivityToggle(activity)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    selectedActivities.includes(activity)
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500/50 text-black transition-all duration-300 hover:border-blue-400"
              placeholder="How was your day? Any specific thoughts or feelings you'd like to note?"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/mood"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!selectedMood || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-xl hover:from-blue-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Save Entry</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 