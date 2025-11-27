<template>
  <div>
    <NavigationSidebar
      :items="tocItems"
      :active-id="activeSection"
      @navigate="scrollToSection"
    />
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
    <!-- Header Section -->
    <header id="about-header" class="mb-12 lg:mb-16">
      <div class="flex flex-col md:flex-row md:items-center gap-8 mb-8">
        <img 
          src="https://api.foligo.tech/api/media/c538ffd7-ae99-431b-9d76-8bf3345e92ff/file" 
          alt="Aiden Johnson" 
          class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-white/20 shadow-xl ring-4 ring-white/5"
        />
        <div class="flex-1">
          <h1 class="text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Aiden Johnson
          </h1>
          <p class="text-lg lg:text-xl text-gray-300 leading-relaxed mb-6 max-w-2xl">
            Software developer focused on building practical, reliable systems — from AI and IoT to web platforms and infrastructure.
          </p>
          <div class="flex items-center gap-3">
            <a 
              href="https://github.com/tgmstudios" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white border border-white/10 hover:border-white/20"
              aria-label="GitHub"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              <span>GitHub</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/aiden-johnson-cs/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white border border-white/10 hover:border-white/20"
              aria-label="LinkedIn"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="!experiencesPending" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div class="text-2xl font-bold text-blue-300 mb-1">{{ animatedJobsCount }}</div>
          <div class="text-xs text-gray-400 uppercase tracking-wide">Positions</div>
        </div>
        <div class="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
          <div class="text-2xl font-bold text-green-300 mb-1">{{ animatedEducationCount }}</div>
          <div class="text-xs text-gray-400 uppercase tracking-wide">Education</div>
        </div>
        <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <div class="text-2xl font-bold text-purple-300 mb-1">{{ animatedCertificationsCount }}</div>
          <div class="text-xs text-gray-400 uppercase tracking-wide">Certifications</div>
        </div>
        <div class="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
          <div class="text-2xl font-bold text-orange-300 mb-1">{{ animatedSkillsCount }}</div>
          <div class="text-xs text-gray-400 uppercase tracking-wide">Skills</div>
        </div>
      </div>
    </header>

    <!-- Current & Interests Section -->
    <section id="current-interests" class="mb-12 lg:mb-16">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300 shadow-lg">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
            <h2 class="text-xl font-semibold text-white">Currently</h2>
          </div>
          <p class="text-gray-300 leading-relaxed">
            Studying Computer Science at Penn State. Building products at Telaeris, and leading technical initiatives for the PSU Competitive Cybersecurity Organization.
          </p>
        </div>
        <div class="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300 shadow-lg">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"></div>
            <h2 class="text-xl font-semibold text-white">Interests</h2>
          </div>
          <p class="text-gray-300 leading-relaxed">
            Systems design, containers and orchestration, secure OTA, and applied ML. I like shipping clean, maintainable solutions.
          </p>
        </div>
      </div>
    </section>

    <!-- Experience & Highlights Section -->
    <section id="experience-highlights" class="mb-12 lg:mb-16">
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
      
      <div v-else>
        <!-- Jobs Section -->
        <div v-if="jobs.length > 0" id="jobs" class="mb-12">
          <h3 class="text-xl lg:text-2xl font-bold mb-6 text-blue-300 flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Professional Experience
          </h3>
          <div class="relative">
            <!-- Timeline line -->
            <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 via-blue-400/20 to-transparent hidden md:block"></div>
            
            <div class="space-y-8">
              <article 
                v-for="(experience, index) in jobs" 
                :key="experience.id || experience.slug"
                class="relative group"
              >
                <!-- Timeline dot -->
                <div class="absolute left-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-950 z-10 hidden md:block"></div>
                
                <div class="ml-0 md:ml-16 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300 shadow-lg">
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
                <NuxtLink
                  v-for="skill in role.skills" 
                  :key="skill.id || skill"
                  :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
                  class="px-2.5 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium hover:bg-blue-500/30 transition-colors cursor-pointer"
                >
                  {{ typeof skill === 'object' ? skill.name : skill }}
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div v-if="experience.content || experience.body || experience.markdown || experience.description">
            <button
              @click="toggleExpanded(experience.id || experience.slug)"
              class="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-4 transition-colors font-medium"
            >
              <svg 
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-90': expandedSections[experience.id || experience.slug] }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span>{{ expandedSections[experience.id || experience.slug] ? 'Hide' : 'Show' }} Details</span>
            </button>
            
            <div 
              v-show="expandedSections[experience.id || experience.slug]"
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
          </div>
          
          <!-- Linked Skills -->
          <div v-if="experience.linkedSkills && experience.linkedSkills.length" class="mt-6 pt-6 border-t border-white/10">
            <h5 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Skills & Technologies</h5>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="skill in experience.linkedSkills" 
                :key="skill.id || skill"
                :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
                class="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                {{ typeof skill === 'object' ? skill.name : skill }}
              </NuxtLink>
            </div>
          </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Education Section -->
        <div v-if="education.length > 0" id="education" class="mb-12">
          <h3 class="text-xl lg:text-2xl font-bold mb-6 text-green-300 flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v9M12 14l-9-5M12 14l9-5M12 9V5" />
            </svg>
            Education
          </h3>
          <div class="relative">
            <!-- Timeline line -->
            <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500/30 via-green-400/20 to-transparent hidden md:block"></div>
            
            <div class="space-y-8">
              <article 
                v-for="(experience, index) in education" 
                :key="experience.id || experience.slug"
                class="relative group"
              >
                <!-- Timeline dot -->
                <div class="absolute left-6 w-4 h-4 rounded-full bg-green-500 border-4 border-gray-950 z-10 hidden md:block"></div>
                
                <div class="ml-0 md:ml-16 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300 shadow-lg">
          <!-- Header -->
          <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl lg:text-2xl font-bold text-white group-hover:text-green-300 transition-colors">
                    {{ experience.title || experience.name || 'Experience' }}
                  </h3>
                  <span 
                    v-if="experience.tags && experience.tags.length" 
                    class="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 font-medium"
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
              class="pl-5 border-l-2 border-green-500/50 bg-white/5 rounded-r-lg p-4"
            >
              <div class="flex items-start justify-between gap-4 mb-2">
                <h4 class="font-semibold text-gray-100 text-lg">{{ role.title || role.name }}</h4>
                <span v-if="role.startDate || role.endDate" class="text-xs text-gray-400 whitespace-nowrap">
                  {{ role.startDate ? formatDate(role.startDate) : '' }}
                  {{ role.endDate ? ` – ${formatDate(role.endDate)}` : (role.isOngoing ? ' – Present' : '') }}
                </span>
              </div>
              <div v-if="role.skills && role.skills.length" class="flex flex-wrap gap-2 mt-3">
                <NuxtLink
                  v-for="skill in role.skills" 
                  :key="skill.id || skill"
                  :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
                  class="px-2.5 py-1 text-xs rounded-md bg-green-500/20 text-green-300 border border-green-500/30 font-medium hover:bg-green-500/30 transition-colors cursor-pointer"
                >
                  {{ typeof skill === 'object' ? skill.name : skill }}
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div v-if="experience.content || experience.body || experience.markdown || experience.description">
            <button
              @click="toggleExpanded(experience.id || experience.slug)"
              class="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 mb-4 transition-colors font-medium"
            >
              <svg 
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-90': expandedSections[experience.id || experience.slug] }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span>{{ expandedSections[experience.id || experience.slug] ? 'Hide' : 'Show' }} Details</span>
            </button>
            
            <div 
              v-show="expandedSections[experience.id || experience.slug]"
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
          </div>
          
          <!-- Linked Skills -->
          <div v-if="experience.linkedSkills && experience.linkedSkills.length" class="mt-6 pt-6 border-t border-white/10">
            <h5 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Skills & Technologies</h5>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="skill in experience.linkedSkills" 
                :key="skill.id || skill"
                :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
                class="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                {{ typeof skill === 'object' ? skill.name : skill }}
              </NuxtLink>
            </div>
          </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Certifications Section -->
        <div v-if="certifications.length > 0" id="certifications" class="mb-12">
          <h3 class="text-xl lg:text-2xl font-bold mb-6 text-purple-300 flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Certifications
          </h3>
          <div class="relative">
            <!-- Timeline line -->
            <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/30 via-purple-400/20 to-transparent hidden md:block"></div>
            
            <div class="space-y-8">
              <article 
                v-for="(experience, index) in certifications" 
                :key="experience.id || experience.slug"
                class="relative group"
              >
                <!-- Timeline dot -->
                <div class="absolute left-6 w-4 h-4 rounded-full bg-purple-500 border-4 border-gray-950 z-10 hidden md:block"></div>
                
                <div class="ml-0 md:ml-16 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300 shadow-lg">
          <!-- Header -->
          <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl lg:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {{ experience.title || experience.name || 'Experience' }}
                  </h3>
                  <span 
                    v-if="experience.tags && experience.tags.length" 
                    class="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium"
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
              class="pl-5 border-l-2 border-purple-500/50 bg-white/5 rounded-r-lg p-4"
            >
              <div class="flex items-start justify-between gap-4 mb-2">
                <h4 class="font-semibold text-gray-100 text-lg">{{ role.title || role.name }}</h4>
                <span v-if="role.startDate || role.endDate" class="text-xs text-gray-400 whitespace-nowrap">
                  {{ role.startDate ? formatDate(role.startDate) : '' }}
                  {{ role.endDate ? ` – ${formatDate(role.endDate)}` : (role.isOngoing ? ' – Present' : '') }}
                </span>
              </div>
              <div v-if="role.skills && role.skills.length" class="flex flex-wrap gap-2 mt-3">
                <NuxtLink
                  v-for="skill in role.skills" 
                  :key="skill.id || skill"
                  :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
                  class="px-2.5 py-1 text-xs rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium hover:bg-purple-500/30 transition-colors cursor-pointer"
                >
                  {{ typeof skill === 'object' ? skill.name : skill }}
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div v-if="experience.content || experience.body || experience.markdown || experience.description">
            <button
              @click="toggleExpanded(experience.id || experience.slug)"
              class="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-4 transition-colors font-medium"
            >
              <svg 
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-90': expandedSections[experience.id || experience.slug] }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span>{{ expandedSections[experience.id || experience.slug] ? 'Hide' : 'Show' }} Details</span>
            </button>
            
            <div 
              v-show="expandedSections[experience.id || experience.slug]"
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
          </div>
          
          <!-- Linked Skills -->
          <div v-if="experience.linkedSkills && experience.linkedSkills.length" class="mt-6 pt-6 border-t border-white/10">
            <h5 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Skills & Technologies</h5>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="skill in experience.linkedSkills" 
                :key="skill.id || skill"
                :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
                class="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                {{ typeof skill === 'object' ? skill.name : skill }}
              </NuxtLink>
            </div>
          </div>
                </div>
              </article>
            </div>
          </div>
        </div>
        
        <!-- Fallback if no experiences from API -->
        <div v-if="!experiences || experiences.length === 0" class="text-center py-12 text-gray-400">
          <p>No experiences available.</p>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section id="skills">
      <div class="flex items-center gap-4 mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills & Technologies
        </h2>
        <div class="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>
      <div v-if="skillsByCategory && Object.keys(skillsByCategory).length > 0" class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="(skills, category) in sortedSkillsCategoriesForGrid" 
            :key="category"
            class="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300 shadow-lg"
          >
            <h3 class="text-base font-semibold mb-4 flex items-center gap-2" :class="getCategoryColor(category)">
              <div class="w-2 h-2 rounded-full" :class="getCategoryDotColor(category)"></div>
              {{ category }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="skill in skills" 
                :key="skill.id || skill"
                :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
                class="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all cursor-pointer"
              >
                {{ typeof skill === 'object' ? skill.name : skill }}
              </NuxtLink>
            </div>
          </div>
        </div>
        <!-- Other category - full width -->
        <div 
          v-if="otherCategory && otherCategory.length > 0"
          class="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/7 transition-all duration-300 shadow-lg"
        >
          <h3 class="text-base font-semibold mb-4 flex items-center gap-2" :class="getCategoryColor('Other')">
            <div class="w-2 h-2 rounded-full" :class="getCategoryDotColor('Other')"></div>
            Other
          </h3>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="skill in otherCategory" 
              :key="skill.id || skill"
              :to="`/search?skill=${encodeURIComponent(typeof skill === 'object' ? skill.name : skill)}`"
              class="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all cursor-pointer"
            >
              {{ typeof skill === 'object' ? skill.name : skill }}
            </NuxtLink>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 text-gray-400">
        <p>No skills available.</p>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useMarkdownRenderer } from '~/composables/useMarkdownRenderer.js'
