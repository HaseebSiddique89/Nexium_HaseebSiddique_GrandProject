import { supabase } from './supabase'
import { EnhancedAIInsights } from './ai-insights-enhanced'

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Database-based AI insights caching system
 * Stores AI insights in the database and only updates when data changes
 */

export interface DatabaseAIInsights {
  id: string
  user_id: string
  data_hash: string
  insights_data: EnhancedAIInsights
  created_at: string
  updated_at: string
  expires_at: string
}

/**
 * Get AI insights from database cache
 */
export async function getAIInsightsFromDatabase(userId: string): Promise<EnhancedAIInsights | null> {
  try {
    console.log('🗄️ Fetching AI insights from database for user:', userId)
    
    // First, let's check if the table exists and we can access it
    console.log('🔍 Testing database access...')
    
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('❌ Database error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      if (error.code === 'PGRST116') {
        // No record found
        console.log('📭 No cached AI insights found in database')
        return null
      } else if (error.code === '406') {
        console.error('❌ 406 Not Acceptable - This usually means RLS policies are blocking access')
        console.error('❌ Please check that the ai_insights table exists and RLS policies are correct')
        return null
      }
      console.error('❌ Error fetching AI insights from database:', error)
      return null
    }

    // Check if cache has expired
    const now = new Date()
    const expiresAt = new Date(data.expires_at)
    
    if (now > expiresAt) {
      console.log('⏰ Cached AI insights have expired, will regenerate')
      return null
    }

    console.log('✅ Retrieved cached AI insights from database')
    console.log(`⏰ Cache expires at: ${expiresAt.toISOString()}`)
    
    return data.insights_data as EnhancedAIInsights
  } catch (error) {
    console.error('❌ Error in getAIInsightsFromDatabase:', error)
    return null
  }
}

/**
 * Store AI insights in database cache
 */
export async function storeAIInsightsInDatabase(
  userId: string, 
  dataHash: string, 
  insights: EnhancedAIInsights
): Promise<void> {
  try {
    console.log('💾 Storing AI insights in database for user:', userId)
    
    const expiresAt = new Date(Date.now() + CACHE_DURATION)
    
    const { error } = await supabase
      .from('ai_insights')
      .upsert({
        user_id: userId,
        data_hash: dataHash,
        insights_data: insights,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Error storing AI insights in database:', error)
      throw error
    }

    console.log('✅ Successfully stored AI insights in database')
    console.log(`⏰ Cache expires at: ${expiresAt.toISOString()}`)
  } catch (error) {
    console.error('❌ Error in storeAIInsightsInDatabase:', error)
    throw error
  }
}

/**
 * Clear AI insights cache for a user
 */
export async function clearAIInsightsFromDatabase(userId: string): Promise<void> {
  try {
    console.log('🗑️ Clearing AI insights from database for user:', userId)
    
    const { error } = await supabase
      .from('ai_insights')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Error clearing AI insights from database:', error)
      throw error
    }

    console.log('✅ Successfully cleared AI insights from database')
  } catch (error) {
    console.error('❌ Error in clearAIInsightsFromDatabase:', error)
    throw error
  }
}

/**
 * Check if AI insights cache is valid for a user
 */
export async function isAIInsightsCacheValid(userId: string, dataHash: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('data_hash, expires_at')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return false
    }

    // Check if data hash matches and cache hasn't expired
    const now = new Date()
    const expiresAt = new Date(data.expires_at)
    
    return data.data_hash === dataHash && now < expiresAt
  } catch (error) {
    console.error('❌ Error checking AI insights cache validity:', error)
    return false
  }
}

/**
 * Test database connectivity and table access
 */
export async function testDatabaseAccess(): Promise<void> {
  try {
    console.log('🧪 Testing database access for ai_insights table...')
    
    // Test if we can query the table
    const { data, error } = await supabase
      .from('ai_insights')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database access test failed:', error)
      console.error('❌ This might mean:')
      console.error('❌ 1. The ai_insights table does not exist')
      console.error('❌ 2. RLS policies are blocking access')
      console.error('❌ 3. The user does not have proper permissions')
      
      // Let's try a different approach - check if table exists
      console.log('🔍 Trying to check if table exists...')
      const { error: tableError } = await supabase
        .from('ai_insights')
        .select('id')
        .limit(0)
      
      if (tableError) {
        console.error('❌ Table access completely blocked:', tableError)
        console.error('❌ Please run the SQL script to create the ai_insights table')
      }
    } else {
      console.log('✅ Database access test successful')
    }
  } catch (error) {
    console.error('❌ Error in testDatabaseAccess:', error)
  }
}

/**
 * Clean up expired AI insights from database
 */
export async function cleanupExpiredAIInsights(): Promise<void> {
  try {
    console.log('🧹 Cleaning up expired AI insights from database')
    
    const now = new Date().toISOString()
    
    const { error } = await supabase
      .from('ai_insights')
      .delete()
      .lt('expires_at', now)

    if (error) {
      console.error('❌ Error cleaning up expired AI insights:', error)
      return
    }

    console.log('✅ Successfully cleaned up expired AI insights')
  } catch (error) {
    console.error('❌ Error in cleanupExpiredAIInsights:', error)
  }
} 