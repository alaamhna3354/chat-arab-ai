
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true, 
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      // script: [
      //   {
      //     src: 'https://accounts.google.com/gsi/client',
      //     async: true,
      //     defer: true
      //   }
      // ]
    }
  },
  runtimeConfig: {
    public: {
    googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
    apiBase: "https://arabai-825528766846.europe-west1.run.app/api" 
    }
  },
  modules: ['@nuxtjs/i18n','@pinia/nuxt','@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ar', name: 'Arabic', file: 'ar.json' }
    ]
  }
})
