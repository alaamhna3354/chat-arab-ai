// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useModelsStore } from './models'
export const useAuthStore = defineStore('auth', () => {
  const modelsStore  = useModelsStore()
  
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const isAuthenticated = computed(() => !!accessToken.value)

  // login
  async function login(credentials) {
    const config = useRuntimeConfig()
    try {
      const res = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: credentials
      })

      user.value = res.data.user
      accessToken.value = res.data.token   // نتوقع الباك يرجعو
      refreshToken.value = res.data.refreshToken // إذا متوفر

      if (res.data.availableModels && Array.isArray(res.data.availableModels)) {
        modelsStore.setAvailableModels(res.data.availableModels)
        console.log('modelOptions',modelsStore.modelOptions)
      }
      // مسح بيانات الضيوف عند تسجيل الدخول
      if (typeof window !== 'undefined') {
        const { useGuestChatStore } = await import('./guestChat')
        const guestChat = useGuestChatStore()
        guestChat.clearGuestData()
      }

      return res
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  }

  async function signup(payload) {
    const config = useRuntimeConfig()
    try {
      const res = await $fetch(`${config.public.apiBase}/auth/signup`, {
        method: 'POST',
        body: payload
      })

      user.value = res.data.user
      accessToken.value = res.data.token
      refreshToken.value = res.data.refreshToken

      // مسح بيانات الضيوف عند تسجيل الدخول
      if (typeof window !== 'undefined') {
        const { useGuestChatStore } = await import('./guestChat')
        const guestChat = useGuestChatStore()
        guestChat.clearGuestData()
      }

      return res
    } catch (err) {
      console.error('Signup error:', err)
      throw err
    }
  }

  // يجلب بيانات المستخدم
  async function fetchUser() {
    const config = useRuntimeConfig()
    if (!accessToken.value) {
      user.value = null
      throw new Error('No token found')
    }

    try {
      const data = await $fetch(`${config.public.apiBase}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })

      user.value = data.user ?? data
      return user.value
    } catch (err) {
      user.value = null
      throw err
    }
  }

  // يجدد التوكين (إذا السيرفر عندو endpoint للتجديد)
  async function refreshAccessToken() {
    const config = useRuntimeConfig()
    try {
      if (!refreshToken.value) return false

      const res = await $fetch(`${config.public.apiBase}/auth/refresh-token`, {
        method: 'POST',
        body: { token: refreshToken.value }
      })

      accessToken.value = res.data.token
      return true
    } catch {
      accessToken.value = null
      return false
    }
  }

  async function logout() {
    const config = useRuntimeConfig()
    try {
      await $fetch(`${config.public.apiBase}/auth/logout`, { method: 'POST' })
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      localStorage.removeItem('models')
      navigateTo('/')
    }
  }

   async function loginWithGoogleToken(googleIdToken) {
    const config = useRuntimeConfig()
    try {
      const res = await $fetch(`${config.public.apiBase}/auth/google`, {
        method: 'POST',
        body: { googleIdToken }
      })
      
      user.value = res.data.user
      accessToken.value = res.data.token
      refreshToken.value = res.data.refreshToken

      // مسح بيانات الضيوف عند تسجيل الدخول
      if (typeof window !== 'undefined') {
        const { useGuestChatStore } = await import('./guestChat')
        const guestChat = useGuestChatStore()
        guestChat.clearGuestData()
      }

      window.location.href = '/'
      return res
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }
  function updateProfile(payload) {
    const config = useRuntimeConfig()
    return $fetch(`${config.public.apiBase}/auth/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: payload
    }).then((res) => {
      user.value = res.data.user
      return res
    })
  }
  function changePassword(payload) {
    const config = useRuntimeConfig()
    return $fetch(`${config.public.apiBase}/auth/change-password`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: payload
    }).then((res) => {
      user.value = res.data.user
      return res
    })
  }
  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    signup,
    fetchUser,
    refreshAccessToken,
    logout,
    loginWithGoogleToken,
    updateProfile,
    changePassword
  }
}, {
  persist: true // يخزن القيم بالـ localStorage
})
