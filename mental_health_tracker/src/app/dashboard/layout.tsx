'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  Heart,
  Brain,
  BarChart3,
  Calendar,
  BookOpen,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Search,
  Home,
  Activity,
  Target,
  ChevronDown,
  Clock,
  Award
} from 'lucide-react'

interface Notification {
  id: number
  type: 'reminder' | 'achievement' | 'insight'
  title: string
  message: string
  time: string
  read: boolean
  action: () => void
}

interface MoodEntry {
  id: string
  user_id: string
  mood: string
  energy_level: number
  notes?: string
  created_at: string
}

interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const generateRealisticNotifications = useCallback((moodEntries: MoodEntry[], journalEntries: JournalEntry[]) => {
    const notifications: Notification[] = []
    const now = new Date()
    let notificationId = 1

    // Check if user has any entries
    const hasMoodEntries = moodEntries.length > 0
    const hasJournalEntries = journalEntries.length > 0
    const lastMoodEntry = hasMoodEntries ? new Date(moodEntries[0].created_at) : null
    const lastJournalEntry = hasJournalEntries ? new Date(journalEntries[0].created_at) : null

    // Helper function to format time ago
    const formatTimeAgo = (date: Date) => {
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) return '1 day ago'
      return `${diffInDays} days ago`
    }

    // 1. Mood tracking reminders based on actual data
    if (!hasMoodEntries) {
      notifications.push({
        id: notificationId++,
        type: 'reminder',
        title: 'Start Your Mood Journey!',
        message: 'Track your first mood entry to begin your mental health journey.',
        time: 'Just now',
        read: false,
        action: () => router.push('/dashboard/mood/new')
      })
    } else {
      const hoursSinceLastMood = lastMoodEntry ? (now.getTime() - lastMoodEntry.getTime()) / (1000 * 60 * 60) : 0
      
      if (hoursSinceLastMood > 24) {
        notifications.push({
          id: notificationId++,
          type: 'reminder',
          title: 'Time to Check In!',
          message: `It's been ${Math.floor(hoursSinceLastMood / 24)} days since your last mood entry. How are you feeling today?`,
          time: formatTimeAgo(lastMoodEntry!),
          read: false,
          action: () => router.push('/dashboard/mood/new')
        })
      } else if (hoursSinceLastMood > 12) {
        notifications.push({
          id: notificationId++,
          type: 'reminder',
          title: 'How\'s Your Day Going?',
          message: 'Take a moment to reflect on your mood and energy levels.',
          time: formatTimeAgo(lastMoodEntry!),
          read: false,
          action: () => router.push('/dashboard/mood/new')
        })
      }
    }

    // 2. Journal writing reminders based on actual data
    if (!hasJournalEntries) {
      notifications.push({
        id: notificationId++,
        type: 'reminder',
        title: 'Begin Your Journal Journey!',
        message: 'Start writing in your journal to track your thoughts and feelings.',
        time: 'Just now',
        read: false,
        action: () => router.push('/dashboard/journal/new')
      })
    } else {
      const hoursSinceLastJournal = lastJournalEntry ? (now.getTime() - lastJournalEntry.getTime()) / (1000 * 60 * 60) : 0
      
      if (hoursSinceLastJournal > 48) {
        notifications.push({
          id: notificationId++,
          type: 'reminder',
          title: 'Journal Writing Reminder',
          message: `It's been ${Math.floor(hoursSinceLastJournal / 24)} days since your last journal entry. Reflection helps with mental clarity.`,
          time: formatTimeAgo(lastJournalEntry!),
          read: false,
          action: () => router.push('/dashboard/journal/new')
        })
      }
    }

    // 3. Achievement notifications based on actual streaks
    if (hasMoodEntries) {
      const moodStreak = calculateMoodStreak(moodEntries)
      if (moodStreak >= 3 && moodStreak <= 7) {
        notifications.push({
          id: notificationId++,
          type: 'achievement',
          title: `Mood Tracking Streak! 🎉`,
          message: `Congratulations! You've maintained your mood tracking streak for ${moodStreak} days. Keep up the great work!`,
          time: formatTimeAgo(lastMoodEntry!),
          read: false,
          action: () => router.push('/dashboard')
        })
      } else if (moodStreak >= 7) {
        notifications.push({
          id: notificationId++,
          type: 'achievement',
          title: `Amazing Consistency! 🌟`,
          message: `Incredible! You&apos;ve tracked your mood for ${moodStreak} consecutive days. You&apos;re building great habits!`,
          time: formatTimeAgo(lastMoodEntry!),
          read: false,
          action: () => router.push('/dashboard')
        })
      }
    }

    if (hasJournalEntries) {
      const journalStreak = calculateJournalStreak(journalEntries)
      if (journalStreak >= 2 && journalStreak <= 5) {
        notifications.push({
          id: notificationId++,
          type: 'achievement',
          title: `Journal Writing Streak! 📝`,
          message: `Great job! You've written in your journal for ${journalStreak} consecutive days.`,
          time: formatTimeAgo(lastJournalEntry!),
          read: false,
          action: () => router.push('/dashboard/journal')
        })
      }
    }

    // 4. AI Insights notifications based on data volume
    const totalEntries = moodEntries.length + journalEntries.length
    if (totalEntries >= 5) {
      // Use the most recent entry time for AI insights notification
      const mostRecentEntry = moodEntries.length > 0 && journalEntries.length > 0 
        ? new Date(Math.max(new Date(moodEntries[0].created_at).getTime(), new Date(journalEntries[0].created_at).getTime()))
        : moodEntries.length > 0 
          ? new Date(moodEntries[0].created_at)
          : new Date(journalEntries[0].created_at)

      notifications.push({
        id: notificationId++,
        type: 'insight',
        title: 'AI Insights Ready! 🧠',
        message: `You have ${totalEntries} entries. Check out your personalized AI insights and recommendations.`,
        time: formatTimeAgo(mostRecentEntry),
        read: true,
        action: () => router.push('/dashboard/ai-insights')
      })
    }

    // 5. Mood pattern insights based on actual data
    if (hasMoodEntries && moodEntries.length >= 3) {
      const moodScores = { excellent: 5, good: 4, neutral: 3, bad: 2, terrible: 1 }
      const scores = moodEntries.map(entry => moodScores[entry.mood as keyof typeof moodScores] || 3)
      const averageMood = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const recentMoods = moodEntries.slice(0, 3).map(entry => moodScores[entry.mood as keyof typeof moodScores] || 3)
      const moodTrend = recentMoods[0] - recentMoods[recentMoods.length - 1]

      if (averageMood >= 4 && moodTrend > 0) {
        notifications.push({
          id: notificationId++,
          type: 'insight',
          title: 'Positive Mood Trend! 📈',
          message: 'Your mood has been improving! Your average mood is excellent and trending upward.',
          time: formatTimeAgo(lastMoodEntry!),
          read: true,
          action: () => router.push('/dashboard/ai-insights')
        })
      } else if (averageMood <= 2 && moodTrend < 0) {
        notifications.push({
          id: notificationId++,
          type: 'reminder',
          title: 'Mood Support Available',
          message: 'We notice you might be having a tough time. Remember, it\'s okay to seek support when needed.',
          time: formatTimeAgo(lastMoodEntry!),
          read: true,
          action: () => router.push('/dashboard/ai-insights')
        })
      }
    }

    // 6. Energy level insights
    if (hasMoodEntries) {
      const averageEnergy = moodEntries.reduce((sum, entry) => sum + entry.energy_level, 0) / moodEntries.length
      if (averageEnergy >= 8) {
        notifications.push({
          id: notificationId++,
          type: 'achievement',
          title: 'High Energy Levels! ⚡',
          message: `Your average energy level is ${Math.round(averageEnergy)}/10. You&apos;re maintaining great energy!`,
          time: formatTimeAgo(lastMoodEntry!),
          read: true,
          action: () => router.push('/dashboard/mood')
        })
      }
    }

    return notifications
  }, [router])

  useEffect(() => {
    const fetchUserDataAndGenerateNotifications = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Fetch mood entries
        const { data: moodEntries } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        // Fetch journal entries
        const { data: journalEntries } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        // Generate realistic notifications based on actual data
        const realisticNotifications = generateRealisticNotifications(
          moodEntries || [],
          journalEntries || []
        )

        setNotifications(realisticNotifications)
      } catch (error) {
        console.error('Error fetching user data for notifications:', error)
        // Fallback to basic notifications if data fetch fails
        setNotifications([
          {
            id: 1,
            type: 'reminder',
            title: 'Welcome to MentalHealth.ai!',
            message: 'Start tracking your mood and journal entries to get personalized insights.',
            time: 'Just now',
            read: false,
            action: () => router.push('/dashboard/mood/new')
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchUserDataAndGenerateNotifications()
    }
  }, [user?.id, router, generateRealisticNotifications])

  const calculateMoodStreak = (moodEntries: MoodEntry[]) => {
    if (moodEntries.length === 0) return 0

    const moodDates = [...new Set(moodEntries.map(entry => new Date(entry.created_at).toDateString()))]
    moodDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streakDays = 0
    for (let i = 0; i < moodDates.length - 1; i++) {
      const currentDate = new Date(moodDates[i])
      const nextDate = new Date(moodDates[i + 1])
      const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
      if (dayDiff <= 1) {
        streakDays++
      } else {
        break
      }
    }
    return moodDates.length > 0 ? streakDays + 1 : 0
  }

  const calculateJournalStreak = (journalEntries: JournalEntry[]) => {
    if (journalEntries.length === 0) return 0

    const journalDates = [...new Set(journalEntries.map(entry => new Date(entry.created_at).toDateString()))]
    journalDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streakDays = 0
    for (let i = 0; i < journalDates.length - 1; i++) {
      const currentDate = new Date(journalDates[i])
      const nextDate = new Date(journalDates[i + 1])
      const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
      if (dayDiff <= 1) {
        streakDays++
      } else {
        break
      }
    }
    return journalDates.length > 0 ? streakDays + 1 : 0
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu')) {
        setUserMenuOpen(false)
      }
      if (!target.closest('.notifications-menu')) {
        setNotificationsOpen(false)
      }
    }

    if (userMenuOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen, notificationsOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      toast.success('Signed out successfully')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    
    // Execute action
    notification.action()
    
    // Close notifications dropdown
    setNotificationsOpen(false)
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
              <div className="relative notifications-menu">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <Bell className="h-5 w-5 text-zinc-600" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{unreadCount}</span>
                    </div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-50 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification Items */}
                    <div className="py-1">
                      {loading ? (
                        <div className="px-4 py-6 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                          <p className="text-sm text-zinc-500">Loading notifications...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <Bell className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                          <p className="text-sm text-zinc-500">No notifications yet</p>
                          <p className="text-xs text-zinc-400 mt-1">Start tracking to get personalized notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Notification Icon */}
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                notification.type === 'reminder' ? 'bg-blue-100 text-blue-600' :
                                notification.type === 'achievement' ? 'bg-green-100 text-green-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                {notification.type === 'reminder' && <Clock className="h-4 w-4" />}
                                {notification.type === 'achievement' && <Award className="h-4 w-4" />}
                                {notification.type === 'insight' && <Brain className="h-4 w-4" />}
                              </div>

                              {/* Notification Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className={`text-sm font-medium truncate ${
                                    !notification.read ? 'text-zinc-900' : 'text-zinc-600'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-zinc-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-zinc-100">
                        <button
                          onClick={() => router.push('/dashboard')}
                          className="text-xs text-zinc-600 hover:text-zinc-800 font-medium"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative user-menu">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-sm font-medium text-zinc-900">Signed in as</p>
                      <p className="text-sm text-zinc-600 truncate">{user?.email || 'Unknown'}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
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