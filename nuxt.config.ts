
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true, 
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Cross-Origin-Opener-Policy': 'unsafe-none',
          'Cross-Origin-Embedder-Policy': 'unsafe-none'
        }
      }
    }
  },
  app: {
    head: {
      meta: [
        { 'http-equiv': 'Cross-Origin-Opener-Policy', content: 'same-origin-allow-popups' },
        { 'http-equiv': 'Cross-Origin-Embedder-Policy', content: 'unsafe-none' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      script: [
        {
          src: 'https://accounts.google.com/gsi/client',
          async: true,
          defer: true
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
    googleClientId: "825528766846-gbq9m05amb2rdbdk5pv9bvp89b4fgqtf.apps.googleusercontent.com",
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
