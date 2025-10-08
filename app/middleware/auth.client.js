// middleware/auth.client.js
import { useAuthStore } from '../../stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const publicPages = ['/login', '/signup']
  const guestPages = ['/guest', '/guest-chat']

  // الصفحات العامة ما بدها حماية
  if (publicPages.includes(to.path)) return
  
  // الصفحات الخاصة بالضيوف
  if (guestPages.some(page => to.path.startsWith(page))) return

  // إذا ما في توكين أصلاً → اعتبر المستخدم غير مسجل
  if (!auth.accessToken) {
    auth.user = null
    return // 👈 وقف هون بدون تحويل
  }

  try {
    // حاول تجيب بيانات المستخدم (باستعمال التوكين الحالي)
    if (!auth.user) {
      await auth.fetchUser()
    }
  } catch (err) {
    if (err?.status === 401) {
      // جرّب تجديد التوكين
      const refreshed = await auth.refreshAccessToken()
      if (refreshed) {
        try {
          await auth.fetchUser()
          return
        } catch {
          auth.user = null
          auth.accessToken = null
          return
        }
      } else {
        auth.user = null
        auth.accessToken = null
        return
      }
    } else {
      auth.user = null
      auth.accessToken = null
      return
    }
  }
})
