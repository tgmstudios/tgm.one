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
import { getProjects } from '~/lib/projectsLoader.js'

const route = useRoute()
const siteName = 'TGM.One'

const pageTitle = computed(() => {
  const path = route.path || '/'
  if (path === '/' || path === '') return `Home — ${siteName}`
  if (path === '/about') return `About — ${siteName}`
  if (path === '/projects') return `Projects — ${siteName}`
  if (path === '/blogs') return `Blog — ${siteName}`
  if (path.startsWith('/project/')) {
    const key = route.params.project
    const proj = key ? getProjects()[key] : null
    if (proj && proj.title) return `${proj.title} — ${siteName}`
    return `Project — ${siteName}`
  }
  if (path.startsWith('/blog/')) return `Blog — ${siteName}`
  return siteName
})

const pageDescription = computed(() => {
  const path = route.path || '/'
  if (path === '/' || path === '') {
    return 'Aiden Johnson - Software developer focused on building practical, reliable systems. Explore projects in RFID, IoT, web platforms, and infrastructure.'
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
  if (path.startsWith('/project/')) {
    const key = route.params.project
    const proj = key ? getProjects()[key] : null
    if (proj && proj.excerpt) {
      return proj.excerpt
    }
    return `Project details and information from TGM.One`
  }
  return 'TGM.One - Software development projects and blog by Aiden Johnson'
})

watchEffect(() => {
  useHead({
    title: pageTitle.value,
    meta: [
      {
        name: 'description',
        content: pageDescription.value
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


