// Test file for Gemini API integration
import { getAIConfig, isAIEnabled } from './ai-config'

export async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini API Integration...')
  
  // Test AI configuration
  const aiConfig = getAIConfig()
  const aiEnabled = isAIEnabled()
  
  console.log('AI Config:', aiConfig)
  console.log('AI Enabled:', aiEnabled)
  
  if (aiEnabled && aiConfig?.provider === 'gemini') {
    console.log('✅ Gemini is properly configured')
    
    // Test a simple Gemini API call
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model}:generateContent?key=${aiConfig.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello! Please respond with "Gemini API is working!" and nothing else.'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const result = data.candidates[0].content.parts[0].text
        console.log('✅ Gemini API test successful:', result)
        return true
      } else {
        console.error('❌ Gemini API test failed:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('❌ Gemini API test failed:', error)
      return false
    }
  } else {
    console.log('⚠️ Gemini is not enabled - check your configuration')
    return false
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testGemini = testGeminiIntegration
} else {
  // Node environment
  testGeminiIntegration()
} 