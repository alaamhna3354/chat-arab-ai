// stores/guestChat.js
import { defineStore } from 'pinia'
import { ref } from 'vue'


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
  async function sendMessageToAI(message, conversationId, provider = 'gemini-flash',callbacks) {
    const { onChunk, onComplete, onError, onStart } = callbacks
    const config = useRuntimeConfig()
    const abortController = new AbortController()
  
    // نبدأ الاستماع بدون await
    const streamPromise = (async () => {
      try {
        onStart?.()
  
        const response = await fetch(`${config.public.apiBase}/chat/stream`, {
          method: 'POST',
          body: JSON.stringify({
            message,
            provider
          }),
          signal: abortController.signal // 🔑 مهم جدًا
        })
  
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
  
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
  
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
  
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
  
                if (data.type === 'chunk') onChunk?.(data.text)
                else if (data.type === 'done') {
                  onComplete?.(data.conversation_id)
                  return
                } else if (data.type === 'error') {
                  onError?.(data.message)
                  return
                }
              } catch (e) {
                console.warn('Invalid chunk:', e)
              }
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('🚫 Stream aborted by user')
        } else {
          onError?.(error.message)
        }
      }
    })()
  
    // نرجع الكائن للتحكم الفوري
    return {
      abort: () => abortController.abort(),
      done: streamPromise
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
