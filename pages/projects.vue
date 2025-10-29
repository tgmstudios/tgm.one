<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-extrabold mb-6">Projects</h1>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProjectWidget 
        v-for="(project, key) in projects" 
        :key="key" 
        :project="project"
        :view="'card'"
      />
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
      projects: getProjects()
    };
  }
}
</script>
