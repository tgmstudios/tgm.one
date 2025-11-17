<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
    <!-- Header Section -->
    <header class="mb-12 lg:mb-16">
      <h1 class="text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        About Me
      </h1>
      <p class="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-3xl">
        I'm Aiden Johnson, a software developer focused on building practical, reliable systems — from RFID and IoT to web platforms and infrastructure.
      </p>
    </header>

    <!-- Current & Interests Section -->
    <section class="mb-12 lg:mb-16">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:bg-white/7 transition-colors">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 class="text-xl font-semibold">Current</h2>
          </div>
          <p class="text-gray-300 leading-relaxed">
            Studying Computer Science at Penn State. Building products at Telaeris, and leading technical initiatives for the PSU Competitive Cybersecurity Organization.
          </p>
        </div>
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:bg-white/7 transition-colors">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-2 h-2 rounded-full bg-purple-400"></div>
            <h2 class="text-xl font-semibold">Interests</h2>
          </div>
          <p class="text-gray-300 leading-relaxed">
            Systems design, containers and orchestration, secure OTA, RFID, and applied ML. I like shipping clean, maintainable solutions.
          </p>
        </div>
      </div>
    </section>

    <!-- Experience & Highlights Section -->
    <section class="mb-12 lg:mb-16">
      <div class="flex items-center gap-4 mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold">Experience & Highlights</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>
      
      <div v-if="experiencesPending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div>
        <p class="text-gray-400 mt-4">Loading experiences…</p>
      </div>
      <div v-else-if="experiencesError" class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
        Failed to load experiences.
      </div>
      
      <div v-else class="space-y-8">
        <article 
          v-for="experience in experiences" 
          :key="experience.id || experience.slug"
          class="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300"
        >
          <!-- Header -->
          <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl lg:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {{ experience.title || experience.name || 'Experience' }}
                  </h3>
                  <span 
                    v-if="experience.tags && experience.tags.length" 
                    class="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium"
                  >
                    {{ typeof (Array.isArray(experience.tags) ? experience.tags[0] : experience.tags) === 'object' 
                        ? (Array.isArray(experience.tags) ? experience.tags[0].name : experience.tags.name)
                        : (Array.isArray(experience.tags) ? experience.tags[0] : experience.tags) }}
                  </span>
                </div>
                
                <div class="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span v-if="experience.experienceCategory" class="font-medium text-gray-300">
                    {{ experience.experienceCategory }}
                  </span>
                  <span v-if="experience.location" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ experience.location }}{{ experience.locationType ? ` (${experience.locationType})` : '' }}
                  </span>
                  <span v-if="experience.startDate || experience.endDate || experience.date" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatExperienceDate(experience) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Roles -->
          <div v-if="experience.roles && experience.roles.length" class="mb-6 space-y-4">
            <div 
              v-for="role in experience.roles" 
              :key="role.id || role.title"
              class="pl-5 border-l-2 border-blue-500/50 bg-white/5 rounded-r-lg p-4"
            >
              <div class="flex items-start justify-between gap-4 mb-2">
                <h4 class="font-semibold text-gray-100 text-lg">{{ role.title || role.name }}</h4>
                <span v-if="role.startDate || role.endDate" class="text-xs text-gray-400 whitespace-nowrap">
                  {{ role.startDate ? formatDate(role.startDate) : '' }}
                  {{ role.endDate ? ` – ${formatDate(role.endDate)}` : (role.isOngoing ? ' – Present' : '') }}
                </span>
              </div>
              <div v-if="role.skills && role.skills.length" class="flex flex-wrap gap-2 mt-3">
                <span 
                  v-for="skill in role.skills" 
                  :key="skill.id || skill"
                  class="px-2.5 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium"
                >
                  {{ typeof skill === 'object' ? skill.name : skill }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div 
            v-if="experience.content || experience.body || experience.markdown || experience.description"
            class="experience-content"
          >
            <div 
              v-if="experience.content || experience.body || experience.markdown"
              class="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-white prose-ul:text-gray-300 prose-li:text-gray-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-blue-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
              v-html="renderedExperienceContent(experience)"
            ></div>
            <p v-else-if="experience.description" class="text-gray-300 leading-relaxed">
              {{ experience.description }}
            </p>
          </div>
          
          <!-- Linked Skills -->
          <div v-if="experience.linkedSkills && experience.linkedSkills.length" class="mt-6 pt-6 border-t border-white/10">
            <h5 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Skills & Technologies</h5>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in experience.linkedSkills" 
                :key="skill.id || skill" 
                class="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                {{ typeof skill === 'object' ? skill.name : skill }}
              </span>
            </div>
          </div>
        </article>
        
        <!-- Fallback if no experiences from API -->
        <div v-if="!experiences || experiences.length === 0" class="text-center py-12 text-gray-400">
          <p>No experiences available.</p>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section>
      <div class="flex items-center gap-4 mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold">Skills</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/7 hover:border-white/20 transition-all">
          <h3 class="text-base font-semibold mb-3 text-blue-300">Programming</h3>
          <p class="text-gray-300 leading-relaxed text-sm">JavaScript/Node.js, PHP, C#, Swift, React</p>
        </div>
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/7 hover:border-white/20 transition-all">
          <h3 class="text-base font-semibold mb-3 text-purple-300">Cloud & DevOps</h3>
          <p class="text-gray-300 leading-relaxed text-sm">Docker, Kubernetes, AWS, GitHub Actions, Rancher</p>
        </div>
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/7 hover:border-white/20 transition-all">
          <h3 class="text-base font-semibold mb-3 text-green-300">Data & APIs</h3>
          <p class="text-gray-300 leading-relaxed text-sm">MySQL, REST APIs, access control</p>
        </div>
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/7 hover:border-white/20 transition-all">
          <h3 class="text-base font-semibold mb-3 text-orange-300">Hardware & ML</h3>
          <p class="text-gray-300 leading-relaxed text-sm">RFID, PCB (KiCAD), Blender, applied ML</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMarkdownRenderer } from '~/composables/useMarkdownRenderer.js'

