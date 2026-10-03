import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-29',
  devServer: { port: 18467 },
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@primevue/nuxt-module'],
  css: ['primeicons/primeicons.css', '~/assets/styles.css'],
  primevue: {
    options: {
      ripple: true,
      theme: { preset: Aura, options: { darkModeSelector: false } }
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '光伏电站并网验收与缺陷闭环平台',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  }
})
