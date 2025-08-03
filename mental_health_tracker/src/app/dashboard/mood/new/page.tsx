'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Heart,
  Smile,
  Frown,
  Meh,
  Zap,
  Calendar,
  Clock,
  ArrowLeft,
  Save,
  Plus
} from 'lucide-react'

const moodOptions = [
  { value: 'excellent', label: 'Excellent', icon: Smile, color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'terrible', label: 'Terrible', icon: Frown, color: 'text-red-600', bgColor: 'bg-red-100' }
]

export default function NewMoodEntryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    mood: '',
    energy_level: 5,
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to add mood entries')
      return
    }

    if (!user.id) {
      toast.error('User ID not found. Please sign in again.')
      return
    }

    if (!formData.mood) {
      toast.error('Please select your mood')
      return
    }

    setLoading(true)
    try {
      // Test connection first
      console.log('Testing Supabase connection...')
      const { data: testData, error: testError } = await supabase
        .from('mood_entries')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('Connection test failed:', testError)
        throw new Error('Database connection failed')
      }
      
      console.log('Connection test successful')

      // Validate mood value
      const validMoods = ['excellent', 'good', 'neutral', 'bad', 'terrible']
      if (!validMoods.includes(formData.mood)) {
        throw new Error('Invalid mood value')
      }

      // Validate energy level
      if (formData.energy_level < 1 || formData.energy_level > 10) {
        throw new Error('Invalid energy level')
      }

      const entryData = {
        user_id: user.id,
        mood: formData.mood,
        energy_level: formData.energy_level,
        notes: formData.notes || null
      }

      console.log('Submitting mood entry:', entryData)

      const { data, error } = await supabase
        .from('mood_entries')
        .insert(entryData)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        throw error
      }

      console.log('Mood entry created successfully:', data)
      toast.success('Mood entry added successfully!')
      router.push('/dashboard/mood')
    } catch (error) {
      console.error('Error adding mood entry:', error)
      console.error('Error details:', {
        message: (error as Error).message,
        name: (error as Error).name,
        stack: (error as Error).stack
      })
      
      let errorMessage = 'Failed to add mood entry'
      if ((error as Error).message?.includes('energy_level')) {
        errorMessage = 'Invalid energy level. Please try again.'
      } else if ((error as Error).message?.includes('mood')) {
        errorMessage = 'Invalid mood selection. Please try again.'
      } else if ((error as Error).message?.includes('user_id')) {
        errorMessage = 'Authentication error. Please sign in again.'
      } else if ((error as Error).message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      } else if ((error as Error).message?.includes('fetch')) {
        errorMessage = 'Connection error. Please try again.'
      } else if ((error as Error).message?.includes('connection')) {
        errorMessage = 'Database connection failed. Please try again.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Add Mood Entry</h1>
            <p className="text-zinc-600 mt-2">Track how you're feeling today</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-zinc-500">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mood Selection */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">How are you feeling?</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: option.value })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.mood === option.value
                      ? `${option.bgColor} border-zinc-300 shadow-md`
                      : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <option.icon className={`h-8 w-8 ${option.color}`} />
                    <span className="text-sm font-medium text-zinc-900">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Energy Level</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">How energetic do you feel?</span>
                <span className="text-sm font-medium text-zinc-900">{formData.energy_level}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Additional Notes (Optional)</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What's on your mind? Any specific thoughts or feelings you'd like to record?"
              className="w-full h-32 p-4 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.mood}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{loading ? 'Saving...' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-3">💡 Tips for Better Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-600">
          <div className="space-y-2">
            <p>• Be honest about how you're feeling</p>
            <p>• Track at the same time each day</p>
            <p>• Note any patterns or triggers</p>
          </div>
          <div className="space-y-2">
            <p>• Include context in your notes</p>
            <p>• Don't skip days if possible</p>
            <p>• Review your patterns regularly</p>
          </div>
        </div>
      </div>
    </div>
  )
} 