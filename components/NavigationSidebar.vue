<template>
  <div>
    <!-- Toggle Button (when sidebar is hidden) -->
    <button
      v-if="!isOpen"
      @click="toggleSidebar"
      class="fixed right-0 z-40 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 border-r-0 rounded-l-lg p-3 transition-all duration-300 shadow-lg"
      :style="{ top: `calc(${headerHeight} + 3rem)` }"
      aria-label="Toggle navigation sidebar"
    >
      <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed right-0 z-50 bg-gray-950/95 backdrop-blur-md border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
      :style="{ 
        width: '280px',
        top: headerHeight,
        height: `calc(100vh - ${headerHeight})`
      }"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-white/10">
        <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wide">Navigation</h2>
        <button
          @click="toggleSidebar"
          class="p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Close sidebar"
        >
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto h-[calc(100%-60px)] p-4">
        <nav v-if="items.length > 0" class="space-y-1">
          <button
            v-for="item in items"
            :key="item.id"
            @click="handleClick(item.id)"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              item.id === activeId
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            ]"
            :style="{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }"
          >
            {{ item.text }}
          </button>
        </nav>
        <div v-else class="text-sm text-gray-500 text-center py-8">
          No navigation available
        </div>
      </div>
    </aside>

    <!-- Overlay (when sidebar is open) -->
    <div
      v-if="isOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
      aria-hidden="true"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['navigate'])

const isOpen = ref(false)
const headerHeight = ref('67px')

// Calculate header height dynamically
const updateHeaderHeight = () => {
  if (typeof document === 'undefined') return
  
  const header = document.querySelector('header')
  if (header) {
    const height = header.offsetHeight
    headerHeight.value = `${height}px`
  }
}

let resizeObserver = null
let handleScroll = null

onMounted(() => {
  updateHeaderHeight()
  
  // Update on scroll (header changes size when scrolled)
  handleScroll = () => {
    updateHeaderHeight()
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateHeaderHeight)
  
  // Use ResizeObserver to watch header size changes
  const header = document.querySelector('header')
  if (header && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight()
    })
    resizeObserver.observe(header)
  }
})

onUnmounted(() => {
  if (handleScroll) {
    window.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('resize', updateHeaderHeight)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const handleClick = (id) => {
  emit('navigate', id)
  // Optionally close sidebar on mobile after navigation
  if (window.innerWidth < 768) {
    setTimeout(() => {
      isOpen.value = false
    }, 300)
  }
}

// Close sidebar on escape key
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isOpen.value) {
      isOpen.value = false
    }
  }
  window.addEventListener('keydown', handleEscape)
  
  return () => {
    window.removeEventListener('keydown', handleEscape)
  }
})

// Watch for route changes to close sidebar
const route = useRoute()
watch(() => route?.path, () => {
  isOpen.value = false
}, { immediate: false })
</script>

<style scoped>
/* Smooth scrolling */
nav button {
  word-break: break-word;
}
</style>

