<template>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" v-if="post">
    <nav class="mb-6" aria-label="Breadcrumb">
      <NuxtLink to="/blogs" class="text-sm text-gray-300 hover:underline">← Back to blog</NuxtLink>
    </nav>

    <header>
      <h1 class="text-3xl font-extrabold">{{ post.title || post.name || 'Untitled Post' }}</h1>
      <p v-if="post.createdAt || post.date || post.author" class="text-sm text-gray-400 mt-2">
        <time v-if="post.createdAt || post.date" :datetime="post.createdAt || post.date">{{ formatDate(post.createdAt || post.date) }}</time>
        <span v-if="post.author"> · <span>{{ post.author }}</span></span>
      </p>

      <div v-if="post.excerpt || post.description" class="mt-4 text-gray-300">{{ post.excerpt || post.description }}</div>
    </header>

    <div class="prose prose-invert max-w-none mt-8" v-html="rendered" ref="contentRef"></div>
  </article>
</template>

<script setup>
import MarkdownIt from 'markdown-it'
import { computed, watchEffect, onMounted, nextTick, ref } from 'vue'
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

const post = computed(() => data.value || null)

// If post not found, throw 404
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })
}

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

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    const safeLang = (lang || '').toLowerCase()
    
    // Handle mermaid diagrams - return as a pre with mermaid class (no code wrapper)
    if (safeLang === 'mermaid') {
      // Escape HTML entities in the mermaid code to prevent issues
      const esc = (s) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<pre class="mermaid">${esc(str)}</pre>`
    }
    
    // Preserve code blocks with language class for client-side highlighters if present
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
  // Always process through markdown to handle mermaid diagrams and other custom rendering
  const raw = post.value.content || post.value.body || post.value.markdown || ''
  if (!raw && post.value.html) {
    // Only use pre-rendered HTML as fallback if no markdown content exists
    return post.value.html
  }
  return md.render(raw)
})

const contentRef = ref(null)

onMounted(async () => {
  if (process.client && contentRef.value && window.mermaid) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const mermaidElements = contentRef.value.querySelectorAll('pre.mermaid:not([data-processed])')
    
    mermaidElements.forEach(async (el) => {
      const code = el.textContent || el.innerText || ''
      if (code.trim()) {
        el.setAttribute('data-processed', 'true')
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        el.id = id
        
        try {
          const { svg } = await window.mermaid.render(id, code.trim())
          el.innerHTML = svg
        } catch (error) {
          console.error('Error rendering mermaid:', error)
          el.innerHTML = `<div style="color: #ef4444; padding: 1rem;">Error rendering diagram: ${error.message}</div>`
        }
      }
    })
  }
})

const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString() } catch { return '' }
}
</script>

<style scoped>
/* Mermaid diagram styling for dark mode */
:deep(pre.mermaid) {
  @apply my-8 rounded-lg overflow-x-auto;
  padding: 2rem;
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
}

:deep(pre.mermaid svg) {
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

/* Improve text readability in mermaid diagrams */
:deep(pre.mermaid svg text) {
  fill: #F9FAFB !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
}

/* Style mermaid nodes and shapes */
:deep(pre.mermaid svg .node rect),
:deep(pre.mermaid svg .node circle),
:deep(pre.mermaid svg .node ellipse),
:deep(pre.mermaid svg .node polygon) {
  stroke: #3B82F6 !important;
  stroke-width: 2px !important;
}

/* Style mermaid edges/arrows */
:deep(pre.mermaid svg .edgePath path),
:deep(pre.mermaid svg .edgePath .path) {
  stroke: #60A5FA !important;
  stroke-width: 2px !important;
}

:deep(pre.mermaid svg marker) {
  fill: #60A5FA !important;
}

/* Ensure proper contrast for labels */
:deep(pre.mermaid svg .label text) {
  fill: #F9FAFB !important;
}

/* Style sequence diagram actors */
:deep(pre.mermaid svg .actor) {
  fill: #1F2937 !important;
  stroke: #3B82F6 !important;
}

/* Style gantt charts */
:deep(pre.mermaid svg .section0),
:deep(pre.mermaid svg .section1),
:deep(pre.mermaid svg .section2),
:deep(pre.mermaid svg .section3) {
  fill: #1F2937 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(pre.mermaid) {
    padding: 1rem;
    margin: 1.5rem 0;
  }
}
</style>


