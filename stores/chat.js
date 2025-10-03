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

  // ------------------------
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
    GetMessagesApi,
    DeleteConversation
  }
})