import { onMounted, onBeforeUnmount } from 'vue'

/** Keep SSR for SEO, then revalidate from the browser (also after focus/reconnect). */
export function useFoligoData(key, handler, options = {}) {
  let lastValue
  let lastRoute
  const route = useRoute()
  const asyncData = useAsyncData(key, async () => {
    const requestRoute = route.fullPath
    try {
      const value = await handler()
      lastValue = value
      lastRoute = requestRoute
      return value
    } catch (error) {
      // Preserve content only for this URL; never show the previous slug's content.
      if (import.meta.client && lastValue != null && lastRoute === requestRoute) return lastValue
      throw error
    }
  }, options)

  // Register synchronously: awaiting useAsyncData inside this wrapper loses Vue's instance.
  const refreshWhenAvailable = () => { void asyncData.refresh() }
  onMounted(() => {
    if (asyncData.data.value != null) {
      lastValue = asyncData.data.value
      lastRoute = route.fullPath
    }
    refreshWhenAvailable()
    window.addEventListener('online', refreshWhenAvailable)
    window.addEventListener('focus', refreshWhenAvailable)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('online', refreshWhenAvailable)
    window.removeEventListener('focus', refreshWhenAvailable)
  })
  return asyncData
}
