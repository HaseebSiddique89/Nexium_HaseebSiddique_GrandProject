'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  CheckCircle
} from 'lucide-react'

export default function NewMoodEntryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    mood: '',
    energy_level: 5,
    notes: ''
  })

  const moodOptions = [
    { value: 'excellent', label: 'Excellent', emoji: '😊', color: 'text-green-600 bg-green-100' },
    { value: 'good', label: 'Good', emoji: '🙂', color: 'text-blue-600 bg-blue-100' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'bad', label: 'Bad', emoji: '😔', color: 'text-orange-600 bg-orange-100' },
    { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'text-red-600 bg-red-100' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.mood) {
      toast.error('Please select your mood')
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to create a mood entry')
      return
    }

    // Test Supabase connection first
    try {
      const { error: testError } = await supabase
        .from('mood_entries')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('Supabase connection test failed:', testError)
        toast.error('Database connection failed. Please try again.')
        return
      }
    } catch (error) {
      console.error('Supabase connection test error:', error)
      toast.error('Database connection failed. Please try again.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: user.id,
            mood: formData.mood,
            energy_level: formData.energy_level,
            notes: formData.notes.trim() || null
          }
        ])

      if (error) {
        console.error('Error adding mood entry:', error)
        toast.error('Failed to save mood entry. Please try again.')
      } else {
        toast.success('Mood entry saved successfully!')
        router.push('/dashboard/mood')
      }
    } catch (error) {
      console.error('Error adding mood entry:', error)
      toast.error('Failed to save mood entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">New Mood Entry</h1>
            <p className="text-zinc-600">Track how you&apos;re feeling today</p>
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.mood}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Entry'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Selection */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <label className="block text-sm font-medium text-zinc-700 mb-4">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('mood', option.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.mood === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{option.emoji}</div>
                    <div className="text-sm font-medium text-zinc-900">{option.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <label className="block text-sm font-medium text-zinc-700 mb-4">
              Energy Level (1-10)
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Low Energy</span>
                <span className="text-sm text-zinc-600">High Energy</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => handleInputChange('energy_level', parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-zinc-900">{formData.energy_level}/10</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-zinc-900 placeholder-zinc-500 resize-none"
              placeholder="Add any thoughts, feelings, or context about your mood..."
            />
            <p className="text-xs text-zinc-500 mt-1">
              {formData.notes.length}/500 characters
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-zinc-900">Mood Tracking Tips</h3>
            </div>
            <div className="space-y-3 text-sm text-zinc-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Be honest about how you feel</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Track at the same time each day</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Include context in your notes</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Don&apos;t judge your feelings</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Today&apos;s Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Current Time</span>
                <span className="text-sm font-medium text-zinc-900">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Date</span>
                <span className="text-sm font-medium text-zinc-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Energy Level</span>
                <span className="text-sm font-medium text-zinc-900">
                  {formData.energy_level}/10
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 