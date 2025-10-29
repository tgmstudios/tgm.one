<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" v-if="post">
    <div class="mb-6">
      <router-link to="/blogs" class="text-sm text-gray-300 hover:underline">← Back to blog</router-link>
    </div>

    <h1 class="text-3xl font-extrabold">{{ post.title || post.name || 'Untitled Post' }}</h1>
    <p v-if="post.createdAt || post.date || post.author" class="text-sm text-gray-400 mt-2">
      <span v-if="post.createdAt || post.date">{{ formatDate(post.createdAt || post.date) }}</span>
      <span v-if="post.author"> · {{ post.author }}</span>
    </p>

    <div v-if="post.excerpt || post.description" class="mt-4 text-gray-300">{{ post.excerpt || post.description }}</div>

    <article class="prose prose-invert max-w-none mt-8" v-html="rendered"></article>
  </div>
</template>

<script setup>
import MarkdownIt from 'markdown-it'

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

// Add classes to images for consistent styling
const imageRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.image = function(tokens, idx, options, env, self) {
  const token = tokens[idx]
  token.attrJoin('class', 'rounded-lg shadow-sm')
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


