import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const auth = useAuthStore()
  const AllConversations = ref([])   // قائمة كل المحادثات
  const conversations = ref({})      // كل محادثة مع الرسائل
  const Messages = ref([])           // الرسائل الحالية (اختياري)

  // ------------------------
  // إضافة رسالة لمحادثة موجودة أو جديدة
  function addMessage(conversationId, message) {
    if (!conversations.value[conversationId]) {
      conversations.value[conversationId] = []
    }
    conversations.value[conversationId].push(message)
  }

  function getMessages(conversationId) {
    return conversations.value[conversationId] || []
  }

  // Create Conversation
  async function CreateConversation(message = '') {
    const config = useRuntimeConfig()
    try {
      const data = await $fetch(`${config.public.apiBase}/chat/gemini/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: { message }
      })

      if (data?.conversation_id || data?.id) {
        const convId = data.conversation_id || data.id

        // أنشئ مصفوفة رسائل فاضية لهاي المحادثة
        conversations.value[convId] = []

        // ضيف المحادثة الجديدة على الهيستوري
        AllConversations.value[convId] = {
          id: convId,
          title: data.title || message.slice(0, 20) || 'New Chat',
          ...data
        }

        // إذا البيانات ناقصة (مثلاً ما رجع title) → رجّع كل المحادثات من السيرفر
        if (!data.title) {
          await GetConversation()
        }
      }

      return data
    } catch (err) {
      console.error('Create Conversation failed:', err)
      throw err
    }
  }


  // ------------------------
  // Get All Conversation
  async function GetConversation() {
    const config = useRuntimeConfig()
    try {
      const data = await $fetch(`${config.public.apiBase}/chat/conversations`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        },
      })

      if (data?.conversations) {
        AllConversations.value = data.conversations
      }

      return data
    } catch (err) {
      console.error('Get Conversation failed:', err)
      throw err
    }
  }

  // Streaming Chat ------------------------
  function streamChat(message, conversationId, provider, callbacks) {
    const { onChunk, onComplete, onError, onStart } = callbacks
    const config = useRuntimeConfig()
    const abortController = new AbortController()
  
    // نبدأ الاستماع بدون await
    const streamPromise = (async () => {
      try {
        onStart?.()
  
        const response = await fetch(`${config.public.apiBase}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({
            message,
            conversation_id: conversationId,
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
  

  // Get Messages for Conversation Id
  async function GetMessagesApi(conversationId) {
    const config = useRuntimeConfig()
    try {
      const data = await $fetch(`${config.public.apiBase}/chat/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        },
      })

      if (data?.messages) {
        conversations.value[conversationId] = data.messages
        Messages.value = data.messages
      }
      return data
    } catch (err) {
      console.error('Get Messages failed:', err)
      throw err
    }
  }
  // Delete Conversation Id
  async function DeleteConversation(conversationId) {
    const config = useRuntimeConfig()
    try {
      const data = await $fetch(`${config.public.apiBase}/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        },
      })

      if (data) {
        // if user in same conversationId route 
        if (Messages.value?.length && Messages.value[0]?.conversationId === conversationId) {
          Messages.value = []
          navigateTo('/')
        }

        // Delete Conversation from AllConversations
        if (Array.isArray(AllConversations.value)) {
          AllConversations.value = AllConversations.value.filter(conv => conv.id !== conversationId)
        } else {
          delete AllConversations.value[conversationId]
        }

        // Delete Messages from AllConversations
        delete conversations.value[conversationId]
      }

      return data
    } catch (err) {
      console.error('Delete Conversation failed:', err)
      throw err
    }
  }



  return {
    conversations,
    AllConversations,
    Messages,
    addMessage,
    getMessages,
    CreateConversation,
    GetConversation,
    streamChat,
    GetMessagesApi,
    DeleteConversation
  }
})