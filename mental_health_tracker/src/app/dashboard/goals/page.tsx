'use client'

import { Target, Calendar, TrendingUp, Lightbulb, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Goals</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Set and track your mental health goals and milestones.
          </p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="h-20 w-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <Target className="h-10 w-10 text-orange-600" />
          </div>
          
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We&apos;re working hard to bring you an amazing goals and milestones feature. 
              Set targets, track progress, and celebrate your achievements.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-green-900">Smart Goal Setting</h3>
              </div>
              <p className="text-sm text-green-700">
                Set personalized mental health goals with AI-powered recommendations
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">Progress Tracking</h3>
              </div>
              <p className="text-sm text-blue-700">
                Visual progress charts and milestone celebrations
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">Achievement Rewards</h3>
              </div>
              <p className="text-sm text-purple-700">
                Earn badges and rewards for reaching your mental health goals
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <Link
              href="/dashboard/mood"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Target className="h-4 w-4" />
              <span>Track Your Mood</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              href="/dashboard/journal"
              className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Write in Journal</span>
            </Link>
          </div>

          {/* Notification Signup */}
          <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-3 mb-3">
              <Calendar className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Get Notified</h3>
            </div>
            <p className="text-sm text-orange-700 mb-4">
              We&apos;ll notify you when the Goals feature is ready. In the meantime, 
              continue tracking your mood and journal entries to build a strong foundation.
            </p>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
              Notify Me When Ready
            </button>
          </div>
        </div>
      </div>

      {/* Current Features Reminder */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Continue Your Journey</h3>
        </div>
        <p className="text-green-700 mb-4">
          While we work on the Goals feature, you can still make great progress with our existing tools:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Mood Tracking</p>
              <p className="text-sm text-gray-600">Monitor your daily emotional state</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Journal Writing</p>
              <p className="text-sm text-gray-600">Reflect on your thoughts and feelings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 