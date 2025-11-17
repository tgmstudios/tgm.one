<template>
  <div ref="containerRef" class="mermaid-container" :class="{ 'mermaid-loading': isLoading, 'mermaid-error': hasError }">
    <div v-if="isLoading" class="mermaid-loading-state">
      <div class="mermaid-spinner"></div>
      <span>Rendering diagram...</span>
    </div>
    <div v-else-if="hasError" class="mermaid-error-state">
      <p class="mermaid-error-title">Error rendering diagram</p>
      <pre class="mermaid-error-message">{{ errorMessage }}</pre>
      <details class="mermaid-error-details">
        <summary>Show diagram code</summary>
        <pre class="mermaid-error-code">{{ code }}</pre>
      </details>
    </div>
    <div v-else ref="diagramRef" class="mermaid-diagram"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

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

const containerRef = ref(null)
const diagramRef = ref(null)
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
let rendered = false

const renderDiagram = async () => {
  if (rendered || !process.client) return
  
  try {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    
    // Wait for mermaid to be available
    if (typeof window === 'undefined' || !window.mermaid) {
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100))
      if (!window.mermaid) {
        throw new Error('Mermaid is not available. Make sure the mermaid plugin is loaded.')
      }
    }
    
    const mermaid = window.mermaid
    
    // Mermaid should already be initialized by the plugin
    // Just ensure it's available
    if (!mermaid.initialized) {
      console.warn('Mermaid not initialized by plugin, initializing now...')
      // Fallback initialization (shouldn't be needed if plugin loads correctly)
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark'
      })
      mermaid.initialized = true
    }
    
    // Clean the code
    const cleanCode = props.code.trim()
    
    if (!cleanCode) {
      throw new Error('Empty mermaid diagram code')
    }
    
    // Wait for DOM to be ready
    await nextTick()
    
    if (!diagramRef.value) {
      throw new Error('Diagram container not found')
    }
    
    // Render the diagram
    const { svg } = await mermaid.render(props.id, cleanCode)
    
    // Insert the SVG
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
    // Small delay to ensure mermaid plugin is loaded
    await new Promise(resolve => setTimeout(resolve, 50))
    await renderDiagram()
  }
})

watch(() => props.code, async () => {
  if (process.client) {
    rendered = false
    if (diagramRef.value) {
      diagramRef.value.innerHTML = ''
    }
    await renderDiagram()
  }
})
</script>

<style scoped>
.mermaid-container {
  @apply my-8 rounded-lg overflow-x-auto;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  padding: 1.5rem;
}

.mermaid-diagram {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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

