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

  // Generate URL-friendly slug from title
  const generateSlug = (text) => {
    if (!text) return null
    return text
      .toString()
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Replace multiple consecutive hyphens with a single hyphen
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, '')
  }

  const getBlogs = async () => {
    if (!projectId) return []
    // Retrieve content blocks for project; filter for blog-like entries if type is present
    const data = await safeFetch(`/api/projects/${projectId}/content`).catch(() => [])
    const items = Array.isArray(data) ? data : (data?.items || [])
    const filtered = items.filter((c) => {
      const type = (c.type || c.category || '').toString().toLowerCase()
      return type.includes('blog') || type.includes('post') || !type
    })
    // Generate slug from title and ensure it exists for routing
    return filtered.map((c) => {
      const title = c.title || c.name || ''
      const slug = c.slug || generateSlug(title)
      const id = normalizeId(c)
      return { 
        id, // Keep ID for backwards compatibility
        slug: slug || id || c.uid, // Use slug, fallback to ID if no slug
        ...c 
      }
    })
  }

  const getBlogBySlug = async (slug) => {
    if (!slug) return null
    // No-auth route: fetch all content for the project then select the item by slug or ID
    const data = await safeFetch(`/api/projects/${projectId}/content`).catch(() => null)
    const items = Array.isArray(data) ? data : (data?.items || [])
    const found = items.find((c) => {
      const title = c.title || c.name || ''
      const itemSlug = c.slug || generateSlug(title)
      const cid = normalizeId(c)
      // Match by slug, or by ID (for backwards compatibility)
      return itemSlug === slug || cid === slug
    })
    return found || null
  }

  // Keep getBlogById for backwards compatibility
  const getBlogById = async (id) => {
    return getBlogBySlug(id)
  }

  return { getBlogs, getBlogById, getBlogBySlug }
}


