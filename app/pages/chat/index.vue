<template>
    <div class="chat-list-page p-4">
      <h1 class="text-2xl font-bold mb-4">All Chats</h1>
      
      <ul class="space-y-2">
        <li
          v-for="(messages, id) in chat.conversations"
          :key="id"
          class="p-3 border rounded hover:bg-gray-100 cursor-pointer"
          @click="goToChat(id)"
        >
          Chat ID: {{ id }} — {{ messages.length }} messages
        </li>
      </ul>
  
      <button
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        @click="createNewChat"
      >
        + New Chat
      </button>
    </div>
  </template>
  
  <script setup>
  import { useChatStore } from '~/stores/chat'
  import { useRouter } from 'vue-router'
  
  const chat = useChatStore()
  const router = useRouter()
  
  const goToChat = (id) => {
    router.push(`/chat/${id}`)
  }
  
  // دالة لإنشاء ID فريد بدون مكتبة خارجية
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
  }
  
  const createNewChat = () => {
    const newId = generateId()
    // تهيئة محادثة جديدة
    chat.conversations[newId] = []
    router.push(`/chat/${newId}`)
  }
  </script>
  
  <style scoped>
  li:hover {
    background-color: #f3f4f6;
  }
  </style>
  