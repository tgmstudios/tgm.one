<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-extrabold mb-6">Projects</h1>
    
    <div v-if="pending" class="text-gray-400">Loading projects…</div>
    <div v-else-if="error" class="text-red-400">Failed to load projects.</div>
    
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProjectWidget 
        v-for="project in projects" 
        :key="project.id || project.slug" 
        :project="project"
        :view="'card'"
      />
    </div>
  </div>
</template>

<script setup>
import ProjectWidget from '~/components/ProjectWidget.vue'
import { computed } from 'vue'

const config = useRuntimeConfig()
const { createFoligoClient } = await import('~/lib/foligoClient.js')
const foligo = createFoligoClient({
  foligoBaseUrl: config.public.foligoBaseUrl,
  foligoProjectId: config.public.foligoProjectId,
  foligoSubdomain: config.public.foligoSubdomain
})

const { data, pending, error } = await useAsyncData(
  'projects', 
  () => foligo.getProjects()
)

// Transform projects to include path and ensure compatibility with ProjectWidget
const projects = computed(() => {
  if (!data.value) return []
  return data.value.map(project => ({
    ...project,
    path: `/project/${project.slug || project.id}`,
    icon: project.featuredImage || project.featured_image || project.icon || project.image || '/favicon.ico',
    excerpt: project.excerpt || project.description || '',
    content: project.content || project.body || project.markdown || ''
  }))
})
</script>
