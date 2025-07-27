'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { clearAICache } from '@/lib/ai-insights-enhanced'
import { toast } from 'sonner'
import { ArrowLeft, Save, Smile, Frown, Meh, Activity } from 'lucide-react'
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
  const [formData, setFormData] = useState({
    mood: '',
    energy_level: 5,
    notes: '',
    activities: [] as string[],
  })

  const handleMoodSelect = (mood: string) => {
    setFormData(prev => ({ ...prev, mood }))
  }

  const handleEnergyChange = (level: number) => {
    setFormData(prev => ({ ...prev, energy_level: level }))
  }

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.mood) {
      toast.error('Please select a mood')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user?.id,
          mood: formData.mood,
          energy_level: formData.energy_level,
          notes: formData.notes || null,
          activities: formData.activities,
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/mood"
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Mood Entry</h1>
          <p className="text-gray-600 mt-2">
            How are you feeling today? Track your mood and energy level.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            How are you feeling today?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleMoodSelect(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.mood === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Energy Level (1-10)
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Low</span>
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => handleEnergyChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <span className="text-sm text-gray-500">High</span>
            <span className="text-lg font-bold text-gray-900 w-8 text-center">
              {formData.energy_level}
            </span>
          </div>
        </div>

        {/* Activities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            What did you do today? (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {activityOptions.map((activity) => (
              <button
                key={activity}
                type="button"
                onClick={() => handleActivityToggle(activity)}
                className={`p-2 rounded-md text-sm transition-colors ${
                  formData.activities.includes(activity)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
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
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500/50 text-black"
            placeholder="How was your day? Any specific thoughts or feelings you'd like to note?"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard/mood"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.mood}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Entry
          </button>
        </div>
      </form>
    </div>
  )
} 