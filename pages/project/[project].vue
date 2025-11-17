<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div v-if="pending" class="text-gray-400">Loading project…</div>
    <div v-else-if="error || !projectobj" class="text-red-400">Project not found.</div>
    
    <div v-else>
      <div class="mb-6">
        <NuxtLink to="/projects" class="text-sm text-gray-300 hover:underline">← Back to projects</NuxtLink>
      </div>

      <!-- Featured Image -->
      <div v-if="projectobj.featuredImage || projectobj.image" class="mb-6">
        <img 
          :src="projectobj.featuredImage || projectobj.image" 
          :alt="`${projectobj.title} featured image`" 
          class="w-full rounded-xl object-cover shadow-lg"
          style="max-height: 400px;"
        />
      </div>

      <header class="mb-6">
        <div class="flex items-start gap-4 mb-4">
          <img 
            v-if="projectobj.icon && !projectobj.featuredImage" 
            :src="projectobj.icon" 
            :alt="`${projectobj.title} project icon`" 
            class="h-14 w-14 rounded-md object-contain bg-white/10"
          >
          <div class="flex-1">
            <h1 class="text-3xl font-extrabold">{{ projectobj.title || projectobj.name }}</h1>
            <p v-if="projectobj.excerpt || projectobj.description" class="text-gray-300 mt-2">
              {{ projectobj.excerpt || projectobj.description }}
            </p>
          </div>
        </div>

        <!-- Project Dates -->
        <div v-if="projectobj.startDate || projectobj.endDate || projectobj.date || projectobj.createdAt" class="text-sm text-gray-400 mb-4">
          <time v-if="projectobj.startDate && projectobj.endDate && !projectobj.isOngoing" :datetime="projectobj.startDate">
            {{ formatDate(projectobj.startDate) }} – {{ formatDate(projectobj.endDate) }}
          </time>
          <time v-else-if="projectobj.startDate" :datetime="projectobj.startDate">
            {{ formatDate(projectobj.startDate) }} – {{ projectobj.isOngoing ? 'Present' : 'Present' }}
          </time>
          <time v-else-if="projectobj.date || projectobj.createdAt" :datetime="projectobj.date || projectobj.createdAt">
            {{ formatDate(projectobj.date || projectobj.createdAt) }}
          </time>
        </div>

        <!-- Contributors -->
        <div v-if="projectobj.contributors && projectobj.contributors.length" class="text-sm text-gray-400 mb-4">
          <span class="font-semibold">Contributors: </span>
          <span>{{ projectobj.contributors.join(', ') }}</span>
        </div>

        <!-- Tags -->
        <nav v-if="projectobj.tags && projectobj.tags.length" aria-label="Project tags" class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="tag in (Array.isArray(projectobj.tags) ? projectobj.tags : [projectobj.tags])" 
            :key="typeof tag === 'object' ? tag.id : tag" 
            class="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-200"
          >
            #{{ typeof tag === 'object' ? tag.name : tag }}
          </span>
        </nav>

        <!-- Linked Skills -->
        <nav v-if="projectobj.linkedSkills && projectobj.linkedSkills.length" aria-label="Project skills" class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="skill in projectobj.linkedSkills" 
            :key="skill.id || skill" 
            class="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
          >
            {{ typeof skill === 'object' ? skill.name : skill }}
          </span>
        </nav>

        <!-- Project Links (GitHub, Devpost, Other) -->
        <div v-if="projectLinks.length" class="flex flex-wrap gap-3 mt-4">
          <a 
            v-for="link in projectLinks" 
            :key="link.url"
            :href="link.url" 
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-200"
          >
            <span>{{ link.label }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      <article class="mt-8">
        <ContentRenderer 
          :content="projectobj.content || projectobj.body || projectobj.markdown || ''"
          :html="projectobj.html"
        />
      </article>

      <aside v-if="relatedProjects.length" class="mt-12" aria-label="Related projects">
        <h2 class="text-xl font-semibold mb-4">Related projects</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectWidget 
            v-for="(proj, idx) in relatedProjects" 
            :key="idx" 
            :project="proj"
            :view="'card'"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import ProjectWidget from '~/components/ProjectWidget.vue'
import ContentRenderer from '~/components/ContentRenderer.vue'
import { computed, watchEffect } from 'vue'
import { useHead } from '#imports'

const route = useRoute()
const config = useRuntimeConfig()
const { createFoligoClient } = await import('~/lib/foligoClient.js')
const foligo = createFoligoClient({
  foligoBaseUrl: config.public.foligoBaseUrl,
  foligoProjectId: config.public.foligoProjectId,
  foligoSubdomain: config.public.foligoSubdomain
})

const { data, pending, error } = await useAsyncData(
  `project-${route.params.project}`,
  () => foligo.getProjectBySlug(route.params.project)
)

// Transform project to ensure compatibility
const projectobj = computed(() => {
  if (!data.value) return null
  return {
    ...data.value,
    icon: data.value.icon || data.value.image || '/favicon.ico',
    featuredImage: data.value.featuredImage || data.value.featured_image || null,
    excerpt: data.value.excerpt || data.value.description || '',
    content: data.value.content || data.value.body || data.value.markdown || '',
    title: data.value.title || data.value.name || 'Untitled Project',
    tags: data.value.tags || [],
    linkedSkills: data.value.linkedSkills || [],
    projectLinks: data.value.projectLinks || {},
    contributors: data.value.contributors || [],
    startDate: data.value.startDate || data.value.start_date || null,
    endDate: data.value.endDate || data.value.end_date || null,
    isOngoing: data.value.isOngoing || false,
    date: data.value.date || data.value.createdAt || null,
    contentLinks: data.value.contentLinks || []
  }
})

// Transform projectLinks object into array for display
const projectLinks = computed(() => {
  if (!projectobj.value || !projectobj.value.projectLinks) return []
  const links = []
  const pl = projectobj.value.projectLinks
  
  if (pl.github) {
    links.push({ url: pl.github, label: 'GitHub' })
  }
  if (pl.devpost) {
    links.push({ url: pl.devpost, label: 'Devpost' })
  }
  if (pl.other && Array.isArray(pl.other)) {
    pl.other.forEach(link => {
      links.push({
        url: typeof link === 'string' ? link : link.url,
        label: typeof link === 'string' ? 'View' : (link.label || link.text || 'View')
      })
    })
  }
  
  return links
})

const formatDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// If project not found, throw 404
if (!pending.value && !projectobj.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

// Fetch all projects for related projects (lazy, client-side only)
const { data: allProjectsData } = await useAsyncData(
  'all-projects', 
  () => foligo.getProjects(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

const relatedProjects = computed(() => {
  if (!projectobj.value || !allProjectsData.value || allProjectsData.value.length === 0) return []
  
  const currentProjectId = projectobj.value.id || projectobj.value._id || projectobj.value.contentId
  if (!currentProjectId) return []
  
  const relatedIds = new Set()
  
  // Use contentLinks if available (fastest path)
  if (projectobj.value.contentLinks && Array.isArray(projectobj.value.contentLinks)) {
    for (const link of projectobj.value.contentLinks) {
      if (link.sourceId === currentProjectId && link.targetType === 'PROJECT') {
        relatedIds.add(link.targetId)
      } else if (link.targetId === currentProjectId && link.sourceType === 'PROJECT') {
        relatedIds.add(link.sourceId)
      }
    }
  }
  
  // Also use legacy 'related' field if available
  if (projectobj.value.related) {
    const relatedSlugsOrIds = Array.isArray(projectobj.value.related) ? projectobj.value.related : []
    for (const relatedId of relatedSlugsOrIds) {
      const found = allProjectsData.value.find(p => {
        const pid = p.id || p._id || p.contentId
        const pslug = p.slug
        return pid === relatedId || pslug === relatedId
      })
      if (found) {
        const foundId = found.id || found._id || found.contentId
        if (foundId) relatedIds.add(foundId)
      }
    }
  }
  
  // If we already have enough, return early
  if (relatedIds.size >= 6) {
    return Array.from(relatedIds)
      .slice(0, 6)
      .map(id => allProjectsData.value.find(p => {
        const pid = p.id || p._id || p.contentId
        return pid === id
      }))
      .filter(Boolean)
      .map(project => ({
        ...project,
        path: `/project/${project.slug || project.id}`,
        icon: project.featuredImage || project.featured_image || project.icon || project.image || '/favicon.ico',
        excerpt: project.excerpt || project.description || '',
        content: project.content || project.body || project.markdown || ''
      }))
  }
  
  // Build tag/skill lookup sets once
  const currentTagIds = new Set((projectobj.value.tags || []).map(t => typeof t === 'object' ? t.id : t).filter(Boolean))
  const currentSkillIds = new Set((projectobj.value.linkedSkills || []).map(s => typeof s === 'object' ? s.id : s).filter(Boolean))
  
  // Only process if we have tags or skills to match
  if (currentTagIds.size > 0 || currentSkillIds.size > 0) {
    for (const project of allProjectsData.value) {
      const projectId = project.id || project._id || project.contentId
      if (!projectId || projectId === currentProjectId || relatedIds.has(projectId)) continue
      
      // Check for matching tags
      if (currentTagIds.size > 0 && project.tags) {
        for (const tag of project.tags) {
          const tagId = typeof tag === 'object' ? tag.id : tag
          if (tagId && currentTagIds.has(tagId)) {
            relatedIds.add(projectId)
            break
          }
        }
      }
      
      // Check for matching skills if not already added
      if (relatedIds.size < 6 && currentSkillIds.size > 0 && project.linkedSkills) {
        for (const skill of project.linkedSkills) {
          const skillId = typeof skill === 'object' ? skill.id : skill
          if (skillId && currentSkillIds.has(skillId)) {
            relatedIds.add(projectId)
            break
          }
        }
      }
      
      if (relatedIds.size >= 6) break
    }
  }
  
  // Convert to array and limit to 6 projects
  return Array.from(relatedIds)
    .slice(0, 6)
    .map(id => allProjectsData.value.find(p => {
      const pid = p.id || p._id || p.contentId
      return pid === id
    }))
    .filter(Boolean)
    .map(project => ({
      ...project,
      path: `/project/${project.slug || project.id}`,
      icon: project.featuredImage || project.featured_image || project.icon || project.image || '/favicon.ico',
      excerpt: project.excerpt || project.description || '',
      content: project.content || project.body || project.markdown || ''
    }))
})

// Update meta tags
watchEffect(() => {
  if (projectobj.value) {
    const siteUrl = 'https://tgm.one'
    const canonicalUrl = `${siteUrl}${route.path}`
    const pageTitle = `${projectobj.value.title} — TGM.One`
    const description = projectobj.value.excerpt || `Learn more about ${projectobj.value.title} project on TGM.One`
    const image = projectobj.value.featuredImage || projectobj.value.image ? 
      `${siteUrl}${projectobj.value.featuredImage || projectobj.value.image}` : 
      `${siteUrl}/favicon.ico`
    
    useHead({
      title: pageTitle,
      link: [
        {
          rel: 'canonical',
          href: canonicalUrl
        }
      ],
      meta: [
        {
          name: 'description',
          content: description
        },
        {
          property: 'og:title',
          content: pageTitle
        },
        {
          property: 'og:description',
          content: description
        },
        {
          property: 'og:url',
          content: canonicalUrl
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:image',
          content: image
        },
        {
          property: 'og:image:alt',
          content: projectobj.value.title
        },
        {
          name: 'twitter:title',
          content: pageTitle
        },
        {
          name: 'twitter:description',
          content: description
        },
        {
          name: 'twitter:image',
          content: image
        }
      ]
    })
  }
})
</script>
