// stores/guestChat.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { generateText, streamText } from 'ai'

export const useGuestChatStore = defineStore('guestChat', () => {
  const conversations = ref({})      // المحادثات المحلية للضيوف
  const currentConversationId = ref(null)  // المحادثة الحالية
  const Messages = ref([])           // الرسائل الحالية

  // ------------------------
  // إنشاء محادثة جديدة للضيف
  function createGuestConversation() {
    const conversationId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    conversations.value[conversationId] = []
    currentConversationId.value = conversationId
    Messages.value = []
    return conversationId
  }

  // ------------------------
  // إضافة رسالة لمحادثة الضيف
  function addMessage(conversationId, message) {
    if (!conversations.value[conversationId]) {
      conversations.value[conversationId] = []
    }
    conversations.value[conversationId].push(message)
    
    // تحديث الرسائل الحالية إذا كانت نفس المحادثة
    if (conversationId === currentConversationId.value) {
      Messages.value = [...conversations.value[conversationId]]
    }
  }

  // ------------------------
  // الحصول على رسائل محادثة معينة
  function getMessages(conversationId) {
    return conversations.value[conversationId] || []
  }

  // ------------------------
  // تعيين المحادثة الحالية
  function setCurrentConversation(conversationId) {
    currentConversationId.value = conversationId
    Messages.value = [...(conversations.value[conversationId] || [])]
  }

  // ------------------------
  // الحصول على قائمة المحادثات
  function getAllConversations() {
    return Object.keys(conversations.value).map(id => ({
      id,
      title: conversations.value[id][0]?.content?.slice(0, 30) || 'New Chat',
      lastMessage: conversations.value[id][conversations.value[id].length - 1]?.content?.slice(0, 50) || '',
      createdAt: new Date().toISOString()
    }))
  }

  // ------------------------
  // حذف محادثة
  function deleteConversation(conversationId) {
    delete conversations.value[conversationId]
    if (currentConversationId.value === conversationId) {
      currentConversationId.value = null
      Messages.value = []
    }
  }

  // ------------------------
  // إرسال رسالة مع AI (Streaming)
  async function sendMessageToAI(message, conversationId, provider = 'openai', modelName = null) {
    const config = useRuntimeConfig()
    
    if (provider === 'openai' && !config.public.openaiApiKey) {
      throw new Error('OpenAI API key is missing. Please add OPENAI_API_KEY to your .env file.')
    }
    if (provider === 'google' && !config.public.googleApiKey) {
      throw new Error('Google API key is missing. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env file.')
    }
    
    try {
      // إضافة رسالة المستخدم
      addMessage(conversationId, {
        id: Date.now(),
        role: 'user',
        content: message,
        timestamp: new Date()
      })

      // إنشاء رسالة البوت الفارغة
      const botMessageId = crypto.randomUUID()
      addMessage(conversationId, {
        id: botMessageId,
        role: 'assistant',
        content: ''
      })

      // إعداد الموديل
      let model
      if (provider === 'google') {
        // تعيين متغير البيئة للـ Google
        if (typeof process !== 'undefined') {
          process.env.GOOGLE_GENERATIVE_AI_API_KEY = config.public.googleApiKey
        }
        // جرب أسماء مختلفة للموديل
        const modelNameToUse = modelName || 'gemini-2.5-flash'
        
        model = google(modelNameToUse, {
          apiKey: config.public.googleApiKey
        })
      } else {
        // للتأكد من أن المفتاح صحيح
        if (!config.public.openaiApiKey) {
          throw new Error('OpenAI API key is not available')
        }
        
        // محاولة استخدام المفتاح مباشرة
        const apiKey = config.public.openaiApiKey
        // تعيين متغير البيئة مؤقتاً
        if (typeof process !== 'undefined') {
          process.env.OPENAI_API_KEY = apiKey
        }
        
        model = openai(modelName || 'gpt-4o-mini', {
          apiKey: apiKey
        })
      }
      
      // الحصول على تاريخ المحادثة
      const conversationHistory = conversations.value[conversationId]
        .filter(msg => msg.role !== 'assistant' || msg.content) // استبعاد الرسائل الفارغة
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      // بدء الـ streaming
      const result = await streamText({
        model,
        messages: conversationHistory,
        temperature: 0.7,
        maxTokens: 2000,
      })

      let fullResponse = ''
      
      for await (const chunk of result.textStream) {
        fullResponse += chunk
        
        // تحديث رسالة البوت
        const updatedMessages = conversations.value[conversationId].map(msg => 
          msg.id === botMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        )
        conversations.value[conversationId] = updatedMessages
        
        // تحديث الرسائل الحالية
        if (conversationId === currentConversationId.value) {
          Messages.value = [...updatedMessages]
        }
      }

      return {
        success: true,
        messageId: botMessageId,
        fullResponse
      }

    } catch (error) {
      console.error('AI API Error:', error)
      
      // إذا كان خطأ Google، جرب OpenAI كبديل
      if (provider === 'google' && config.public.openaiApiKey) {
        console.log('Google failed, trying OpenAI as fallback...')
        try {
          // محاولة مع OpenAI
          const fallbackResult = await sendMessageToAI(message, conversationId, 'openai', modelName)
          return fallbackResult
        } catch (fallbackError) {
          console.error('OpenAI fallback also failed:', fallbackError)
        }
      }
      
      // إضافة رسالة خطأ
      addMessage(conversationId, {
        id: Date.now(),
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      })

      return {
        success: false,
        error: error.message
      }
    }
  }

  // ------------------------
  // تنظيف البيانات عند تسجيل الدخول
  function clearGuestData() {
    conversations.value = {}
    currentConversationId.value = null
    Messages.value = []
  }

  return {
    conversations,
    currentConversationId,
    Messages,
    createGuestConversation,
    addMessage,
    getMessages,
    setCurrentConversation,
    getAllConversations,
    deleteConversation,
    sendMessageToAI,
    clearGuestData
  }
}, {
  persist: {
    key: 'guest-chat-store',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    paths: ['conversations', 'currentConversationId']
  }
})
