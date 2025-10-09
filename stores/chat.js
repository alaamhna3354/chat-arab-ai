import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { useRouter, useRoute } from 'vue-router'

export const useChatStore = defineStore('chat', () => {
  const auth = useAuthStore()
  const AllConversations = ref([])   // قائمة كل المحادثات
  const conversations = ref({})      // كل محادثة مع الرسائل
  const Messages = ref([])  
  // Modals
  const selectedModel = ref('gpt-4o-mini')          
  const modelOptions = [[
    {
      label: 'OpenAI chatgpt',
      icon: 'logos:openai-icon',
      onSelect: () => {
        selectedModel.value = 'gpt-4o-mini'
      }
    },
    {
      label: 'Google Gemini Flash',
      icon: 'material-icon-theme:gemini-ai',
      onSelect: () => {
        selectedModel.value = 'gemini-flash'
      }
    }
  ]]
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
  async function CreateConversation(message, provider) {
    const conversationId = ref(null)
  
    return new Promise((resolve, reject) => {
      const { abort, done } = streamChat(message, null, provider, {
        onStart: () => {
          console.log('🚀 Starting streaming for new conversation...')
        },
        onChunk: (text) => {
          // أول chunk ممكن يحتوي على conversation_id
          // أو نستعمل حدث onComplete لاحقًا لو الباك يرجع id هناك
          if (!conversationId.value) {
            // يمكنك التقاطه من data.type === 'chunk' الأولى أو من onComplete
          }
  
          // أضف النص تدريجيًا للمحادثة المؤقتة
          if (conversationId.value) {
            if (!conversations.value[conversationId.value]) {
              conversations.value[conversationId.value] = []
            }
            const msgs = conversations.value[conversationId.value]
            if (!msgs.length || msgs[msgs.length - 1].role !== 'assistant') {
              msgs.push({ role: 'assistant', content: text })
            } else {
              msgs[msgs.length - 1].content += text
            }
          }
        },
        onComplete: (convId) => {
          GetConversation()
          conversationId.value = convId
          
          if (!AllConversations.value[convId]) {
            AllConversations.value[convId] = {
              id: convId,
              title: message.slice(0, 20) || 'New Chat',
            }
          }
          resolve({ conversation_id: convId })
        },
        onError: (err) => {
          console.error('❌ Streaming error:', err)
          reject(err)
        },
      })
    })
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
    const router = useRouter()
    const route = useRoute() 
    try {
      const data = await $fetch(`${config.public.apiBase}/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        },
      })
  
      if (data) {
        // حذف الرسائل من الستور
        delete conversations.value[conversationId]
  
        // حذف المحادثة من القائمة الجانبية
        if (Array.isArray(AllConversations.value)) {
          AllConversations.value = AllConversations.value.filter(conv => conv.id !== conversationId)
        } else {
          delete AllConversations.value[conversationId]
        }
  
        // 🧠 فقط إذا المستخدم داخل نفس صفحة المحادثة، رجّعه للرئيسية
        if (route.params.id == conversationId) {
          Messages.value = []
          router.push('/')
        }
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
    selectedModel,
    modelOptions,
    addMessage,
    getMessages,
    CreateConversation,
    GetConversation,
    streamChat,
    GetMessagesApi,
    DeleteConversation
  }
})