import NavigationSidebar from '~/components/NavigationSidebar.vue'

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

// Fetch projects and blogs for skills collection
const { data: projectsData } = await useAsyncData(
  'projects-for-skills',
  () => foligo.getProjects(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

const { data: blogsData } = await useAsyncData(
  'blogs-for-skills',
  () => foligo.getBlogs(),
  {
    lazy: true,
    server: false,
    default: () => []
  }
)

const experiences = computed(() => {
  // _originalIndex is already set by getExperiences from the original source array
  // Just return the experiences as-is to preserve the original order
  return experiencesData.value || []
})

// Group experiences by category, preserving original array order (0, 1, 2, etc.) within each category
const jobs = computed(() => {
  return experiences.value
    .filter(exp => {
      const category = (exp.experienceCategory || '').toString().toLowerCase()
      return category === 'job' || category === 'work' || category === 'employment'
    })
    .sort((a, b) => {
      // Use original array index to preserve order from source data (0, 1, 2, etc.)
      return (a._originalIndex ?? Infinity) - (b._originalIndex ?? Infinity)
    })
})

const education = computed(() => {
  return experiences.value
    .filter(exp => {
      const category = (exp.experienceCategory || '').toString().toLowerCase()
      return category === 'education' || category === 'school' || category === 'university'
    })
    .sort((a, b) => {
      // Use original array index to preserve order from source data (0, 1, 2, etc.)
      return (a._originalIndex ?? Infinity) - (b._originalIndex ?? Infinity)
    })
})

const certifications = computed(() => {
  return experiences.value
    .filter(exp => {
      const category = (exp.experienceCategory || '').toString().toLowerCase()
      return category === 'certification' || category === 'cert' || category === 'certificate'
    })
    .sort((a, b) => {
      // Use original array index to preserve order from source data (0, 1, 2, etc.)
      return (a._originalIndex ?? Infinity) - (b._originalIndex ?? Infinity)
    })
})

// Shared normalization and deduplication functions (used by both skillsByCategory and totalSkillsCount)
const normalizeSkillName = (skill) => {
  const skillName = typeof skill === 'object' ? (skill.name || skill.id || skill) : skill
  if (!skillName) return null
  // Normalize: lowercase, trim, remove extra spaces, remove special chars
  return skillName.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
}

const areDuplicates = (name1, name2) => {
  if (name1 === name2) return true
  
  // Handle single-word cases
  if (!name1.includes(' ') && !name2.includes(' ')) {
    if (name1.endsWith('s') && name1.length > 3) {
      const base1 = name1.slice(0, -1)
      if (base1 === name2 && base1.length >= 3) return true
    }
    if (name2.endsWith('s') && name2.length > 3) {
      const base2 = name2.slice(0, -1)
      if (base2 === name1 && base2.length >= 3) return true
    }
    if (name1.length >= 3 && name1 + 's' === name2) return true
    if (name2.length >= 3 && name2 + 's' === name1) return true
  } else {
    // Handle multi-word cases (e.g., "rest api" vs "rest apis")
    const words1 = name1.split(' ')
    const words2 = name2.split(' ')
    
    if (words1.length === words2.length) {
      let allMatch = true
      for (let i = 0; i < words1.length - 1; i++) {
        if (words1[i] !== words2[i]) {
          allMatch = false
          break
        }
      }
      
      if (allMatch) {
        const last1 = words1[words1.length - 1]
        const last2 = words2[words2.length - 1]
        
        if (last1 === last2) return true
        if (last1.length >= 3 && last1.endsWith('s') && last1.slice(0, -1) === last2) return true
        if (last2.length >= 3 && last2.endsWith('s') && last2.slice(0, -1) === last1) return true
        if (last1.length >= 3 && last1 + 's' === last2) return true
        if (last2.length >= 3 && last2 + 's' === last1) return true
      }
    }
  }
  
  return false
}

// Collect all skills from experiences, projects, and blogs, grouped by category
const skillsByCategory = computed(() => {
  const skillMap = new Map()
  const seenSkills = new Map() // Track seen skills by normalized name -> { category, skill }
  
  // Helper to get the original skill object with name
  const getSkillObject = (skill) => {
    if (typeof skill === 'object' && (skill.name || skill.id)) {
      return skill
    }
    return { name: typeof skill === 'object' ? skill : skill }
  }
  
  // Helper to add skill to category with strict deduplication
  const addSkill = (skill, category = 'Other') => {
    const normalizedName = normalizeSkillName(skill)
    if (!normalizedName || normalizedName === '') return
    
    // First check for exact match (simple and fast)
    if (seenSkills.has(normalizedName)) {
      // Skill already exists with exact normalized name, don't add it again
      return
    }
    
    // Then check for plural variations
    let isDuplicate = false
    for (const [key, value] of seenSkills.entries()) {
      if (areDuplicates(normalizedName, key)) {
        isDuplicate = true
        break
      }
    }
    
    if (isDuplicate) {
      // Skill already exists (as a plural variation), don't add it again
      return
    }
    
    // Mark as seen and store the category and skill object
    const skillObj = getSkillObject(skill)
    seenSkills.set(normalizedName, { category, skill: skillObj })
    
    if (!skillMap.has(category)) {
      skillMap.set(category, [])
    }
    skillMap.get(category).push(skillObj)
  }
  
  // Helper to get category from skill object
  const getSkillCategory = (skill) => {
    // Use the skill's category property
    if (typeof skill === 'object' && skill.category) {
      return skill.category
    }
    // Fallback to 'Other' if no category is provided (shouldn't happen per user)
    return 'Other'
  }
  
  // Collect from experiences
  experiences.value.forEach(exp => {
    if (exp.linkedSkills && Array.isArray(exp.linkedSkills)) {
      exp.linkedSkills.forEach(skill => {
        const category = getSkillCategory(skill)
        addSkill(skill, category)
      })
    }
    if (exp.roles && Array.isArray(exp.roles)) {
      exp.roles.forEach(role => {
        if (role.skills && Array.isArray(role.skills)) {
          role.skills.forEach(skill => {
            const category = getSkillCategory(skill)
            addSkill(skill, category)
          })
        }
      })
    }
  })
  
  // Collect from projects
  if (projectsData.value) {
    projectsData.value.forEach(project => {
      if (project.linkedSkills && Array.isArray(project.linkedSkills)) {
        project.linkedSkills.forEach(skill => {
          const category = getSkillCategory(skill)
          addSkill(skill, category)
        })
      }
    })
  }
  
  // Collect from blogs
  if (blogsData.value) {
    blogsData.value.forEach(blog => {
      if (blog.linkedSkills && Array.isArray(blog.linkedSkills)) {
        blog.linkedSkills.forEach(skill => {
          const category = getSkillCategory(skill)
          addSkill(skill, category)
        })
      }
    })
  }
  
  // Sort skills within each category and ensure no duplicates within category
  const result = {}
  skillMap.forEach((skills, category) => {
    // Additional deduplication within category using same normalization and plural checking
    const categorySeen = new Set()
    const uniqueSkills = skills.filter(skill => {
      const normalized = normalizeSkillName(skill)
      if (!normalized) {
        return false
      }
      
      // Check for duplicates using areDuplicates function
      let isDuplicate = false
      for (const seenName of categorySeen) {
        if (areDuplicates(normalized, seenName)) {
          isDuplicate = true
          break
        }
      }
      
      if (isDuplicate) {
        return false
      }
      
      categorySeen.add(normalized)
      return true
    })
    
    result[category] = uniqueSkills.sort((a, b) => {
      const nameA = typeof a === 'object' ? (a.name || a.id || '') : a
      const nameB = typeof b === 'object' ? (b.name || b.id || '') : b
      return nameA.toString().localeCompare(nameB.toString())
    })
  })
  
  return result
})

// Sort categories with "Other" last - for grid display (excludes Other)
const sortedSkillsCategoriesForGrid = computed(() => {
  if (!skillsByCategory.value) return {}
  
  const categories = Object.keys(skillsByCategory.value)
    .filter(cat => cat.toLowerCase() !== 'other')
    .sort()
  
  const result = {}
  categories.forEach(category => {
    if (skillsByCategory.value[category]) {
      result[category] = skillsByCategory.value[category]
    }
  })
  
  return result
})

// Get the "Other" category (case-insensitive)
const otherCategory = computed(() => {
  if (!skillsByCategory.value) return null
  
  const otherKey = Object.keys(skillsByCategory.value).find(
    key => key.toLowerCase() === 'other'
  )
  
  return otherKey ? skillsByCategory.value[otherKey] : null
})

// Categorize skills based on common patterns
const categorizeSkill = (skill) => {
  const skillName = (typeof skill === 'object' ? (skill.name || skill) : skill).toString().toLowerCase()
  
  // Programming languages and frameworks
  if (['javascript', 'typescript', 'node', 'react', 'vue', 'angular', 'php', 'python', 'java', 'c#', 'c++', 'swift', 'kotlin', 'go', 'rust', 'ruby', 'dart', 'flutter'].some(term => skillName.includes(term))) {
    return 'Programming'
  }
  
  // Cloud & DevOps
  if (['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'github actions', 'ci/cd', 'devops', 'rancher', 'terraform', 'ansible', 'jenkins'].some(term => skillName.includes(term))) {
    return 'Cloud & DevOps'
  }
  
  // Data & APIs
  if (['mysql', 'postgresql', 'mongodb', 'redis', 'sql', 'database', 'api', 'rest', 'graphql', 'grpc'].some(term => skillName.includes(term))) {
    return 'Data & APIs'
  }
  
  // Hardware & ML
  if (['rfid', 'iot', 'pcb', 'kicad', 'blender', 'machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'arduino', 'raspberry'].some(term => skillName.includes(term))) {
    return 'Hardware & ML'
  }
  
  // Frontend
  if (['html', 'css', 'sass', 'tailwind', 'bootstrap', 'ui', 'ux', 'design', 'figma'].some(term => skillName.includes(term))) {
    return 'Frontend'
  }
  
  // Security
  if (['security', 'cybersecurity', 'encryption', 'ssl', 'tls', 'oauth', 'jwt', 'authentication', 'authorization'].some(term => skillName.includes(term))) {
    return 'Security'
  }
  
  return 'Other'
}

// Generate a consistent color for any category name
const getCategoryColor = (category) => {
  // Return neutral color for all categories
  return 'text-white'
}

const getCategoryDotColor = (category) => {
  // Return neutral color for all categories
  return 'bg-white/30'
}

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

// Collapsible sections state
const expandedSections = ref({})

const toggleExpanded = (id) => {
  expandedSections.value[id] = !expandedSections.value[id]
}

// Total skills count - count unique skills across all categories with proper deduplication
const totalSkillsCount = computed(() => {
  if (!skillsByCategory.value) return 0
  
  const seenSkills = new Set()
  const allNormalized = []
  
  // First pass: collect all normalized names
  Object.values(skillsByCategory.value).forEach(skills => {
    skills.forEach(skill => {
      const normalized = normalizeSkillName(skill)
      if (normalized) {
        allNormalized.push(normalized)
      }
    })
  })
  
  // Second pass: deduplicate using exact match first, then plural check
  allNormalized.forEach(normalized => {
    // Check for exact match first
    if (seenSkills.has(normalized)) {
      return
    }
    
    // Check for plural variations
    let isDuplicate = false
    for (const seenName of seenSkills) {
      if (areDuplicates(normalized, seenName)) {
        isDuplicate = true
        break
      }
    }
    
    if (!isDuplicate) {
      seenSkills.add(normalized)
    }
  })
  
  return seenSkills.size
})

// Animated counters
const animatedJobsCount = ref(0)
const animatedEducationCount = ref(0)
const animatedCertificationsCount = ref(0)
const animatedSkillsCount = ref(0)

// Animation state
let animationFrameId = null
let animationStartTime = null

const updateCounters = () => {
  if (experiencesPending.value) return
  
  const targets = {
    jobs: jobs.value.length,
    education: education.value.length,
    certifications: certifications.value.length,
    skills: totalSkillsCount.value
  }
  
  const duration = 1500
  animationStartTime = performance.now()
  
  const animate = (timestamp) => {
    if (!animationStartTime) {
      animationStartTime = timestamp
    }
    
    const elapsed = timestamp - animationStartTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    animatedJobsCount.value = Math.round(targets.jobs * easeOut)
    animatedEducationCount.value = Math.round(targets.education * easeOut)
    animatedCertificationsCount.value = Math.round(targets.certifications * easeOut)
    animatedSkillsCount.value = Math.round(targets.skills * easeOut)
    
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      // Ensure final values are exact
      animatedJobsCount.value = targets.jobs
      animatedEducationCount.value = targets.education
      animatedCertificationsCount.value = targets.certifications
      animatedSkillsCount.value = targets.skills
    }
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  animationFrameId = requestAnimationFrame(animate)
}

// Watch for changes in computed values
watch([jobs, education, certifications, totalSkillsCount, experiencesPending], () => {
  if (!experiencesPending.value) {
    updateCounters()
  }
}, { immediate: true })

// Table of contents for about page sections
const activeSection = ref('')
const tocItems = computed(() => {
  const items = [
    { id: 'about-header', text: 'About Me', level: 1 },
    { id: 'current-interests', text: 'Current & Interests', level: 1 },
    { id: 'experience-highlights', text: 'Experience & Highlights', level: 1 }
  ]
  
  if (jobs.value.length > 0) {
    items.push({ id: 'jobs', text: 'Jobs', level: 2 })
  }
  if (education.value.length > 0) {
    items.push({ id: 'education', text: 'Education', level: 2 })
  }
  if (certifications.value.length > 0) {
    items.push({ id: 'certifications', text: 'Certifications', level: 2 })
  }
  
  items.push({ id: 'skills', text: 'Skills', level: 1 })
  
  return items
})

const scrollToSection = (id) => {
  if (typeof document === 'undefined') return
  
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Update active section based on scroll position
const updateActiveSection = () => {
  if (typeof window === 'undefined' || tocItems.value.length === 0) return
  
  const scrollPosition = window.scrollY + 100 // Offset for header
  
  // Find the section that's currently in view
  let current = ''
  for (let i = tocItems.value.length - 1; i >= 0; i--) {
    const element = document.getElementById(tocItems.value[i].id)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= scrollPosition) {
        current = tocItems.value[i].id
        break
      }
    }
  }
  
  activeSection.value = current
}

let scrollListener = null

onMounted(() => {
  scrollListener = () => updateActiveSection()
  window.addEventListener('scroll', scrollListener, { passive: true })
  setTimeout(() => {
    updateActiveSection()
  }, 100)
})

onUnmounted(() => {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener)
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
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
