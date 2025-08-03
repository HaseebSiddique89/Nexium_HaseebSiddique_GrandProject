import { supabase } from './supabase'

// Define the user data type
type UserData = {
  moodEntries: Array<{
    id: string;
    user_id: string;
    mood: string;
    energy_level: number;
    notes?: string;
    created_at: string;
  }>;
  journalEntries: Array<{
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
  }>;
}

// Define the analytics data type
type AnalyticsData = {
  moodEntries: Array<{
    mood: string;
    energy_level: number;
    created_at: string;
  }>;
  journalEntries: Array<{
    title: string;
    content: string;
    mood?: string;
    tags?: string;
    created_at: string;
  }>;
}

// In-memory cache for better performance
const dataCache = new Map<string, { data: UserData | AnalyticsData; timestamp: number; ttl: number }>()

// Cache TTL (Time To Live) - 5 minutes
const CACHE_TTL = 5 * 60 * 1000

// Optimized data fetching with caching
export const fetchUserDataOptimized = async (userId: string): Promise<UserData> => {
  const cacheKey = `user_data_${userId}`
  const cached = dataCache.get(cacheKey)
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log('📦 Using cached user data')
    return cached.data as UserData
  }

  console.log('🔄 Fetching fresh user data...')
  
  try {
    // Parallel data fetching for better performance
    const [moodResult, journalResult] = await Promise.all([
      supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100), // Limit for performance
      supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100) // Limit for performance
    ])

    const data = {
      moodEntries: moodResult.data || [],
      journalEntries: journalResult.data || []
    }

    // Cache the result
    dataCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    })

    return data
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

// Optimized analytics data fetching
export async function fetchAnalyticsDataOptimized(userId: string): Promise<AnalyticsData> {
  const cacheKey = `analytics_data_${userId}`
  const cached = dataCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log('📦 Using cached analytics data')
    return cached.data as AnalyticsData
  }

  console.log('🔄 Fetching fresh analytics data...')
  
  try {
    const [moodResult, journalResult] = await Promise.all([
      supabase
        .from('mood_entries')
        .select('mood, energy_level, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('journal_entries')
        .select('title, content, mood, tags, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ])

    const data = {
      moodEntries: moodResult.data || [],
      journalEntries: journalResult.data || []
    }

    dataCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    })

    return data
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    throw error
  }
}

// Clear cache functions
export function clearUserCache(userId: string) {
  const keysToDelete = Array.from(dataCache.keys()).filter(key => key.includes(userId))
  keysToDelete.forEach(key => dataCache.delete(key))
  console.log('🗑️ Cleared cache for user:', userId)
}

export function clearAllCache() {
  dataCache.clear()
  console.log('🗑️ Cleared all cache')
}

// Preload critical data in background
export async function preloadCriticalData(userId: string) {
  try {
    // Preload in background without blocking UI
    setTimeout(async () => {
      await fetchUserDataOptimized(userId)
      console.log('🚀 Preloaded critical data for user:', userId)
    }, 100)
  } catch (error) {
    console.error('Error preloading data:', error)
  }
}

// Performance monitoring
export function getCacheStats() {
  const now = Date.now()
  const validEntries = Array.from(dataCache.entries()).filter(([, value]) => 
    now - value.timestamp < value.ttl
  )
  
  return {
    totalEntries: dataCache.size,
    validEntries: validEntries.length,
    expiredEntries: dataCache.size - validEntries.length
  }
} 