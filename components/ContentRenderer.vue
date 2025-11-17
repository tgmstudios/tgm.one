<template>
  <div class="prose prose-invert max-w-none">
    <template v-for="segment in renderedSegments" :key="segment.key">
      <div
        v-if="segment.type === 'html'"
        class="content-fragment"
        v-html="segment.content"
      />
      <ClientOnly v-else>
        <MermaidDiagram :code="segment.code" :id="segment.id" />
        <template #fallback>
          <pre class="mermaid mermaid-fallback">{{ segment.code }}</pre>
        </template>
      </ClientOnly>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MermaidDiagram from '~/components/MermaidDiagram.vue'
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

const { renderContent, renderHtml } = useMarkdownRenderer()

const renderedSegments = computed(() => {
  if (props.content) {
    return renderContent(props.content).segments
  }
  if (props.html) {
    return renderHtml(props.html).segments
  }
  return []
})
</script>

<style scoped>
:deep(.content-fragment > :first-child) {
  margin-top: 0;
}

/* Mermaid fallback styling to keep SSR output readable */
:deep(pre.mermaid),
:deep(.mermaid-fallback) {
  @apply my-8 rounded-lg overflow-x-auto;
  padding: 2rem;
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
}

@media (max-width: 768px) {
  :deep(pre.mermaid),
  :deep(.mermaid-fallback) {
    padding: 1rem;
    margin: 1.5rem 0;
  }
}
</style>

