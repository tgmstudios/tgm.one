<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-load-warning-title"
    >
      <section class="w-full max-w-md rounded-xl border border-amber-300/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <h2 id="content-load-warning-title" class="text-lg font-semibold">
          Some site content could not load
        </h2>
        <p class="mt-3 text-sm leading-6 text-zinc-300">
          Not all site experiences could load correctly. Please try again later.
        </p>
        <p class="mt-3 text-sm leading-6 text-zinc-300">
          If your network uses a firewall, make sure <strong class="font-medium text-white">tgm.one</strong> and
          <strong class="font-medium text-white">foligo.tech</strong> are allowed.
        </p>
        <button
          type="button"
          class="mt-6 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
          @click="isVisible = false"
        >
          Close
        </button>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isVisible = ref(false)

const showWarning = () => {
  isVisible.value = true
}

const hasFailedFoligoResource = (element) => {
  const url = element?.src || element?.href || ''
  try {
    return new URL(url, window.location.href).hostname.endsWith('foligo.tech')
  } catch {
    return false
  }
}

const onResourceError = (event) => {
  if (hasFailedFoligoResource(event.target)) showWarning()
}

onMounted(() => {
  window.addEventListener('foligo-request-failed', showWarning)
  // Resource errors do not bubble, so capture errors from Foligo-hosted images/scripts.
  window.addEventListener('error', onResourceError, true)

  // SSR images can fail before Vue has mounted this listener.
  const failedInitialImage = Array.from(document.images).some((image) => (
    hasFailedFoligoResource(image) && image.complete && image.naturalWidth === 0
  ))
  if (failedInitialImage) showWarning()
})

onBeforeUnmount(() => {
  window.removeEventListener('foligo-request-failed', showWarning)
  window.removeEventListener('error', onResourceError, true)
})
</script>
