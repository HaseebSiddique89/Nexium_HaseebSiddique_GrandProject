-- Fix for ai_insights table RLS issues
-- Run this if you're getting 406 errors

-- First, let's check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'ai_insights'
);

-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_hash TEXT NOT NULL,
  insights_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id)
);

-- Temporarily disable RLS for testing
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS, recreate the policies properly
-- ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own AI insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can insert own AI insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can update own AI insights" ON ai_insights;
DROP POLICY IF EXISTS "Users can delete own AI insights" ON ai_insights;

-- Create new policies
CREATE POLICY "Users can view own AI insights" ON ai_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI insights" ON ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI insights" ON ai_insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI insights" ON ai_insights
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires_at ON ai_insights(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_data_hash ON ai_insights(data_hash);

-- Create function and trigger
CREATE OR REPLACE FUNCTION update_ai_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_insights_updated_at_trigger ON ai_insights;
CREATE TRIGGER update_ai_insights_updated_at_trigger
  BEFORE UPDATE ON ai_insights
  FOR EACH ROW EXECUTE FUNCTION update_ai_insights_updated_at(); 