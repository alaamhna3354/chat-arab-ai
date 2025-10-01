import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isProfileDrawerOpen = ref(false)
  function openProfileDrawer() {
    isProfileDrawerOpen.value = true
  }
  function closeProfileDrawer() {
    isProfileDrawerOpen.value = false
  }
  return { isProfileDrawerOpen, openProfileDrawer, closeProfileDrawer }
})
