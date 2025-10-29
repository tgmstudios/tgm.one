<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <header class="mb-10">
      <h1 class="text-3xl font-extrabold">About Me</h1>
      <p class="text-gray-300 mt-3">I'm Aiden Johnson, a software developer focused on building practical, reliable systems — from RFID and IoT to web platforms and infrastructure.</p>
    </header>

    <section class="mb-10">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="bg-white/5 rounded-xl p-5">
          <h2 class="text-lg font-semibold mb-2">Current</h2>
          <p class="text-gray-300">Studying Computer Science at Penn State. Building products at Telaeris, and leading technical initiatives for the PSU Competitive Cybersecurity Organization.</p>
        </div>
        <div class="bg-white/5 rounded-xl p-5">
          <h2 class="text-lg font-semibold mb-2">Interests</h2>
          <p class="text-gray-300">Systems design, containers and orchestration, secure OTA, RFID, and applied ML. I like shipping clean, maintainable solutions.</p>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4">Experience & Highlights</h2>
      <div class="space-y-4">
        <div class="bg-white/5 rounded-xl p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-semibold">Telaeris, Inc.</h3>
              <p class="text-sm text-gray-400">Software Developer · Apr 2024 – Present</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-200">RFID & IoT</span>
          </div>
          <ul class="list-disc pl-5 mt-3 space-y-1 text-gray-300">
            <li>Lead developer for Tagaby (Node.js, MySQL, Flutter, .NET).</li>
            <li>Built secure Android OTA update service with device verification.</li>
            <li>Containerized services with Docker/Kubernetes; CI/CD via GitHub Actions.</li>
          </ul>
        </div>

        <div class="bg-white/5 rounded-xl p-5">
          <h3 class="font-semibold">Web Platforms</h3>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-300">
            <li>Telaeris.com — corporate site with documentation and support.</li>
            <li>XpressRFID.com — e-commerce for RFID products.</li>
            <li>Squarebrain.com — online learning platform.</li>
          </ul>
        </div>

        <div class="bg-white/5 rounded-xl p-5">
          <h3 class="font-semibold">Hackathons</h3>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-300">
            <li>Perfect Portion — 1st Place, HackPSU Fall 2023.</li>
            <li>Campus Calendar — 2nd Place, HackPSU Spring 2024.</li>
          </ul>
        </div>

        <div class="bg-white/5 rounded-xl p-5">
          <h3 class="font-semibold">Tech Director — PSU Cybersecurity Org</h3>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-300">
            <li>Infrastructure for internal CTFs and events using Kubernetes and automation.</li>
            <li>Focus on resilient, secure, observable systems.</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-bold mb-4">Skills</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="bg-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold mb-2">Programming</h3>
          <p class="text-gray-300">JavaScript/Node.js, PHP, C#, Swift, React</p>
        </div>
        <div class="bg-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold mb-2">Cloud & DevOps</h3>
          <p class="text-gray-300">Docker, Kubernetes, AWS, GitHub Actions, Rancher</p>
        </div>
        <div class="bg-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold mb-2">Data & APIs</h3>
          <p class="text-gray-300">MySQL, REST APIs, access control</p>
        </div>
        <div class="bg-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold mb-2">Hardware & ML</h3>
          <p class="text-gray-300">RFID, PCB (KiCAD), Blender, applied ML</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutView",
};
</script>

<style scoped>
/* Styling primarily handled via Tailwind utility classes to match the site */
</style>
