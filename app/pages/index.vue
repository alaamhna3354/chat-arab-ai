<template>
  <div class="main" :class="isSidebarOpen ? 'open' : ''">
    <!-- Landing Section (SSR) -->
     
      <SideBar :class="isSidebarOpen ? 'open' : ''" @toggle-sidebar="toggleSidebar" />
    <div class="body-content" >
      <Header />
      <ClientOnly>
        <BodyShine />
      </ClientOnly>
      <!-- <h1 class="title text-3xl">{{ $t('Beyond limits with ChatGPT + Gemini') }}</h1> -->
      <!-- Chat Section (SPA) -->

      <ClientOnly>
        <ChatBox />
      </ClientOnly>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
definePageMeta({
  middleware: ['auth-client']
})
// import { useAuthStore } from '../../stores/auth'
// const auth = useAuthStore()
const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>
<style lang="scss" scoped>
.title {
  text-align: center;
  margin-top: 100px;
  margin-bottom: 30px;
  font-weight: 600;
}
</style>
