import { supabase } from './supabase'

/**
 * Optimized data fetching utilities for better performance
 */

// Cache for frequently accessed data
const dataCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch user data with optimized parallel requests
 */
export async function fetchUserDataOptimized(userId: string) {
  const cacheKey = `user_data_${userId}`
  const cached = dataCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('📦 Using cached user data')
    return cached.data
  }

  console.log('🔄 Fetching fresh user data')
  
  // Parallel data fetching for better performance
  const [moodResult, journalResult] = await Promise.all([
    supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50), // Limit to recent entries for dashboard
    
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30) // Limit to recent entries for dashboard
  ])

  if (moodResult.error) throw moodResult.error
  if (journalResult.error) throw journalResult.error

  const data = {
    moodEntries: moodResult.data || [],
    journalEntries: journalResult.data || [],
    timestamp: Date.now()
  }

  // Cache the result
  dataCache.set(cacheKey, { data, timestamp: Date.now() })
  
  return data
}

/**
 * Fetch analytics data with optimized queries
 */
export async function fetchAnalyticsDataOptimized(userId: string) {
  const cacheKey = `analytics_${userId}`
  const cached = dataCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }

  // Use more specific queries for analytics
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

  if (moodResult.error) throw moodResult.error
  if (journalResult.error) throw journalResult.error

  const data = {
    moodEntries: moodResult.data || [],
    journalEntries: journalResult.data || [],
    timestamp: Date.now()
  }

  dataCache.set(cacheKey, { data, timestamp: Date.now() })
  
  return data
}

/**
 * Clear cache for a specific user
 */
export function clearUserCache(userId: string) {
  const keysToDelete = Array.from(dataCache.keys()).filter(key => key.includes(userId))
  keysToDelete.forEach(key => dataCache.delete(key))
  console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for user ${userId}`)
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  dataCache.clear()
  console.log('🗑️ Cleared all data cache')
}

/**
 * Preload critical data for better perceived performance
 */
export async function preloadCriticalData(userId: string) {
  try {
    // Preload dashboard data in background
    await fetchUserDataOptimized(userId)
    console.log('⚡ Preloaded critical data')
  } catch (error) {
    console.error('Preload error:', error)
  }
} 