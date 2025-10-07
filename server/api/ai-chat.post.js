import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { streamText, generateText } from 'ai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ------------------ تأكد من وجود المفاتيح ------------------
  if (!config.openaiApiKey) {
    console.error('❌ OpenAI API key missing in runtimeConfig')
  } else {
    process.env.OPENAI_API_KEY = config.openaiApiKey
  }

  if (!config.googleApiKey) {
    console.error('❌ Google API key missing in runtimeConfig')
  } else {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = config.googleApiKey
  }

  const body = await readBody(event)
  const { provider, modelName, messages } = body

  try {
    let model
    let finalMessages = messages

    if (provider === 'google') {
      // ------------------ تنظيف الرسائل ------------------
      finalMessages = messages.map((m, i) => {
        // system فقط في بداية المحادثة
        if (m.role === 'system' && i !== 0) {
          return { role: 'user', content: m.content }
        }
        return m
      })

      // ------------------ إنشاء موديل Google ------------------
      model = google(modelName || 'gemini-2.0-flash')

      try {
        const result = await streamText({
          model,
          messages: finalMessages,
          temperature: 0.7
        })

        let fullResponse = ''
        for await (const chunk of result.textStream) {
          fullResponse += chunk
        }

        return { success: true, content: fullResponse }

      } catch (streamError) {
        console.warn('⚠️ Gemini streamText failed, fallback to generateText:', streamError)
        const prompt = finalMessages.map(m => `${m.role}: ${m.content}`).join('\n')
        const fallbackResult = await generateText({
          model,
          prompt,
          temperature: 0.7,
          maxTokens: 1500
        })
        return { success: true, content: fallbackResult.text }
      }

    } else {
      // ------------------ إنشاء موديل OpenAI ------------------
      model = openai(modelName || 'gpt-4o-mini', {
        apiKey: config.openaiApiKey
      })

      const result = await streamText({
        model,
        messages,
        temperature: 0.7
      })

      let fullResponse = ''
      for await (const chunk of result.textStream) {
        fullResponse += chunk
      }

      return { success: true, content: fullResponse }
    }

  } catch (error) {
    console.error('❌ AI error:', error)
    return { success: false, error: error.message }
  }
})
