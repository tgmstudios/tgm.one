<template>
  <div ref="contentContainer" class="prose prose-invert max-w-none">
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
import { computed, ref, onMounted, nextTick, watch } from 'vue'
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

const contentContainer = ref(null)
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

const addCopyButtonsToCodeBlocks = () => {
  if (!contentContainer.value) return
  
  const codeBlocks = contentContainer.value.querySelectorAll('pre code')
  codeBlocks.forEach((codeElement, index) => {
    const preElement = codeElement.parentElement
    if (!preElement) return
    
    // Skip if copy button already exists
    if (preElement.querySelector('.copy-code-button')) return
    
    // Create copy button
    const copyButton = document.createElement('button')
    copyButton.className = 'copy-code-button'
    copyButton.setAttribute('aria-label', 'Copy code')
    copyButton.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <span class="copy-text">Copy</span>
    `
    
    // Get the code text (handle both textContent and innerHTML)
    const getCodeText = () => {
      // Try to get text directly
      let text = codeElement.textContent || codeElement.innerText
      if (!text) {
        // Fallback: decode HTML entities
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = codeElement.innerHTML
        text = tempDiv.textContent || tempDiv.innerText
      }
      return text || ''
    }
    
    // Copy functionality
    copyButton.addEventListener('click', async () => {
      const codeText = getCodeText()
      try {
        await navigator.clipboard.writeText(codeText)
        copyButton.classList.add('copied')
        const span = copyButton.querySelector('.copy-text')
        if (span) span.textContent = 'Copied!'
        setTimeout(() => {
          copyButton.classList.remove('copied')
          if (span) span.textContent = 'Copy'
        }, 2000)
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = codeText
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          copyButton.classList.add('copied')
          const span = copyButton.querySelector('.copy-text')
          if (span) span.textContent = 'Copied!'
          setTimeout(() => {
            copyButton.classList.remove('copied')
            if (span) span.textContent = 'Copy'
          }, 2000)
        } catch (e) {
          console.error('Failed to copy:', e)
        }
        document.body.removeChild(textArea)
      }
    })
    
    // Make pre element relative for absolute positioning
    preElement.style.position = 'relative'
    preElement.appendChild(copyButton)
  })
}

// Watch for content changes and add copy buttons
watch(renderedSegments, () => {
  nextTick(() => {
    setTimeout(() => {
      addCopyButtonsToCodeBlocks()
    }, 100)
  })
}, { immediate: false })

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      addCopyButtonsToCodeBlocks()
    }, 100)
  })
})
</script>

<style scoped>
:deep(.content-fragment > :first-child) {
  margin-top: 0;
}

/* Code block styling with line breaking */
:deep(pre) {
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  overflow-y: hidden;
}

:deep(pre code) {
  white-space: pre-wrap;
  word-wrap: break-word;
  display: block;
  overflow-x: auto;
}

/* Copy button styling */
:deep(.copy-code-button) {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgba(31, 41, 55, 0.9);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.375rem;
  color: rgb(209, 213, 219);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  backdrop-filter: blur(8px);
}

:deep(.copy-code-button:hover) {
  background: rgba(55, 65, 81, 0.95);
  border-color: rgba(96, 165, 250, 0.5);
  color: rgb(147, 197, 253);
}

:deep(.copy-code-button.copied) {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
  color: rgb(74, 222, 128);
}

:deep(.copy-code-button svg) {
  flex-shrink: 0;
}

:deep(.copy-code-button .copy-text) {
  white-space: nowrap;
}

/* Ensure code blocks have proper spacing and line breaking */
:deep(pre) {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 0.5rem;
}

:deep(pre code) {
  padding: 0;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  line-height: 1.6;
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
  
  :deep(.copy-code-button) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.625rem;
  }
  
  :deep(.copy-code-button .copy-text) {
    display: none;
  }
}
</style>

