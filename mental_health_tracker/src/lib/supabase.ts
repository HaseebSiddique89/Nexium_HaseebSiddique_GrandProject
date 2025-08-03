import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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
          insights_data: Record<string, unknown>
          created_at: string
          updated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_hash: string
          insights_data: Record<string, unknown>
          created_at?: string
          updated_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          data_hash?: string
          insights_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
          expires_at?: string
        }
      }
    }
  }
}

export const fetchUserData = async (userId: string): Promise<{
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
}> => {
  const { data: moodEntries } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return {
    moodEntries: moodEntries || [],
    journalEntries: journalEntries || []
  }
}

export const fetchUserProfile = async (userId: string): Promise<{
  id: string;
  email: string;
  created_at: string;
} | null> => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data
}

export const updateUserProfile = async (userId: string, updates: {
  email?: string;
  updated_at?: string;
}): Promise<{
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
} | null> => {
  const { data } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return data
} 