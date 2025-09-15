// plugins/pinia-persistedstate.client.ts
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  // nuxtApp.pinia موجود بعد تثبيت @pinia/nuxt
  nuxtApp.$pinia?.use(piniaPluginPersistedstate)
})
