'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Activity,
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  Save,
  Plus,
  PenTool,
  Sparkles
} from 'lucide-react'

export default function NewJournalEntryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to add journal entries')
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          content: formData.content.trim()
        })

      if (error) throw error

      toast.success('Journal entry added successfully!')
      router.push('/dashboard/journal')
    } catch (error) {
      console.error('Error adding journal entry:', error)
      toast.error('Failed to add journal entry')
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
            <h1 className="text-3xl font-bold text-zinc-900">New Journal Entry</h1>
            <p className="text-zinc-600 mt-2">Write about your thoughts and feelings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-zinc-500">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Entry Title</h2>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your entry a meaningful title..."
              className="w-full p-4 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-zinc-500">Keep it concise and descriptive</span>
              <span className="text-xs text-zinc-500">{formData.title.length}/100</span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Your Thoughts</h2>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write freely about your day, thoughts, feelings, or anything on your mind. Don't worry about perfect grammar or structure - just let your thoughts flow..."
              className="w-full h-96 p-4 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none text-base leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-zinc-500">Express yourself freely</span>
              <span className="text-xs text-zinc-500">{formData.content.length} characters</span>
            </div>
          </div>

          {/* Writing Prompts */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>Writing Prompts (Optional)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: 'Today\'s Highlights' })}
                  className="text-left p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors w-full"
                >
                  <h4 className="font-medium text-zinc-900">Today's Highlights</h4>
                  <p className="text-sm text-zinc-600">What made today special?</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: 'Challenges & Growth' })}
                  className="text-left p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors w-full"
                >
                  <h4 className="font-medium text-zinc-900">Challenges & Growth</h4>
                  <p className="text-sm text-zinc-600">What difficulties did you face?</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: 'Gratitude Journal' })}
                  className="text-left p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors w-full"
                >
                  <h4 className="font-medium text-zinc-900">Gratitude Journal</h4>
                  <p className="text-sm text-zinc-600">What are you thankful for today?</p>
                </button>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: 'Emotional Check-in' })}
                  className="text-left p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors w-full"
                >
                  <h4 className="font-medium text-zinc-900">Emotional Check-in</h4>
                  <p className="text-sm text-zinc-600">How are you feeling right now?</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: 'Goals & Dreams' })}
                  className="text-left p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors w-full"
                >
                  <h4 className="font-medium text-zinc-900">Goals & Dreams</h4>
                  <p className="text-sm text-zinc-600">What are you working towards?</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: 'Reflection & Insights' })}
                  className="text-left p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors w-full"
                >
                  <h4 className="font-medium text-zinc-900">Reflection & Insights</h4>
                  <p className="text-sm text-zinc-600">What did you learn today?</p>
                </button>
              </div>
            </div>
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
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
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
        <h3 className="text-lg font-semibold text-zinc-900 mb-3">💡 Journaling Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-600">
          <div className="space-y-2">
            <p>• Write regularly, even if just a few sentences</p>
            <p>• Be honest with yourself</p>
            <p>• Don't worry about perfect writing</p>
            <p>• Include both positive and challenging experiences</p>
          </div>
          <div className="space-y-2">
            <p>• Reflect on your emotions and reactions</p>
            <p>• Note patterns in your thoughts</p>
            <p>• Celebrate small victories</p>
            <p>• Use prompts when you're stuck</p>
          </div>
        </div>
      </div>
    </div>
  )
} 