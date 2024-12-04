<template>
  <div>
    <ProjectWidget 
      v-for="(project, key) in projects" 
      :key="key" 
      :project="project"
      :view="'card'"
    />
  </div>
</template>

<script>
import ProjectWidget from '@/components/ProjectWidget.vue'
import { getProjects } from '@/lib/projectsLoader.js';

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
