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
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'One developer building complete systems from design to deployment. Specializing in IoT, web platforms, and infrastructure - shipping secure, scalable solutions.' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'author', content: 'Aiden Johnson' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'TGM.One' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'theme-color', content: '#0a0a0a' }
      ],
      link: [
        { rel: 'canonical', href: 'https://tgm.one' }
      ],
      bodyAttrs: {
        class: 'bg-gray-950 text-gray-100'
      },
      htmlAttrs: {
        lang: 'en'
      }
    }
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    },
    routeRules: {
      '/sitemap.xml': { prerender: true }
    }
  },
})


