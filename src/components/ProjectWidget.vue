<template>
    <div>
        <h2>{{ project.title }}</h2>
        <img :src="project.icon" alt="Project Image">
        <p>{{ project.excerpt }}</p>
        <div v-if="view === 'full'" v-html="renderedContent"></div>
    </div>
</template>

<script>
import MarkdownIt from 'markdown-it'

export default {
    name: 'ProjectWidget',
    props: {
        project: {
            type: Object,
            required: true
        },
        view: {
            type: String,
            default: 'full'
        }
    },
    computed: {
        renderedContent() {
            const md = new MarkdownIt()
            return md.render(this.project.content)
        }
    }
}
</script>

<style scoped>
</style>