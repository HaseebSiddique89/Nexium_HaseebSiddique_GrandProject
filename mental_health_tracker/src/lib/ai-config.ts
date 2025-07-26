import { AIModelConfig } from './ai-insights-enhanced'

// AI Configuration
export const AI_CONFIG: AIModelConfig = {
  provider: process.env.NEXT_PUBLIC_AI_PROVIDER as 'gemini' | 'openai' | 'anthropic' | 'huggingface' | 'local' | 'custom' || 'gemini',
  model: process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-2.5-flash-lite',
  apiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
  endpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT,
  huggingfaceToken: process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN
}

// Debug environment variables
console.log('🔧 Environment Variables Debug:')
console.log('  - NEXT_PUBLIC_AI_PROVIDER:', process.env.NEXT_PUBLIC_AI_PROVIDER)
console.log('  - NEXT_PUBLIC_AI_MODEL:', process.env.NEXT_PUBLIC_AI_MODEL)
console.log('  - NEXT_PUBLIC_AI_API_KEY:', process.env.NEXT_PUBLIC_AI_API_KEY ? 'SET' : 'NOT SET')
console.log('  - NEXT_PUBLIC_HUGGINGFACE_TOKEN:', process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN ? 'SET' : 'NOT SET')
console.log('  - AI_CONFIG:', AI_CONFIG)

// Check if AI is enabled
export const isAIEnabled = () => {
  return AI_CONFIG.provider !== 'local' && (AI_CONFIG.apiKey || AI_CONFIG.huggingfaceToken)
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
  NEXT_PUBLIC_AI_PROVIDER: 'gemini|openai|anthropic|huggingface|local',
  NEXT_PUBLIC_AI_MODEL: 'gemini-2.5-flash-lite|gemini-1.5-flash|gemini-1.5-pro|gpt-3.5-turbo|gpt-4',
  NEXT_PUBLIC_AI_API_KEY: 'your_api_key_here',
  NEXT_PUBLIC_AI_ENDPOINT: 'optional_custom_endpoint',
  NEXT_PUBLIC_HUGGINGFACE_TOKEN: 'your_huggingface_token_here'
} 