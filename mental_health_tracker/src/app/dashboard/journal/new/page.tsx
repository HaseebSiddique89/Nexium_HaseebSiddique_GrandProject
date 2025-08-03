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
  BookOpen, 
  CheckCircle, 
  Lightbulb
} from 'lucide-react'

export default function NewJournalEntryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })

  const writingPrompts = [
    "How are you feeling today?",
    "What's on your mind?",
    "Describe a moment that made you smile today",
    "What challenges did you face today?",
    "What are you grateful for?",
    "What would you like to improve about yourself?",
    "Describe your ideal day",
    "What&apos;s something you&apos;re looking forward to?",
    "What's something that's been bothering you?",
    "What's a goal you have for this week?"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content')
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to create a journal entry')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: user.id,
            title: formData.title.trim(),
            content: formData.content.trim()
          }
        ])

      if (error) {
        console.error('Error adding journal entry:', error)
        toast.error('Failed to save journal entry. Please try again.')
      } else {
        toast.success('Journal entry saved successfully!')
        router.push('/dashboard/journal')
      }
    } catch (error) {
      console.error('Error adding journal entry:', error)
      toast.error('Failed to save journal entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addPromptToContent = (prompt: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + (prev.content ? '\n\n' : '') + prompt
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
            <h1 className="text-2xl font-bold text-zinc-900">New Journal Entry</h1>
            <p className="text-zinc-600">Capture your thoughts and feelings</p>
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.title.trim() || !formData.content.trim()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Entry'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-2">
              Entry Title
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-zinc-900 placeholder-zinc-500"
              placeholder="Give your entry a meaningful title..."
              maxLength={100}
            />
            <p className="text-xs text-zinc-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Content Input */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <label htmlFor="content" className="block text-sm font-medium text-zinc-700 mb-2">
              Your Thoughts
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-zinc-900 placeholder-zinc-500 resize-none"
              placeholder="Start writing your thoughts, feelings, or experiences here..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-zinc-500">
                {formData.content.length} characters
              </p>
              <div className="flex items-center space-x-2 text-xs text-zinc-500">
                <BookOpen className="h-3 w-3" />
                <span>Journal Entry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Writing Prompts */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-zinc-900">Writing Prompts</h3>
            </div>
            <div className="space-y-3">
              {writingPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => addPromptToContent(prompt)}
                  className="w-full text-left p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors text-sm text-zinc-700 hover:text-zinc-900"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-zinc-900">Writing Tips</h3>
            </div>
            <div className="space-y-3 text-sm text-zinc-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Write freely without worrying about grammar</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Focus on your feelings and emotions</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Be honest with yourself</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Reflect on your day&apos;s experiences</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Entry Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Characters</span>
                <span className="text-sm font-medium text-zinc-900">{formData.content.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Words</span>
                <span className="text-sm font-medium text-zinc-900">
                  {formData.content.split(/\s+/).filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Lines</span>
                <span className="text-sm font-medium text-zinc-900">
                  {formData.content.split('\n').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 