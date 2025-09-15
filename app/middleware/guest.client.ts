// middleware/guest.client.ts
import { useAuthStore } from '../../stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const publicPages = ['/login', '/signup']

  // إذا المستخدم مسجل دخول وحاول يروح لصفحة تسجيل
  if (auth.user && publicPages.includes(to.path)) {
    return navigateTo('/') // أو أي صفحة رئيسية تريدها
  }
})
