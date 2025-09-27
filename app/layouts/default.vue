<template>
    <div class="main" :class="isSidebarOpen ? 'open' : ''">
        <!-- Sidebar -->
        <SideBar :class="isSidebarOpen ? 'open' : ''" @toggle-sidebar="toggleSidebar" />

        <!-- Main content -->
        <main class="body-content">
            <Header @toggle-sidebar="toggleSidebar" />
            <slot />
        </main>
    </div>
</template>
<script setup>
import { ref } from 'vue'

// import { useAuthStore } from '../../stores/auth'
// const auth = useAuthStore()
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}
</script>
