<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" v-if="projectobj">
    <div class="mb-6">
      <router-link to="/projects" class="text-sm text-gray-300 hover:underline">← Back to projects</router-link>
    </div>

    <div class="flex items-start gap-4 mb-6">
      <img :src="projectobj.icon" alt="Project Image" class="h-14 w-14 rounded-md object-contain bg-white/10">
      <div>
        <h1 class="text-3xl font-extrabold">{{ projectobj.title }}</h1>
        <p class="text-gray-300 mt-2">{{ projectobj.excerpt }}</p>
      </div>
    </div>

    <div v-if="projectobj.tags && projectobj.tags.length" class="flex flex-wrap gap-2 mb-8">
      <span v-for="tag in projectobj.tags" :key="tag" class="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-200">#{{ tag }}</span>
    </div>

    <div class="prose prose-invert max-w-none">
      <ProjectWidget :project="projectobj" :view="'full'" :showHeader="false" />
    </div>

    <div v-if="relatedProjects.length" class="mt-12">
      <h2 class="text-xl font-semibold mb-4">Related projects</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectWidget 
          v-for="(proj, idx) in relatedProjects" 
          :key="idx" 
          :project="proj"
          :view="'card'"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ProjectWidget from '~/components/ProjectWidget.vue'
import { getProjects } from '~/lib/projectsLoader.js';

export default {
  name: 'ProjectView',
  components: {
    ProjectWidget
  },
  data() {
    return {
      projectobj: getProjects()[this.$route.params.project]
    };
  },
  computed: {
    relatedProjects() {
      if (!this.projectobj || !this.projectobj.related) return []
      const all = getProjects()
      return this.projectobj.related
        .map(key => all[key])
        .filter(Boolean)
    }
  },
  watch: {
    '$route.params.project'(newKey) {
      this.projectobj = getProjects()[newKey];
    }
  }
}
</script>
