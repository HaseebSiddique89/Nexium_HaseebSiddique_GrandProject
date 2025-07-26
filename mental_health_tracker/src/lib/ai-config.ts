import { AIModelConfig } from './ai-insights-enhanced'

// AI Configuration
export const AI_CONFIG: AIModelConfig = {
  provider: process.env.NEXT_PUBLIC_AI_PROVIDER as 'gemini' | 'openai' | 'anthropic' | 'local' | 'custom' || 'gemini',
  model: process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-1.5-flash',
  apiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
  endpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT
}

// Check if AI is enabled
export const isAIEnabled = () => {
  return AI_CONFIG.provider !== 'local' && AI_CONFIG.apiKey
}

// Get AI configuration for use
export const getAIConfig = (): AIModelConfig | undefined => {
  if (isAIEnabled()) {
    return AI_CONFIG
  }
  return undefined
}

// AI Feature flags
export const AI_FEATURES = {
  SENTIMENT_ANALYSIS: true,
  PREDICTIVE_INSIGHTS: true,
  PERSONALIZED_RECOMMENDATIONS: true,
  EMOTIONAL_PATTERN_DETECTION: true
}

// Environment variables needed for AI features
export const REQUIRED_AI_ENV_VARS = {
  NEXT_PUBLIC_AI_PROVIDER: 'gemini|openai|anthropic|local',
  NEXT_PUBLIC_AI_MODEL: 'gemini-1.5-flash|gemini-1.5-pro|gpt-3.5-turbo|gpt-4',
  NEXT_PUBLIC_AI_API_KEY: 'your_api_key_here',
  NEXT_PUBLIC_AI_ENDPOINT: 'optional_custom_endpoint'
} 