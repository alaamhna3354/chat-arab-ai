import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { streamText, generateText } from 'ai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { provider, modelName, messages } = body
  if (!config.public.openaiApiKey) console.error('❌ OpenAI API key missing in runtimeConfig')
  if (!config.public.googleGenerativeAiApiKey) console.error('❌ Google API key missing in runtimeConfig')

  try {
    let model
    let finalMessages = messages

    if (provider === 'google') {
      // ✅ system message يجب أن يكون فقط في البداية
      finalMessages = messages.map((m, i) =>
        m.role === 'system' && i !== 0 ? { role: 'user', content: m.content } : m
      )

      // إنشاء موديل Gemini
      model = google(modelName || 'gemini-2.0-flash', {
        apiKey: config.public.googleGenerativeAiApiKey
      })

      try {
        const result = await streamText({
          model,
          messages: finalMessages,
          temperature: 0.7
        })

        let fullResponse = ''
        for await (const chunk of result.textStream) fullResponse += chunk

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
      // OpenAI
      model = openai(modelName || 'gpt-4o-mini', {
        apiKey: config.public.openaiApiKey
      })

      const result = await streamText({
        model,
        messages,
        temperature: 0.7
      })

      let fullResponse = ''
      for await (const chunk of result.textStream) fullResponse += chunk

      return { success: true, content: fullResponse }
    }
  } catch (error) {
    console.error('❌ AI error:', error)
    return { success: false, error: error.message }
  }
})
