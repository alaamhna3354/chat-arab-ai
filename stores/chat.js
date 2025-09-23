import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // المحادثات مخزنة كـ object
  // key = conversationId
  const conversations = ref({})

  function addMessage(conversationId, message) {
    if (!conversations.value[conversationId]) {
      conversations.value[conversationId] = []
    }
    conversations.value[conversationId].push(message)
  }

  function getMessages(conversationId) {
    return conversations.value[conversationId] || []
  }

  return { conversations, addMessage, getMessages }
})
