<template>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" v-if="post">
    <nav class="mb-6" aria-label="Breadcrumb">
      <NuxtLink to="/blogs" class="text-sm text-gray-300 hover:underline">← Back to blog</NuxtLink>
    </nav>

    <header class="mb-6">
      <h1 class="text-3xl font-extrabold">{{ post.title || post.name || 'Untitled Post' }}</h1>
      <p v-if="post.createdAt || post.date || post.author" class="text-sm text-gray-400 mt-2">
        <time v-if="post.createdAt || post.date" :datetime="post.createdAt || post.date">{{ formatDate(post.createdAt || post.date) }}</time>
        <span v-if="post.author"> · <span>{{ post.author }}</span></span>
      </p>

      <div v-if="post.excerpt || post.description" class="mt-4 text-gray-300">{{ post.excerpt || post.description }}</div>

      <!-- Tags -->
      <nav v-if="post.tags && post.tags.length" aria-label="Post tags" class="flex flex-wrap gap-2 mt-4">
        <span 
          v-for="tag in (Array.isArray(post.tags) ? post.tags : [post.tags])" 
          :key="typeof tag === 'object' ? tag.id : tag" 
          class="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-200"
        >
          #{{ typeof tag === 'object' ? tag.name : tag }}
        </span>
      </nav>

      <!-- Linked Skills -->
      <nav v-if="post.linkedSkills && post.linkedSkills.length" aria-label="Post skills" class="flex flex-wrap gap-2 mt-4">
        <span 
          v-for="skill in post.linkedSkills" 
          :key="skill.id || skill" 
          class="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
        >
          {{ typeof skill === 'object' ? skill.name : skill }}
        </span>
      </nav>
    </header>

    <ContentRenderer 
      :content="post.content || post.body || post.markdown || ''"
      :html="post.html"
    />

    <!-- Related Posts -->
    <aside v-if="relatedPosts.length" class="mt-12" aria-label="Related posts">
      <h2 class="text-xl font-semibold mb-4">Related posts</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink 
          v-for="relatedPost in relatedPosts" 
          :key="relatedPost.id || relatedPost.slug"
          :to="`/blog/${relatedPost.slug || relatedPost.id}`"
          class="group bg-white/5 hover:bg-white/10 transition rounded-xl p-5 block"
        >
          <h3 class="text-lg font-bold group-hover:underline mb-2">{{ relatedPost.title || relatedPost.name || 'Untitled Post' }}</h3>
          <p v-if="relatedPost.excerpt || relatedPost.description" class="text-sm text-gray-300 mb-2">
            {{ relatedPost.excerpt || relatedPost.description }}
          </p>
          <p v-if="relatedPost.createdAt || relatedPost.date" class="text-xs text-gray-400">
            {{ formatDate(relatedPost.createdAt || relatedPost.date) }}
          </p>
        </NuxtLink>
      </div>
    </aside>
  </article>
</template>

<script setup>
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

const { data } = await useAsyncData(
  `blog-${route.params.slug}`,
  () => foligo.getBlogBySlug(route.params.slug)
)

const post = computed(() => {
  if (!data.value) return null
  return {
    ...data.value,
    tags: data.value.tags || [],
    linkedSkills: data.value.linkedSkills || [],
    contentLinks: data.value.contentLinks || []
  }
})

// If post not found, throw 404
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })
}

// Fetch all blogs for related posts (lazy, client-side only)
const { data: allBlogsData } = await useAsyncData(
  'all-blogs', 
  () => foligo.getBlogs(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

// Find related posts using contentLinks or by matching tags/skills (memoized)
const relatedPosts = computed(() => {
  if (!post.value || !allBlogsData.value || allBlogsData.value.length === 0) return []
  
  const currentPostId = post.value.id || post.value._id || post.value.contentId
  if (!currentPostId) return []
  
  const relatedIds = new Set()
  
  // Use contentLinks if available (fastest path)
  if (post.value.contentLinks && Array.isArray(post.value.contentLinks)) {
    for (const link of post.value.contentLinks) {
      if (link.sourceId === currentPostId && link.targetType === 'BLOG') {
        relatedIds.add(link.targetId)
      } else if (link.targetId === currentPostId && link.sourceType === 'BLOG') {
        relatedIds.add(link.sourceId)
      }
    }
  }
  
  // If we already have enough from contentLinks, return early
  if (relatedIds.size >= 6) {
    return Array.from(relatedIds)
      .slice(0, 6)
      .map(id => allBlogsData.value.find(b => {
        const bid = b.id || b._id || b.contentId
        return bid === id
      }))
      .filter(Boolean)
      .map(blog => ({
        ...blog,
        slug: blog.slug || blog.id || blog._id
      }))
  }
  
  // Build tag/skill lookup sets once
  const currentTagIds = new Set((post.value.tags || []).map(t => typeof t === 'object' ? t.id : t).filter(Boolean))
  const currentSkillIds = new Set((post.value.linkedSkills || []).map(s => typeof s === 'object' ? s.id : s).filter(Boolean))
  
  // Only process if we have tags or skills to match
  if (currentTagIds.size > 0 || currentSkillIds.size > 0) {
    for (const blog of allBlogsData.value) {
      const blogId = blog.id || blog._id || blog.contentId
      if (!blogId || blogId === currentPostId || relatedIds.has(blogId)) continue
      
      // Check for matching tags
      if (currentTagIds.size > 0 && blog.tags) {
        for (const tag of blog.tags) {
          const tagId = typeof tag === 'object' ? tag.id : tag
          if (tagId && currentTagIds.has(tagId)) {
            relatedIds.add(blogId)
            break
          }
        }
      }
      
      // Check for matching skills if not already added
      if (relatedIds.size < 6 && currentSkillIds.size > 0 && blog.linkedSkills) {
        for (const skill of blog.linkedSkills) {
          const skillId = typeof skill === 'object' ? skill.id : skill
          if (skillId && currentSkillIds.has(skillId)) {
            relatedIds.add(blogId)
            break
          }
        }
      }
      
      if (relatedIds.size >= 6) break
    }
  }
  
  // Convert to array and limit to 6 posts
  return Array.from(relatedIds)
    .slice(0, 6)
    .map(id => allBlogsData.value.find(b => {
      const bid = b.id || b._id || b.contentId
      return bid === id
    }))
    .filter(Boolean)
    .map(blog => ({
      ...blog,
      slug: blog.slug || blog.id || blog._id
    }))
})

// Set a content-specific page title and meta description when the post data is available
watchEffect(() => {
  const title = post.value?.title || post.value?.name
  const description = post.value?.excerpt || post.value?.description || 
    (post.value?.content || post.value?.body || post.value?.markdown || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 160)
  
  const siteUrl = 'https://tgm.one'
  const canonicalUrl = `${siteUrl}${route.path}`
  const pageTitle = title ? `${title} — TGM.One` : 'Blog — TGM.One'
  
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
        content: description || 'Read this blog post on TGM.One'
      },
      {
        property: 'og:title',
        content: pageTitle
      },
      {
        property: 'og:description',
        content: description || 'Read this blog post on TGM.One'
      },
      {
        property: 'og:url',
        content: canonicalUrl
      },
      {
        property: 'og:type',
        content: 'article'
      },
      {
        name: 'twitter:title',
        content: pageTitle
      },
      {
        name: 'twitter:description',
        content: description || 'Read this blog post on TGM.One'
      }
    ]
  })
})


const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString() } catch { return '' }
}
</script>



