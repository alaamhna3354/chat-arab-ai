<template>
    <div v-if="isSidebarOpen" @click="isSidebarOpen = !isSidebarOpen"
      class="block md:hidden fixed inset-0 z-39 backdrop-blur-sm bg-elevated/75 cursor-pointer">
    </div>
    <div v-if="Loaded" class="main" :class="isSidebarOpen ? 'open' : ''">
        <!-- Sidebar -->
        <SideBar :class="isSidebarOpen ? 'open' : ''" @toggle-sidebar="toggleSidebar" />

        <!-- Main content -->
        <Profile v-if="auth.user" />
        <main class="body-content">
            <Header @toggle-sidebar="toggleSidebar" />
            <slot />
        </main>
    </div>
    <transition name="fade">
        <div v-if="!Loaded"
            class="fixed z-1000 inset-0 backdrop-blur-sm bg-elevated/75 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3 text-white">
                <UIcon name="svg-spinners:pulse-multiple"
                    class="size-30 text-gradient bg-gradient-to-r from-[#5d6faf] from-10% via-[#3ae8fb] via-40% to-[#a960c1] to-90%" />
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCookie } from '#app'
import Profile from '../components/Modals/Profile.vue'
import SideBar from '../components/SideBar.vue'
import Header from '../components/Header.vue'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'

const Loaded = ref(false)
onMounted(async () => {
    Loaded.value = true;
})
/* -------------------------
   إعدادات أساسية
------------------------- */
const auth = useAuthStore()

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
    margin-left: 250px;
    /* مثال إذا sidebar مفتوح */
}

.body-content {
    flex: 1;
    transition: margin-left 0.3s ease;
}
</style>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out; 
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0; 
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1; 
}
</style>