<template>
    <div class="chat-page">
      <h1 class="title">Chat {{ conversationId }}</h1>
      <ChatBox :conversation-id="conversationId" />
    </div>
  </template>
  
  <script setup>
  import { useRoute } from "vue-router"
  import ChatBox from "~/components/ChatBox.vue"
  
  const route = useRoute()
  const conversationId = route.params.id
  </script>
  
  <style scoped>
  .title {
    text-align: center;
    margin-bottom: 20px;
  }
  .chat-page {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  </style>
  