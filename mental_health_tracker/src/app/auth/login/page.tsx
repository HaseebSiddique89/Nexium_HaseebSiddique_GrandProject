'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { 
  ArrowRight, 
  Lock, 
  Globe, 
  Smartphone, 
  Clock, 
  Target, 
  Award 
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      await signIn(email)
      toast.success('Check your email for the magic link!')
    } catch (error) {
      toast.error('Failed to send magic link. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900">Welcome Back</h2>
          <p className="text-zinc-600">
            Sign in to continue your mental health journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-zinc-900 placeholder-zinc-500"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending magic link...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ArrowRight className="h-5 w-5" />
                  <span>Send Magic Link</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-zinc-500">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span>No Downloads</span>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-zinc-200/50">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Why choose MentalHealth.ai?</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Target className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-zinc-700">AI-powered insights</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Smartphone className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-zinc-700">Cross-platform access</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Award className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-zinc-700">Privacy-first design</span>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <div className="text-center">
          <p className="text-sm text-zinc-500">
            We&apos;ll send you a magic link to sign in instantly. No password required.
          </p>
        </div>
      </div>
    </div>
  )
} 