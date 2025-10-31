<template>
    <div v-if="project">
        <div v-if="view === 'card'" class="group bg-white/5 hover:bg-white/10 transition rounded-xl p-4 shadow-sm hover:shadow-md h-full">
            <router-link :to="project.path" class="flex flex-col h-full">
                <div class="flex items-center gap-3 mb-3">
                    <img :src="project.icon" :alt="`${project.title} icon`" class="h-10 w-10 rounded-md object-contain bg-white/10" />
                    <h2 class="text-xl font-bold group-hover:underline">{{ project.title }}</h2>
                </div>
                <p class="text-sm text-gray-300 flex-1">{{ project.excerpt }}</p>
            </router-link>
        </div>
        <div v-else>
            <div v-if="showHeader">
                <h2 class="text-2xl font-bold mb-4">{{ project.title }}</h2>
                <img :src="project.icon" :alt="`${project.title} icon`" class="h-16 w-16 rounded-md object-contain bg-white/10 mb-4">
                <p class="text-base text-gray-300 mb-6">{{ project.excerpt }}</p>
            </div>
            <div v-if="view === 'full'" v-html="renderedContent"></div>
        </div>
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
        },
        showHeader: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        renderedContent() {
            if (!this.project || !this.project.content) return ''
            const md = new MarkdownIt()
            return md.render(this.project.content)
        }
    }
}
</script>

<style scoped>
</style>