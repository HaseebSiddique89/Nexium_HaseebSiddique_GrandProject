'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { clearAICache } from '@/lib/ai-insights-enhanced'
import { toast } from 'sonner'
import { ArrowLeft, Save, BookOpen, Tag, Smile, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const moodOptions = [
  { value: 'excellent', label: 'Excellent', emoji: '😊' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😔' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' },
]

export default function NewJournalEntryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (indexToRemove: number) => {
    setTags(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter some content')
      return
    }

    if (!selectedMood) {
      toast.error('Please select a mood')
      return
    }

    setLoading(true)
    try {
      console.log('📝 Attempting to create journal entry...')
      console.log('🔧 User ID:', user?.id)
      console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user?.id,
          title: title.trim(),
          content: content.trim(),
          mood: selectedMood,
          tags: tags,
        })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Journal entry created successfully')

      // Clear AI cache to ensure fresh insights
      if (user?.id) {
        clearAICache(user.id)
      }

      toast.success('Journal entry created successfully!')
      router.push('/dashboard/journal')
    } catch (error) {
      console.error('❌ Error creating journal entry:', error)
      console.error('❌ Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      })
      
      let errorMessage = 'Failed to create journal entry. Please try again.'
      if ((error as Error).message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if ((error as Error).message?.includes('supabase')) {
        errorMessage = 'Database connection error. Please try again later.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Write Journal Entry</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Express your thoughts and feelings through writing. This helps track your mental health journey.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500/50 text-black transition-all duration-300 hover:border-green-400"
              placeholder="Give your entry a title..."
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500/50 text-black transition-all duration-300 hover:border-green-400"
              placeholder="Write about your day, thoughts, feelings, or anything on your mind..."
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedMood === mood.value
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-900">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tags (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500/50 text-black transition-all duration-300 hover:border-green-400"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/journal"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!title || !content || !selectedMood || loading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover-lift shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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