/**
 * Foligo Analytics — privacy-conscious page-view and event tracking.
 *
 * Sends page_view events to the Foligo Analytics API on every route change.
 * Visitor and session IDs are pseudonymised (one-way HMAC hashed) before
 * storage by the Foligo API.  No IP addresses are persisted.
 *
 * Key configured via FOLIGO_ANALYTICS_KEY env var or nuxt.config runtimeConfig.
 */

const ANALYTICS_ENDPOINT = 'https://api.foligo.tech/api/analytics/events'
const VISITOR_ID_KEY = 'foligo_visitor_id'
const SESSION_ID_KEY = 'foligo_session_id'

function getOrCreateId(storage, key) {
  let id = storage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    storage.setItem(key, id)
  }
  return id
}

function sendEvent(analyticsKey, event) {
  return fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Analytics-Key': analyticsKey,
    },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    // Analytics failures must never break the site.
  })
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const analyticsKey = config.public.foligoAnalyticsKey

  if (!analyticsKey) return

  const visitorId = getOrCreateId(localStorage, VISITOR_ID_KEY)
  const sessionId = getOrCreateId(sessionStorage, SESSION_ID_KEY)

  // Send page_view on initial load
  sendEvent(analyticsKey, {
    name: 'page_view',
    visitorId,
    sessionId,
    url: window.location.href,
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer || undefined,
    timestamp: new Date().toISOString(),
  })

  // Track subsequent route changes (SPA navigation)
  const router = useRouter()
  router.afterEach((to) => {
    // Let Nuxt finish rendering the new page title
    nextTick(() => {
      sendEvent(analyticsKey, {
        name: 'page_view',
        visitorId,
        sessionId,
        url: window.location.origin + to.fullPath,
        path: to.fullPath,
        title: document.title,
        referrer: document.referrer || undefined,
        timestamp: new Date().toISOString(),
      })
    })
  })
})
