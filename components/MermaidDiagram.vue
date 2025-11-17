<template>
  <div class="mermaid-container">
    <div
      v-if="isLoading"
      class="mermaid-loading-state"
    >
      <div class="mermaid-spinner"></div>
      <span>Rendering diagram...</span>
    </div>

    <div
      v-else-if="hasError"
      class="mermaid-error-state"
    >
      <p class="mermaid-error-title">Error rendering diagram</p>
      <pre class="mermaid-error-message">{{ errorMessage }}</pre>
      <details class="mermaid-error-details">
        <summary>Show diagram code</summary>
        <pre class="mermaid-error-code">{{ code }}</pre>
      </details>
    </div>

    <div
      ref="diagramRef"
      class="mermaid-diagram"
      :class="{ 'mermaid-diagram-hidden': isLoading || hasError }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  id: {
    type: String,
    default: () => `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
})

const diagramRef = ref(null)
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
let rendered = false

const ensureMermaid = async () => {
  if (typeof window === 'undefined') return null
  if (!window.mermaid) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return window.mermaid || null
}

const renderDiagram = async () => {
  if (rendered || !process.client) return

  try {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''

    const mermaid = await ensureMermaid()
    if (!mermaid) {
      throw new Error('Mermaid is not available. Make sure the mermaid plugin is loaded.')
    }

    if (!mermaid.initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark'
      })
      mermaid.initialized = true
    }

    const cleanCode = props.code.trim()
    if (!cleanCode) {
      throw new Error('Empty mermaid diagram code')
    }

    await nextTick()
    if (!diagramRef.value) {
      throw new Error('Diagram container not found')
    }

    const { svg } = await mermaid.render(props.id, cleanCode)
    diagramRef.value.innerHTML = svg

    rendered = true
    isLoading.value = false
  } catch (error) {
    console.error('Error rendering mermaid diagram:', error)
    hasError.value = true
    errorMessage.value = error.message || 'Unknown error occurred'
    isLoading.value = false
  }
}

onMounted(async () => {
  if (process.client) {
    await new Promise(resolve => setTimeout(resolve, 50))
    await renderDiagram()
  }
})

watch(() => props.code, async () => {
  if (process.client) {
    rendered = false
    hasError.value = false
    errorMessage.value = ''
    if (diagramRef.value) {
      diagramRef.value.innerHTML = ''
    }
    await renderDiagram()
  }
})
</script>

<style scoped>
.mermaid-container {
  @apply my-8 rounded-lg overflow-x-auto relative;
  min-height: 100px;
  background: transparent;
  padding: 1.5rem;
}

.mermaid-diagram {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mermaid-diagram-hidden {
  display: none;
}

.mermaid-diagram :deep(svg) {
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

.mermaid-loading-state {
  @apply flex flex-col items-center justify-center gap-3 text-gray-400;
  min-height: 100px;
}

.mermaid-spinner {
  @apply border-4 border-gray-700 border-t-blue-500 rounded-full;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mermaid-error-state {
  @apply p-4 rounded-lg bg-red-950/20 border border-red-800/50;
  width: 100%;
}

.mermaid-error-title {
  @apply text-red-400 font-semibold mb-2;
}

.mermaid-error-message {
  @apply text-red-300 text-sm mb-3 whitespace-pre-wrap;
  font-family: monospace;
}

.mermaid-error-details {
  @apply mt-3;
}

.mermaid-error-details summary {
  @apply text-red-400 text-sm cursor-pointer hover:text-red-300;
  user-select: none;
}

.mermaid-error-code {
  @apply mt-2 p-3 bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

