<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-extrabold mb-6">Search</h1>

    <!-- Search and Filter Section -->
    <div class="mb-8 space-y-4">
      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects and blog posts..."
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="handleSearch"
        />
        <svg class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Active Filters -->
      <div v-if="selectedSkills.length > 0" class="flex flex-wrap gap-2 items-center">
        <span class="text-sm text-gray-400">Filters:</span>
        <span
          v-for="skill in selectedSkills"
          :key="skill"
          class="px-3 py-1.5 text-sm rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-2"
        >
          {{ skill }}
          <button
            @click="removeSkillFilter(skill)"
            class="hover:text-blue-100 transition-colors"
            aria-label="Remove filter"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <button
          @click="clearFilters"
          class="text-sm text-gray-400 hover:text-gray-300 underline"
        >
          Clear all
        </button>
      </div>

      <!-- Content Type Filter -->
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="showProjects"
            type="checkbox"
            class="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500"
          />
          <span class="text-sm text-gray-300">Projects</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="showBlogs"
            type="checkbox"
            class="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500"
          />
          <span class="text-sm text-gray-300">Blog Posts</span>
        </label>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div>
      <p class="text-gray-400 mt-4">Loading...</p>
    </div>

    <!-- Results -->
    <div v-else>
      <!-- Projects Results -->
      <div v-if="showProjects && filteredProjects.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold mb-6">Projects ({{ filteredProjects.length }})</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProjectWidget
            v-for="project in filteredProjects"
            :key="project.id || project.slug"
            :project="project"
            :view="'card'"
          />
        </div>
      </div>

      <!-- Blog Results -->
      <div v-if="showBlogs && filteredBlogs.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold mb-6">Blog Posts ({{ filteredBlogs.length }})</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="post in filteredBlogs"
            :key="post.id || post._id"
            :to="`/blog/${post.slug || post.id || post._id}`"
            class="group bg-white/5 hover:bg-white/10 transition rounded-xl p-5 block flex flex-col"
          >
            <h3 class="text-xl font-bold group-hover:underline mb-2">{{ post.title || post.name || 'Untitled Post' }}</h3>
            <p class="text-sm text-gray-300 mb-3 flex-1">{{ excerpt(post) }}</p>
            
            <!-- Tags -->
            <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="tag in (Array.isArray(post.tags) ? post.tags.slice(0, 3) : [post.tags])"
                :key="typeof tag === 'object' ? tag.id : tag"
                class="px-2 py-0.5 text-xs rounded-full bg-white/10 text-gray-300"
              >
                #{{ typeof tag === 'object' ? tag.name : tag }}
              </span>
            </div>
            
            <!-- Skills -->
            <div v-if="post.linkedSkills && post.linkedSkills.length" class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="skill in post.linkedSkills.slice(0, 2)"
                :key="skill.id || skill"
                class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {{ typeof skill === 'object' ? skill.name : skill }}
              </span>
            </div>
            
            <p class="text-xs text-gray-400 mt-auto">{{ formatDate(post.createdAt || post.date) }}</p>
          </NuxtLink>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredProjects.length === 0 && filteredBlogs.length === 0" class="text-center py-12 text-gray-400">
        <p>No results found.</p>
        <p class="text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import ProjectWidget from '~/components/ProjectWidget.vue'

const route = useRoute()
const router = useRouter()

const config = useRuntimeConfig()
const { createFoligoClient } = await import('~/lib/foligoClient.js')
const foligo = createFoligoClient({
  foligoBaseUrl: config.public.foligoBaseUrl,
  foligoProjectId: config.public.foligoProjectId,
  foligoSubdomain: config.public.foligoSubdomain
})

