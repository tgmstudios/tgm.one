/**
 * Foligo Analytics — injects the hosted tracking script.
 *
 * All fingerprinting, device detection, time-on-page, flow tracking,
 * and SPA navigation logic lives in the hosted script at api.foligo.org/analytics.js.
 *
 * Key configured via FOLIGO_ANALYTICS_KEY env var or nuxt.config runtimeConfig.
 */

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const key = config.public.foligoAnalyticsKey

  if (!key) return

  const script = document.createElement('script')
  script.src = 'https://api.foligo.org/analytics.js'
  script.setAttribute('data-key', key)
  script.defer = true
  script.onerror = () => window.dispatchEvent(new Event('foligo-request-failed'))
  document.head.appendChild(script)
})
