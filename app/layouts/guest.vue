<template>
  <div class="main" :class="isSidebarOpen ? 'open' : ''">
    <!-- Sidebar -->
    <GuestSideBar :class="isSidebarOpen ? 'open' : ''" @toggle-sidebar="toggleSidebar" />

    <!-- Main content -->
    <main class="body-content">
      <Header @toggle-sidebar="toggleSidebar" />
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
// import { useCookie } from '#app'
import { useI18n } from 'vue-i18n'
import GuestSideBar from '../components/Guest/GuestSideBar.vue'
import Header from '../components/Header.vue'

/* -------------------------
   إعدادات أساسية
------------------------- */
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const route = useRoute()

watch(route, () => {
  if (width.value <= 768) {
    isSidebarOpen.value = false
  }
})

/* -------------------------
   i18n
------------------------- */
const i18n = useI18n()

// حفظ اللغة في localStorage
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('i18n_redirected')
  if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      i18n.locale.value = savedLang
  }
}
</script>

<style scoped>
.main {
    display: flex;
    min-height: 100vh;
}

.main.open .body-content {
    margin-left: 250px;
}

.body-content {
    flex: 1;
    transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  .main.open .body-content {
    margin-left: 0;
  }
}
</style>
