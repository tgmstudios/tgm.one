<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-extrabold mb-6">Blog</h1>

    <div v-if="pending" class="text-gray-400">Loading posts…</div>
    <div v-else-if="error" class="text-red-400">Failed to load posts.</div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="post in posts" :key="post.id || post._id" :to="`/blog/${post.slug || post.id || post._id}`" class="group bg-white/5 hover:bg-white/10 transition rounded-xl p-5 block">
        <h2 class="text-xl font-bold group-hover:underline">{{ post.title || post.name || 'Untitled Post' }}</h2>
        <p class="text-sm text-gray-300 mt-2">{{ excerpt(post) }}</p>
        <p class="text-xs text-gray-400 mt-3">{{ formatDate(post.createdAt || post.date) }}</p>
      </NuxtLink>
    </div>
  </div>
  
</template>

<script setup>
const config = useRuntimeConfig()
const { createFoligoClient } = await import('~/lib/foligoClient.js')
const foligo = createFoligoClient({
  foligoBaseUrl: config.public.foligoBaseUrl,
  foligoProjectId: config.public.foligoProjectId
})

const { data, pending, error } = await useAsyncData('blogs', () => foligo.getBlogs())
const posts = computed(() => data.value || [])

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return ''
  }
}

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
</script>

<style scoped>
</style>


