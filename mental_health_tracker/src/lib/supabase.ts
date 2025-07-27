import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug Supabase configuration
console.log('🔧 Supabase Configuration Debug:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET')
if (supabaseUrl) {
  console.log('- Supabase URL:', supabaseUrl)
}
if (supabaseAnonKey) {
  console.log('- Supabase Anon Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...')
}

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!')
  console.error('❌ Please check your .env file contains:')
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood: string
          energy_level: number
          notes: string | null
          activities: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: string
          energy_level: number
          notes?: string | null
          activities?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string
          energy_level?: number
          notes?: string | null
          activities?: string[]
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          mood: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          mood?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          mood?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          data_hash: string
          insights_data: any
          created_at: string
          updated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_hash: string
          insights_data: any
          created_at?: string
          updated_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          data_hash?: string
          insights_data?: any
          created_at?: string
          updated_at?: string
          expires_at?: string
        }
      }
    }
  }
} 