// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '@/assets/css/tailwind.css'
  ],
  runtimeConfig: {
    public: {
      foligoBaseUrl: 'https://api.foligo.tech',
      foligoProjectId: '57329b2f-d80e-4384-8d82-5fabc872cd07'
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'TGM.One',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      bodyAttrs: {
        class: 'bg-gray-950 text-gray-100'
      }
    }
  }
})


