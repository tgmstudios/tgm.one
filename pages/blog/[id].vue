<template>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" v-if="post">
    <nav class="mb-6" aria-label="Breadcrumb">
      <router-link to="/blogs" class="text-sm text-gray-300 hover:underline">← Back to blog</router-link>
    </nav>

    <header>
      <h1 class="text-3xl font-extrabold">{{ post.title || post.name || 'Untitled Post' }}</h1>
      <p v-if="post.createdAt || post.date || post.author" class="text-sm text-gray-400 mt-2">
        <time v-if="post.createdAt || post.date" :datetime="post.createdAt || post.date">{{ formatDate(post.createdAt || post.date) }}</time>
        <span v-if="post.author"> · <span>{{ post.author }}</span></span>
      </p>

      <div v-if="post.excerpt || post.description" class="mt-4 text-gray-300">{{ post.excerpt || post.description }}</div>
    </header>

    <div class="prose prose-invert max-w-none mt-8" v-html="rendered"></div>
  </article>
</template>

<script setup>
import MarkdownIt from 'markdown-it'
import { watchEffect } from 'vue'
import { useHead } from '#imports'

const route = useRoute()
const config = useRuntimeConfig()
const { createFoligoClient } = await import('~/lib/foligoClient.js')
const foligo = createFoligoClient({
  foligoBaseUrl: config.public.foligoBaseUrl,
  foligoProjectId: config.public.foligoProjectId
})

const { data } = await useAsyncData(
  () => foligo.getBlogById(route.params.id)
)

const post = computed(() => data.value || null)

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
  
  useHead({
    title: title ? `${title} — TGM.One` : 'Blog — TGM.One',
    meta: [
      {
        name: 'description',
        content: description || 'Read this blog post on TGM.One'
      }
    ]
  })
})

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    // Preserve code blocks with language class for client-side highlighters if present
    const safeLang = (lang || '').toLowerCase()
    const className = safeLang ? `language-${safeLang}` : ''
    const esc = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<pre class="${className}"><code class="${className}">${esc(str)}</code></pre>`
  }
})

// Add target/_blank and rel to external links
const defaultLinkRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
  const token = tokens[idx]
  const hrefIdx = token.attrIndex('href')
  const href = hrefIdx >= 0 ? token.attrs[hrefIdx][1] : ''
  const isExternal = /^https?:\/\//i.test(href)
  if (isExternal) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkRender(tokens, idx, options, env, self)
}

// Make headings linkable with ids
function slugify(text) {
  return (text || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
const headingOpen = md.renderer.rules.heading_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
  const next = tokens[idx + 1]
  if (next && next.type === 'inline') {
    const text = next.children?.filter(t => t.type === 'text' || t.type === 'code_inline').map(t => t.content).join(' ') || ''
    const id = slugify(text)
    if (id) {
      tokens[idx].attrSet('id', id)
    }
  }
  return headingOpen(tokens, idx, options, env, self)
}

// Add classes to images for consistent styling and ensure alt attributes
const imageRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.image = function(tokens, idx, options, env, self) {
  const token = tokens[idx]
  token.attrJoin('class', 'rounded-lg shadow-sm')
  // Ensure alt attribute exists (markdown-it usually handles this, but ensure it's present)
  const altIdx = token.attrIndex('alt')
  if (altIdx < 0 || !token.attrs[altIdx][1]) {
    token.attrSet('alt', 'Blog post image')
  }
  return imageRender(tokens, idx, options, env, self)
}
const rendered = computed(() => {
  if (!post.value) return ''
  const raw = post.value.content || post.value.body || post.value.markdown || ''
  // If HTML is provided by API, prefer it
  if (post.value.html) return post.value.html
  return md.render(raw)
})

const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString() } catch { return '' }
}
</script>

<style scoped>
</style>