// Fetch data
const { data: projectsData, pending: projectsPending } = await useAsyncData(
  'search-projects',
  () => foligo.getProjects(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

const { data: blogsData, pending: blogsPending } = await useAsyncData(
  'search-blogs',
  () => foligo.getBlogs(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

const pending = computed(() => projectsPending.value || blogsPending.value)

// State
const searchQuery = ref('')
const selectedSkills = ref([])
const showProjects = ref(true)
const showBlogs = ref(true)

// Initialize from URL query params
onMounted(() => {
  const skillParam = route.query.skill
  if (skillParam) {
    selectedSkills.value = Array.isArray(skillParam) ? skillParam : [skillParam]
  }
  
  const queryParam = route.query.q
  if (queryParam) {
    searchQuery.value = queryParam
  }
})

// Filter projects
const filteredProjects = computed(() => {
  if (!projectsData.value) return []
  
  let filtered = projectsData.value.map(project => ({
    ...project,
    path: `/project/${project.slug || project.id}`,
    icon: project.featuredImage || project.featured_image || project.icon || project.image || '/favicon.ico',
    excerpt: project.excerpt || project.description || '',
    content: project.content || project.body || project.markdown || ''
  }))
  
  // Filter by skills
  if (selectedSkills.value.length > 0) {
    filtered = filtered.filter(project => {
      if (!project.linkedSkills || !Array.isArray(project.linkedSkills)) return false
      
      const projectSkills = project.linkedSkills.map(skill => {
        const skillName = typeof skill === 'object' ? skill.name : skill
        return skillName.toString().toLowerCase()
      })
      
      return selectedSkills.value.some(selectedSkill => {
        const selected = selectedSkill.toString().toLowerCase()
        return projectSkills.some(ps => ps.includes(selected) || selected.includes(ps))
      })
    })
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(project => {
      const title = (project.title || project.name || '').toLowerCase()
      const excerpt = (project.excerpt || project.description || '').toLowerCase()
      const content = (project.content || project.body || project.markdown || '').toLowerCase()
      
      return title.includes(query) || excerpt.includes(query) || content.includes(query)
    })
  }
  
  return filtered
})

// Filter blogs
const filteredBlogs = computed(() => {
  if (!blogsData.value) return []
  
  let filtered = [...blogsData.value]
  
  // Filter by skills
  if (selectedSkills.value.length > 0) {
    filtered = filtered.filter(blog => {
      if (!blog.linkedSkills || !Array.isArray(blog.linkedSkills)) return false
      
      const blogSkills = blog.linkedSkills.map(skill => {
        const skillName = typeof skill === 'object' ? skill.name : skill
        return skillName.toString().toLowerCase()
      })
      
      return selectedSkills.value.some(selectedSkill => {
        const selected = selectedSkill.toString().toLowerCase()
        return blogSkills.some(bs => bs.includes(selected) || selected.includes(bs))
      })
    })
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(blog => {
      const title = (blog.title || blog.name || '').toLowerCase()
      const excerpt = excerptText(blog).toLowerCase()
      const content = (blog.content || blog.body || blog.markdown || '').toLowerCase()
      
      return title.includes(query) || excerpt.includes(query) || content.includes(query)
    })
  }
  
  return filtered
})

// Helper functions
const excerpt = (post) => {
  if (post.excerpt || post.description) return (post.excerpt || post.description)
  const raw = post.content || post.body || post.markdown || ''
  const text = raw
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
  return text.length > 180 ? text.slice(0, 177) + '…' : text
}

const excerptText = excerpt

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return ''
  }
}

const handleSearch = () => {
  updateURL()
}

const removeSkillFilter = (skill) => {
  selectedSkills.value = selectedSkills.value.filter(s => s !== skill)
  updateURL()
}

const clearFilters = () => {
  selectedSkills.value = []
  searchQuery.value = ''
  updateURL()
}

const updateURL = () => {
  const query = {}
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value
  }
  if (selectedSkills.value.length > 0) {
    query.skill = selectedSkills.value
  }
  
  router.replace({ query })
}

// Watch for URL changes
watch(() => route.query, (newQuery) => {
  if (newQuery.skill) {
    selectedSkills.value = Array.isArray(newQuery.skill) ? newQuery.skill : [newQuery.skill]
  } else {
    selectedSkills.value = []
  }
  
  if (newQuery.q) {
    searchQuery.value = newQuery.q
  } else {
    searchQuery.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
</style>

