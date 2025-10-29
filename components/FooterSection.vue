<template>
  <footer class="mt-16 border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="flex items-center gap-3">
          <NuxtLink :to="'/'" class="shrink-0"><img :src="logoURL" alt="Logo" class="h-10 w-10 rounded-md object-contain bg-white/10" /></NuxtLink>
          <div>
            <p class="font-semibold">Aiden Johnson</p>
            <p class="text-sm text-gray-400">Building thoughtful software and systems.</p>
          </div>
        </div>
        <nav class="flex flex-wrap gap-4">
          <NuxtLink v-for="link in menu" :key="link.id" :to="link.url" class="text-sm text-gray-300 hover:underline">
            {{ link.text }}
          </NuxtLink>
        </nav>
      </div>
      <div class="mt-8 text-xs text-gray-400">
        <p>© {{ year }} TGM, TGM.One, TGMstudios. All rights reserved.</p>
      </div>
    </div>
  </footer>  
</template>

<script>
import logoURL from '~/assets/logo.png'

export default {
  name: 'FooterSection',
  props: {
    menu: Array
  },
  data() {
    return {
      logoURL,
      year: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
</style>
