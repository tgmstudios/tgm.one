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

watchEffect(() => {
  useHead({ title: pageTitle.value })
})
</script>

<style scoped>
main {
  min-height: 60vh;
}
</style>


