'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  LayoutDashboard, 
  BarChart3, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Brain,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Mood Tracker', href: '/dashboard/mood', icon: BarChart3, gradient: 'from-green-500 to-emerald-600' },
  { name: 'Journal', href: '/dashboard/journal', icon: BookOpen, gradient: 'from-purple-500 to-pink-600' },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar, gradient: 'from-orange-500 to-red-600' },
  { name: 'AI Insights', href: '/dashboard/ai-insights', icon: Brain, gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, gradient: 'from-gray-500 to-gray-600' },
]

export default function Navigation() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus-ring"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-gray-50 to-white shadow-2xl transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-gray-200/50
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mental Health</span>
                <p className="text-xs text-gray-500">AI-Powered Tracker</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-110 focus-ring rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="group flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-white hover:to-gray-50 hover:text-gray-900 transition-all duration-300 hover:scale-105 hover-lift focus-ring"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Info & Sign Out */}
          <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
            <div className="mb-4 animate-fade-in">
              <p className="text-sm text-gray-600 mb-1">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 hover:scale-105 hover-lift focus-ring"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                <LogOut className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
} 