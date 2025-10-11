<template>
  <div class="main" :class="isSidebarOpen ? 'open' : ''">
    <div v-if="isSidebarOpen" @click="isSidebarOpen = !isSidebarOpen"
      class="block md:hidden fixed inset-0 z-39 backdrop-blur-sm bg-elevated/75 cursor-pointer">
    </div>
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
import { useCookie } from '#app'
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
