<template>
  <button
    @click="$emit('skip')"
    class="fixed right-0 z-40 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 border-r-0 rounded-l-lg p-3 transition-all duration-300 shadow-lg"
    :style="{ top: `calc(${headerHeight} + 3rem)` }"
    aria-label="Skip animation"
  >
    <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  </button>
</template>

<script setup>
defineProps({
  headerHeight: {
    type: String,
    default: '67px'
  }
})

defineEmits(['skip'])
</script>

<style scoped>
</style>

