'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Heart, 
  Brain, 
  Activity, 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Sparkles,
  Play,
  Mail,
  Lock,
  Globe,
  Smartphone,
  Clock,
  Target,
  Award
} from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

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
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                MentalHealth.ai
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-zinc-600 hover:text-green-600 transition-colors">Features</a>
              <a href="#pricing" className="text-zinc-600 hover:text-green-600 transition-colors">Pricing</a>
              <a href="#about" className="text-zinc-600 hover:text-green-600 transition-colors">About</a>
              <button 
                onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI-Powered Mental Health Tracking
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight">
                  Transform Your
                  <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Mental Health
                  </span>
                  Journey
                </h1>
                <p className="text-xl text-zinc-600 leading-relaxed">
                  Advanced AI insights, personalized recommendations, and comprehensive mood tracking. 
                  Take control of your mental well-being with cutting-edge technology.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group bg-white hover:bg-zinc-50 text-zinc-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-zinc-200 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-zinc-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant access</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-zinc-200/50">
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  AI Powered
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">Mental Health Tracker</h3>
                      <p className="text-zinc-600">Your personal wellness companion</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                      <Brain className="h-5 w-5 text-green-600" />
                      <span className="text-zinc-700">AI-powered mood analysis</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-xl">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      <span className="text-zinc-700">Personalized insights</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-zinc-50 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-zinc-600" />
                      <span className="text-zinc-700">Progress tracking</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-xl p-4 border border-zinc-200/50">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">10K+ Users</p>
                    <p className="text-xs text-zinc-500">Trusted worldwide</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-4 border border-zinc-200/50">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">99.9% Uptime</p>
                    <p className="text-xs text-zinc-500">Reliable service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-zinc-900">
              Everything you need for
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                mental wellness
              </span>
            </h2>
            <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
              Advanced AI technology combined with intuitive design to help you understand and improve your mental health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200/50 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">AI-Powered Insights</h3>
              <p className="text-zinc-600 leading-relaxed">
                Advanced machine learning algorithms analyze your patterns and provide personalized recommendations for better mental health.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200/50 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">Smart Analytics</h3>
              <p className="text-zinc-600 leading-relaxed">
                Comprehensive mood tracking with detailed analytics and trend analysis to help you understand your emotional patterns.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200/50 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">Personalized Goals</h3>
              <p className="text-zinc-600 leading-relaxed">
                Set and track personalized mental health goals with AI-driven recommendations and progress monitoring.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200/50 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">Privacy First</h3>
              <p className="text-zinc-600 leading-relaxed">
                Your data is encrypted and secure. We prioritize your privacy and never share your personal information.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-200/50 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cross-Platform</h3>
              <p className="text-zinc-600 leading-relaxed">
                Access your mental health data anywhere with our responsive web app that works on all devices.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-200/50 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">Real-time Sync</h3>
              <p className="text-zinc-600 leading-relaxed">
                Your data syncs instantly across all devices, ensuring you always have access to your latest insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="py-24 bg-gradient-to-br from-zinc-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-zinc-900">
              Ready to start your
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                mental health journey?
              </span>
            </h2>
            <p className="text-xl text-zinc-600">
              Join thousands of users who have transformed their mental wellness with AI-powered insights.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200/50 p-8 md:p-12">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900">Get Started Today</h3>
                <p className="text-zinc-600">
                  Enter your email to receive a magic link and start tracking your mental health instantly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Mail className="h-5 w-5" />
                      <span>Send Magic Link</span>
                    </div>
                  )}
                </button>
              </form>

              <div className="text-center space-y-4">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MentalHealth.ai</span>
              </div>
              <p className="text-zinc-400">
                Transforming mental health through AI-powered insights and personalized care.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-400">
            <p>&copy; 2024 MentalHealth.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
