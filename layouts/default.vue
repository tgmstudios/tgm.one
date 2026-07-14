<template>
  <div>
    <HeaderSection :logo="logoURL" :menu="headerMenu"/>
    <main>
      <slot />
    </main>
    <FooterSection :menu="headerMenu"/>
  </div>
</template>

<script setup>
import HeaderSection from '~/components/HeaderSection.vue'
import FooterSection from '~/components/FooterSection.vue'
import logoURL from '~/assets/logo.png'
import { useHeaderMenu } from '~/composables/useHeaderMenu'

const { headerMenu } = useHeaderMenu()
import { useRoute } from '#app'
import { computed, watchEffect } from 'vue'
import { useHead } from '#imports'
import { useJsonLd } from '~/composables/useJsonLd'

const route = useRoute()
const siteName = 'TGM.One'
const { webSiteSchema, injectJsonLd } = useJsonLd()

// Inject WebSite schema on all pages
injectJsonLd(webSiteSchema())

// Removed project cache - pages handle their own meta tags

const pageTitle = computed(() => {
  const path = route.path || '/'
  if (path === '/' || path === '') return `Aiden Johnson — Software Developer — ${siteName}`
  if (path === '/about') return `About — ${siteName}`
  if (path === '/projects') return `Projects — ${siteName}`
  if (path === '/blogs') return `Blog — ${siteName}`
  if (path === '/search') return `Search — ${siteName}`
  if (path.startsWith('/project/')) {
    // Project pages handle their own meta tags, but provide fallback
    return `Project — ${siteName}`
  }
  if (path.startsWith('/blog/')) return `Blog — ${siteName}`
  return siteName
})

const pageDescription = computed(() => {
  const path = route.path || '/'
  if (path === '/' || path === '') {
    return 'Aiden Johnson — software developer building complete systems from design to deployment. Specializing in IoT, web platforms, and infrastructure.'
  }
  if (path === '/about') {
    return 'Learn about Aiden Johnson, a software developer studying Computer Science at Penn State, building products at Telaeris, and leading technical initiatives for PSU Competitive Cybersecurity Organization.'
  }
  if (path === '/projects') {
    return 'Explore software development projects including RFID tracking systems, IoT solutions, web platforms, and infrastructure projects by Aiden Johnson.'
  }
  if (path === '/blogs') {
    return 'Read blog posts about software development, technology, and technical insights from Aiden Johnson at TGM.One.'
  }
  if (path === '/search') {
    return 'Search projects and blog posts by skills, technologies, and keywords at TGM.One.'
  }
  if (path.startsWith('/project/')) {
    // Project pages handle their own meta tags, but provide fallback
    return `Project details and information from TGM.One`
  }
  return 'TGM.One - Software development projects and blog by Aiden Johnson'
})

const siteUrl = 'https://tgm.one'
const canonicalUrl = computed(() => {
  const path = route.path || '/'
  return `${siteUrl}${path}`
})

const pageImage = computed(() => {
  const path = route.path || '/'
  // Default OG image: use profile photo (much better than 16x16 favicon)
  return 'https://api.foligo.tech/api/media/c538ffd7-ae99-431b-9d76-8bf3345e92ff/file'
})

watchEffect(() => {
  useHead({
    title: pageTitle.value,
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl.value
      }
    ],
    meta: [
      // Basic SEO
      {
        name: 'description',
        content: pageDescription.value
      },
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      },
      {
        name: 'googlebot',
        content: 'index, follow'
      },
      {
        name: 'author',
        content: 'Aiden Johnson'
      },
      // Open Graph
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:title',
        content: pageTitle.value
      },
      {
        property: 'og:description',
        content: pageDescription.value
      },
      {
        property: 'og:url',
        content: canonicalUrl.value
      },
      {
        property: 'og:site_name',
        content: 'TGM.One'
      },
      {
        property: 'og:image',
        content: pageImage.value
      },
      {
        property: 'og:image:alt',
        content: pageTitle.value
      },
      {
        property: 'og:locale',
        content: 'en_US'
      },
      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: pageTitle.value
      },
      {
        name: 'twitter:description',
        content: pageDescription.value
      },
      {
        name: 'twitter:image',
        content: pageImage.value
      },
      {
        name: 'twitter:image:alt',
        content: pageTitle.value
      },
      // Additional SEO
      {
        name: 'theme-color',
        content: '#0a0a0a'
      },
      {
        name: 'format-detection',
        content: 'telephone=no'
      }
    ]
  })
})
</script>

<style scoped>
main {
  min-height: 60vh;
}
</style>


