// plugins/setup-api-keys.client.js
export default defineNuxtPlugin(() => {
  // تعيين متغيرات البيئة للـ AI SDK
  if (typeof window !== 'undefined') {
    // هذه القيم ستكون متاحة من runtimeConfig
    const config = useRuntimeConfig()
    
    if (config.public.openaiApiKey) {
      process.env.OPENAI_API_KEY = config.public.openaiApiKey
    }
    
    if (config.public.googleApiKey) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = config.public.googleApiKey
    }
    
    console.log('API Keys set in plugin:', {
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    })
  }
})

