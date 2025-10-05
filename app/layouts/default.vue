<template>
    <div class="main" :class="isSidebarOpen ? 'open' : ''">
      <!-- Sidebar -->
      <SideBar :class="isSidebarOpen ? 'open' : ''" @toggle-sidebar="toggleSidebar" />
  
      <!-- Main content -->
      <Profile v-if="auth.user" />
      <main class="body-content">
        <Header @toggle-sidebar="toggleSidebar" />
        <slot />
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useCookie } from '#app'
  import Profile from '../components/Modals/Profile.vue'
  import SideBar from '../components/SideBar.vue'
  import Header from '../components/Header.vue'
  import { useAuthStore } from '../../stores/auth'
  import { useI18n } from 'vue-i18n'
  
  /* -------------------------
     إعدادات أساسية
  ------------------------- */
  const auth = useAuthStore()
  const isSidebarOpen = ref(false)
  
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }
  
  const route = useRoute()
  
  watch(route, () => {
    isSidebarOpen.value = false
  })
  
  /* -------------------------
     i18n
  ------------------------- */
  const i18n = useI18n()
  
  // حاول نحفظ اللغة في كوكي أو localStorage
  const savedLang = useCookie('i18n_redirected').value
  if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
    i18n.locale.value = savedLang
  }
  
  // تحديث اللغة عند تغيير الراوت
  watch(
    () => route.path,
    () => {
      const lang = useCookie('i18n_redirected').value
      if (lang && (lang === 'en' || lang === 'ar')) {
        i18n.locale.value = lang
      }
    },
    { immediate: true }
  )
  </script>
  
  <style scoped>
  .main {
    display: flex;
    min-height: 100vh;
  }
  .main.open .body-content {
    margin-left: 250px; /* مثال إذا sidebar مفتوح */
  }
  .body-content {
    flex: 1;
    transition: margin-left 0.3s ease;
  }
  </style>
  