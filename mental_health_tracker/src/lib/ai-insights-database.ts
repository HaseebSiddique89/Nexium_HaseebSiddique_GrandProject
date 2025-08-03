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
  // Skip database access if we know it's not accessible
  if (!isDatabaseAccessible) {
    console.log('⏭️ Skipping database cache - database not accessible')
    return null
  }

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
      // Enhanced error logging with better structure
      const errorDetails = {
        code: error.code || 'UNKNOWN',
        message: error.message || 'No error message',
        details: error.details || 'No details',
        hint: error.hint || 'No hint',
        fullError: error
      }
      
      // Use console.warn instead of console.error for non-critical database issues
      console.warn('⚠️ Database cache access issue:', errorDetails)
      
      if (error.code === 'PGRST116') {
        // No record found - this is normal
        console.log('📭 No cached AI insights found in database')
        return null
      } else if (error.code === '406') {
        console.warn('⚠️ 406 Not Acceptable - RLS policies may be blocking access')
        isDatabaseAccessible = false
        return null
      } else if (error.code === 'PGRST301') {
        console.warn('⚠️ Table does not exist - Please run the SQL script to create ai_insights table')
        isDatabaseAccessible = false
        return null
      } else {
        console.warn('⚠️ Database cache access failed:', error)
        isDatabaseAccessible = false
        return null
      }
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
    // Handle any unexpected errors
    console.warn('⚠️ Unexpected error in getAIInsightsFromDatabase:', error)
    if (error instanceof Error) {
      console.warn('⚠️ Error message:', error.message)
    }
    isDatabaseAccessible = false
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
    const { error } = await supabase
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
        isDatabaseAccessible = false
      }
    } else {
      console.log('✅ Database access test successful')
      isDatabaseAccessible = true
    }
  } catch (error) {
    console.error('❌ Error in testDatabaseAccess:', error)
    isDatabaseAccessible = false
  }
}

// Track database accessibility
let isDatabaseAccessible = true

/**
 * Reset database accessibility flag (useful after fixing database issues)
 */
export function resetDatabaseAccessibility(): void {
  isDatabaseAccessible = true
  console.log('🔄 Reset database accessibility flag')
}

/**
 * Check if database is currently accessible
 */
export function isDatabaseCurrentlyAccessible(): boolean {
  return isDatabaseAccessible
}

/**
 * Clean up expired AI insights from database
 */
export async function cleanupExpiredAIInsights(): Promise<void> {
  // Skip cleanup if database is known to be inaccessible
  if (!isDatabaseAccessible) {
    console.log('⏭️ Skipping cleanup - database not accessible')
    return
  }

  try {
    console.log('🧹 Cleaning up expired AI insights from database')
    
    const now = new Date().toISOString()
    
    // First, let's check if we can access the table
    const { error: testError } = await supabase
      .from('ai_insights')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Cannot access ai_insights table:', testError)
      console.error('❌ This might be due to:')
      console.error('❌ 1. Table does not exist')
      console.error('❌ 2. RLS policies blocking access')
      console.error('❌ 3. Database connection issues')
      isDatabaseAccessible = false
      return
    }
    
    // Now try to delete expired records
    const { error } = await supabase
      .from('ai_insights')
      .delete()
      .lt('expires_at', now)

    if (error) {
      console.error('❌ Error cleaning up expired AI insights:', error)
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return
    }

    console.log('✅ Successfully cleaned up expired AI insights')
    // Note: Supabase delete operations don't return the count of deleted records
    // The operation is successful if no error is thrown
  } catch (error) {
    console.error('❌ Error in cleanupExpiredAIInsights:', error)
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
    }
    isDatabaseAccessible = false
  }
} 

/**
 * Get database status and troubleshooting information
 */
export function getDatabaseStatus(): {
  isAccessible: boolean;
  troubleshootingSteps: string[];
  lastError?: string;
} {
  const troubleshootingSteps = [
    '1. Check if the ai_insights table exists in your Supabase database',
    '2. Verify that Row Level Security (RLS) policies are properly configured',
    '3. Ensure your Supabase URL and API keys are correct',
    '4. Check if your Supabase project is active and not paused',
    '5. Try running the SQL script to recreate the table if needed'
  ]

  return {
    isAccessible: isDatabaseAccessible,
    troubleshootingSteps,
    lastError: isDatabaseAccessible ? undefined : 'Database table access blocked or table does not exist'
  }
} 