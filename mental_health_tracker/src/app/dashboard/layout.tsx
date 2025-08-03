'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  Heart,
  Brain,
  BarChart3,
  Calendar,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Search,
  Home,
  Activity,
  Target,
  Sparkles,
  ChevronDown,
  Plus
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mood Tracking', href: '/dashboard/mood', icon: Activity },
    { name: 'Journal', href: '/dashboard/journal', icon: BookOpen },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'AI Insights', href: '/dashboard/ai-insights', icon: Brain },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
  ]

  // Determine which navigation item is currently active
  const getCurrentNavigation = () => {
    return navigation.map(item => ({
      ...item,
      current: pathname === item.href || 
               (item.href !== '/dashboard' && pathname.startsWith(item.href))
    }))
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                MentalHealth.ai
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="h-5 w-5 text-zinc-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {getCurrentNavigation().map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-zinc-200">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-zinc-50">
              <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-zinc-500">Premium Member</p>
              </div>
              <button className="p-1 rounded-lg hover:bg-zinc-200 transition-colors">
                <ChevronDown className="h-4 w-4 text-zinc-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-zinc-600" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors">
                <Bell className="h-5 w-5 text-zinc-600" />
                <div className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></div>
              </button>

              {/* New Entry Button */}
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Entry</span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-100 transition-colors">
                  <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-zinc-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 