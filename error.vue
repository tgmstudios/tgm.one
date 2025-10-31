<template>
  <NuxtLayout>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <div class="mb-8">
      <h1 class="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
        404
      </h1>
      <h2 class="text-3xl font-bold mb-4">Page Not Found</h2>
      <p class="text-gray-300 text-lg mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
    </div>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <NuxtLink 
        to="/" 
        class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        Go to Home
      </NuxtLink>
      <NuxtLink 
        to="/projects" 
        class="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
      >
        View Projects
      </NuxtLink>
      <NuxtLink 
        to="/blogs" 
        class="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
      >
        Read Blog
      </NuxtLink>
    </div>
  </div>
  </NuxtLayout>
</template>

<script setup>
// Use the default layout (header/footer). No need to override layout.

const props = defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
})

// Set proper head for 404 page
useHead({
  title: '404 - Page Not Found — TGM.One',
  meta: [
    {
      name: 'description',
      content: 'The page you are looking for could not be found. Return to TGM.One to explore projects, blog posts, and more.'
    },
    {
      name: 'robots',
      content: 'noindex, follow'
    }
  ]
})
</script>

<style scoped>
</style>

