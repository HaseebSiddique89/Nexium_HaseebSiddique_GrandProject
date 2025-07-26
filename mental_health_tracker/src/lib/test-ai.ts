// Test file for AI integration
import { getAIConfig, isAIEnabled } from './ai-config'
import { generateEnhancedAIInsights } from './ai-insights-enhanced'

export async function testAIIntegration() {
  console.log('🧪 Testing AI Integration...')
  
  // Test AI configuration
  const aiConfig = getAIConfig()
  const aiEnabled = isAIEnabled()
  
  console.log('AI Config:', aiConfig)
  console.log('AI Enabled:', aiEnabled)
  
  if (aiEnabled) {
    console.log('✅ AI is properly configured')
    
    // Test with a mock user ID
    try {
      const insights = await generateEnhancedAIInsights('test-user-id', aiConfig)
      console.log('✅ AI insights generated successfully')
      console.log('Insights preview:', {
        sentimentAnalysis: insights.sentimentAnalysis.overallSentiment,
        predictiveInsights: insights.predictiveInsights.moodPrediction,
        aiGeneratedInsights: insights.aiGeneratedInsights.length,
        personalizedRecommendations: insights.personalizedRecommendations.length
      })
    } catch (error) {
      console.error('❌ AI insights generation failed:', error)
    }
  } else {
    console.log('⚠️ AI is not enabled - using basic analysis')
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testAI = testAIIntegration
} else {
  // Node environment
  testAIIntegration()
} 