export function createFoligoClient(config) {
  // Use server proxy in dev to avoid CORS; hit Foligo directly in prod
  const isDev = typeof import.meta !== 'undefined' ? import.meta.dev : process.env.NODE_ENV !== 'production'
  const baseUrl = isDev ? '/api/foligo' : (config.foligoBaseUrl || 'https://api.foligo.tech')
  const projectId = config.foligoProjectId

  const safeFetch = async (path, options = {}) => {
    const url = `${baseUrl}${path}`
    return await $fetch(url, { ...options })
  }

  const normalizeId = (item) => item?.id || item?._id || item?.contentId || null

  const getBlogs = async () => {
    if (!projectId) return []
    // Retrieve content blocks for project; filter for blog-like entries if type is present
    const data = await safeFetch(`/api/projects/${projectId}/content`).catch(() => [])
    const items = Array.isArray(data) ? data : (data?.items || [])
    const filtered = items.filter((c) => {
      const type = (c.type || c.category || '').toString().toLowerCase()
      return type.includes('blog') || type.includes('post') || !type
    })
    // ensure an `id` field exists for routing
    return filtered.map((c) => ({ id: normalizeId(c) || c.slug || c.uid, ...c }))
  }

  const getBlogById = async (id) => {
    if (!id) return null
    // No-auth route: fetch all content for the project then select the item
    const data = await safeFetch(`/api/projects/${projectId}/content`).catch(() => null)
    const items = Array.isArray(data) ? data : (data?.items || [])
    const found = items.find((c) => {
      const cid = normalizeId(c)
      return cid === id
    })
    return found || null
  }

  return { getBlogs, getBlogById }
}


