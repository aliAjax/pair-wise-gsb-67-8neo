import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueQueryPlugin, {
    queryClient: new QueryClient({
      defaultOptions: { queries: { staleTime: 60_000 } }
    })
  })
})