const config = useRuntimeConfig()
const { createFoligoClient } = await import('~/lib/foligoClient.js')
const foligo = createFoligoClient({
  foligoBaseUrl: config.public.foligoBaseUrl,
  foligoProjectId: config.public.foligoProjectId,
  foligoSubdomain: config.public.foligoSubdomain
})

const { data: experiencesData, pending: experiencesPending, error: experiencesError } = await useAsyncData(
  'experiences',
  () => foligo.getExperiences(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

const experiences = computed(() => experiencesData.value || [])

const { render: renderMarkdown } = useMarkdownRenderer()

const renderedExperienceContent = (experience) => {
  const content = experience.content || experience.body || experience.markdown || ''
  if (!content) return ''
  return renderMarkdown(content)
}

const formatExperienceDate = (experience) => {
  const startDate = experience.startDate || experience.date
  const endDate = experience.endDate
  const isOngoing = experience.isOngoing
  const date = experience.date || experience.createdAt
  
  if (startDate && endDate && !isOngoing) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`
  } else if (startDate) {
    return `${formatDate(startDate)} – ${isOngoing ? 'Present' : 'Present'}`
  } else if (date) {
    return formatDate(date)
  }
  return ''
}

const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
/* Enhanced prose styling for experience content */
.experience-content :deep(.prose) {
  color: rgb(209 213 219); /* gray-300 */
}

.experience-content :deep(.prose h2) {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-size: 1.25em;
  font-weight: 600;
  color: white;
}

.experience-content :deep(.prose h3) {
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  font-size: 1.125em;
  font-weight: 600;
  color: white;
}

.experience-content :deep(.prose h4) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-size: 1em;
  font-weight: 600;
  color: rgb(229 231 235); /* gray-200 */
}

.experience-content :deep(.prose p) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  line-height: 1.75;
}

.experience-content :deep(.prose ul),
.experience-content :deep(.prose ol) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  padding-left: 1.5em;
}

.experience-content :deep(.prose li) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  line-height: 1.75;
}

.experience-content :deep(.prose li::marker) {
  color: rgb(96 165 250); /* blue-400 */
}

.experience-content :deep(.prose strong) {
  font-weight: 600;
  color: white;
}

.experience-content :deep(.prose code) {
  font-size: 0.875em;
  padding: 0.125rem 0.375rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  color: rgb(147 197 253); /* blue-300 */
}

.experience-content :deep(.prose a) {
  color: rgb(96 165 250); /* blue-400 */
  text-decoration: none;
  transition: text-decoration 0.2s;
}

.experience-content :deep(.prose a:hover) {
  text-decoration: underline;
}

.experience-content :deep(.prose blockquote) {
  border-left: 4px solid rgba(96, 165, 250, 0.5);
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
  color: rgb(209 213 219);
}

/* Smooth transitions for interactive elements */
.group {
  transition: all 0.3s ease;
}
</style>
