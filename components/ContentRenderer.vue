<template>
  <div class="prose prose-invert max-w-none" v-html="rendered" ref="contentRef"></div>
</template>

<script setup>
import { computed, nextTick, ref, watchEffect } from 'vue'
import { useMarkdownRenderer } from '~/composables/useMarkdownRenderer.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  html: {
    type: String,
    default: ''
  }
})

const { render, renderMermaid } = useMarkdownRenderer()
const contentRef = ref(null)

// Render markdown (same on server and client, mermaid processed client-side only)
const rendered = computed(() => {
  const side = process.client ? 'CLIENT' : 'SERVER'
  console.log(`[${side}] ContentRenderer props:`, {
    hasContent: !!props.content,
    hasHtml: !!props.html,
    contentLength: props.content?.length || 0,
    htmlLength: props.html?.length || 0
  })
  
  // Always prefer rendering from markdown content to avoid SSR/client mismatches
  // Only use pre-rendered HTML if no content is available
  if (props.content) {
    const result = render(props.content)
    console.log(`[${side}] Rendered from markdown, length:`, result.length, 'has mermaid:', result.includes('class="mermaid"'))
    if (result.includes('class="mermaid"')) {
      const match = result.match(/<pre class="mermaid"[^>]*>([\s\S]*?)<\/pre>/)
      if (match) {
        console.log(`[${side}] Mermaid content sample:`, match[0].substring(0, 300))
      }
    }
    return result
  }
  if (props.html) {
    console.log(`[${side}] Using pre-rendered HTML`)
    return props.html
  }
  return ''
})

// Single source of truth for mermaid processing
let isProcessing = false

const processMermaid = async () => {
  if (!process.client || !contentRef.value) return
  
  // Prevent concurrent processing
  if (isProcessing) return
  
  isProcessing = true
  
  try {
    console.log('[CLIENT] processMermaid starting')
    
    // Wait for DOM to be ready
    await nextTick()
    
    const allMermaid = contentRef.value.querySelectorAll('pre.mermaid')
    const unprocessed = contentRef.value.querySelectorAll('pre.mermaid:not([data-processed])')
    console.log(`[CLIENT] Mermaid elements - total: ${allMermaid.length}, unprocessed: ${unprocessed.length}`)
    
    if (allMermaid.length > 0) {
      const first = allMermaid[0]
      console.log('[CLIENT] First mermaid element:', {
        hasDataAttr: !!first.getAttribute('data-mermaid-code'),
        dataAttrSample: first.getAttribute('data-mermaid-code')?.substring(0, 100),
        textContentSample: first.textContent?.substring(0, 100),
        hasProcessed: !!first.getAttribute('data-processed'),
        hasSVG: !!first.querySelector('svg')
      })
    }
    
    // Process any unprocessed mermaid elements
    await renderMermaid(contentRef)
  } finally {
    isProcessing = false
  }
}

// Use watchEffect with flush:'post' as the primary mechanism
// This automatically tracks rendered.value and contentRef.value as dependencies
watchEffect(async () => {
  // Track dependencies: rendered content and contentRef
  const currentRendered = rendered.value
  const hasRef = contentRef.value
  
  if (process.client && hasRef && currentRendered) {
    await processMermaid()
  }
}, { flush: 'post' })
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

