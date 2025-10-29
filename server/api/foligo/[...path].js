export default defineEventHandler(async (event) => {
  const params = event.context.params || {}
  const pathParam = params.path
  const path = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '')

  const method = event.node.req.method || 'GET'
  const query = getQuery(event)
  const body = method !== 'GET' && method !== 'HEAD' ? await readBody(event) : undefined

  const config = useRuntimeConfig()
  const baseUrl = config.public.foligoBaseUrl || 'https://api.foligo.tech'
  const url = `${baseUrl}/${path}`

  try {
    const result = await $fetch(url, {
      method,
      query,
      body
    })
    return result
  } catch (err) {
    // Bubble up status when possible
    const status = err?.response?.status || 500
    setResponseStatus(event, status)
    return { error: true, message: err?.message || 'Proxy error' }
  }
})


