export function createFoligoClient(config) {
  // Use server proxy in dev to avoid CORS; hit Foligo directly in prod
  const isDev = typeof import.meta !== 'undefined' ? import.meta.dev : process.env.NODE_ENV !== 'production'
  const baseUrl = isDev ? '/api/foligo' : (config.foligoBaseUrl || 'https://api.foligo.tech')
  const projectId = config.foligoProjectId
  const subdomain = config.foligoSubdomain || 'aiden'

  const safeFetch = async (path, options = {}) => {
    const url = `${baseUrl}${path}`
    return await $fetch(url, { 
      ...options,
      // Add timeout and retry logic
      timeout: 10000,
      retry: 1
    })
  }

  // Fetch site data from the new API endpoint
  const getSiteData = async () => {
    const data = await safeFetch(`/api/site/${subdomain}`).catch(() => null)
    return data
  }

  const sanitizeString = (value) => {
    if (value === null || value === undefined) return null
    const str = String(value).trim()
    if (!str) return null
    const lowered = str.toLowerCase()
    if (lowered === 'null' || lowered === 'undefined' || lowered === 'nan') return null
    return str
  }

  const normalizeId = (item) => 
    sanitizeString(item?.id) || 
    sanitizeString(item?._id) || 
    sanitizeString(item?.contentId) || 
    sanitizeString(item?.uid) || 
    null

  // Helper to get all content items from site data (checks all possible content arrays)
  const getAllContentItems = (siteData) => {
    if (!siteData || !siteData.content) return []
    const content = siteData.content
    // Combine all possible content arrays
    const allItems = [
      ...(content.projects || []),
      ...(content.blogs || []),
      ...(content.experiences || []),
      ...(content.items || []), // Fallback for unified array
      ...(Array.isArray(content) ? content : []) // If content itself is an array
    ]
    // Deduplicate by ID to prevent items appearing multiple times
    const seen = new Set()
    return allItems.filter(item => {
      const id = normalizeId(item)
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })
  }

  // Helper to attach contentLinks to a content item based on its ID
  const attachContentLinks = (item, siteData) => {
    if (!item || !siteData) return item
    const itemId = normalizeId(item)
    if (!itemId) return item
    
    // Get contentLinks from siteData (could be at root level or in content object)
    const contentLinks = siteData.contentLinks || siteData.content?.contentLinks || []
    
    // Get all content items to check content types
    const allContentItems = getAllContentItems(siteData)
    const contentMap = new Map()
    allContentItems.forEach(c => {
      const id = normalizeId(c)
      if (id) {
        contentMap.set(id, c)
      }
    })
    
    // Filter links where this item is the source or target
    // Also enrich links with contentType information from linkedContent or contentMap
    const relatedLinks = contentLinks
      .filter(link => {
        return (link.sourceId === itemId || link.targetId === itemId)
      })
      .map(link => {
        // Enrich link with contentType information
        const linkedContent = link.linkedContent
        let sourceType = link.sourceType
        let targetType = link.targetType
        
        // If linkedContent is provided, use its contentType
        if (linkedContent && linkedContent.contentType) {
          if (link.targetId === itemId) {
            sourceType = linkedContent.contentType
          } else if (link.sourceId === itemId) {
            targetType = linkedContent.contentType
          }
        } else {
          // Otherwise, try to get contentType from contentMap
          const sourceContent = contentMap.get(link.sourceId)
          const targetContent = contentMap.get(link.targetId)
          if (sourceContent && sourceContent.contentType) {
            sourceType = sourceContent.contentType
          }
          if (targetContent && targetContent.contentType) {
            targetType = targetContent.contentType
          }
        }
        
        return {
          ...link,
          sourceType: sourceType || link.sourceType,
          targetType: targetType || link.targetType
        }
      })
    
    // Return item with contentLinks attached
    return {
      ...item,
      contentLinks: relatedLinks.length > 0 ? relatedLinks : (item.contentLinks || [])
    }
  }

  // Check if an item is a revision and should be filtered out
  const isRevision = (item) => {
    if (!item) return false
    // Check status field - revisions have status "REVISION"
    const status = (item.status || '').toString().toUpperCase()
    if (status === 'REVISION') return true
    // Also check if revisionOf is set (points to original item)
    if (item.revisionOf !== null && item.revisionOf !== undefined) return true
    // Check revisionNumber field
    if (item.revisionNumber !== null && item.revisionNumber !== undefined) return true
    // Fallback checks for other possible indicators
    const type = (item.type || item.category || '').toString().toLowerCase()
    const isRevisionFlag = item.isRevision === true || item.revision === true
    const isRevisionType = type.includes('revision')
    
    return isRevisionFlag || isRevisionType
  }

  // Generate URL-friendly slug from title
  const generateSlug = (text) => {
    if (!text) return null
    const slug = text
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
    return slug || null
  }

  const ensureProjectShape = (project, siteData) => {
    if (!project) return null
    const title = project.title || project.name || ''
    const baseSlug = sanitizeString(project.slug)
    const fallbackSlug = generateSlug(title)
    const id = normalizeId(project)
    const slug = baseSlug || fallbackSlug || id
    if (!slug) return null

    const itemWithLinks = attachContentLinks(project, siteData)

    return {
      ...itemWithLinks,
      id,
      slug,
      tags: itemWithLinks.tags || [],
      linkedSkills: itemWithLinks.linkedSkills || [],
      contentLinks: itemWithLinks.contentLinks || []
    }
  }

  const ensureBlogShape = (blog, siteData) => {
    if (!blog) return null
    const title = blog.title || blog.name || ''
    const baseSlug = sanitizeString(blog.slug)
    const fallbackSlug = generateSlug(title)
    const id = normalizeId(blog)
    const slug = baseSlug || fallbackSlug || id
    if (!slug) return null

    const itemWithLinks = attachContentLinks(blog, siteData)

    return {
      ...itemWithLinks,
      id,
      slug,
      tags: itemWithLinks.tags || [],
      linkedSkills: itemWithLinks.linkedSkills || [],
      contentLinks: itemWithLinks.contentLinks || []
    }
  }

  const getBlogs = async () => {
    // Fetch from new site API endpoint
    const siteData = await getSiteData()
    if (!siteData || !siteData.content) return []
    
    // Get all content items and filter for blogs
    const allItems = getAllContentItems(siteData)
    
    const filtered = allItems.filter((c) => {
      // Filter out revisions
      if (isRevision(c)) return false
      // Filter by contentType and status
      const contentType = (c.contentType || '').toString().toUpperCase()
      const status = (c.status || '').toString().toUpperCase()
      return (contentType === 'BLOG' || contentType === 'POST') && (status === 'PUBLISHED' || !status)
    })
    // Generate slug from title, attach contentLinks, and ensure it exists for routing
    return filtered
      .map((c) => ensureBlogShape(c, siteData))
      .filter(Boolean)
  }

  const getBlogBySlug = async (slug) => {
    if (!slug) return null
    // Fetch from new site API endpoint
    const siteData = await getSiteData()
    if (!siteData || !siteData.content) return null
    
    // Get all content items and filter for blogs
    const allItems = getAllContentItems(siteData)
    
    const filtered = allItems.filter((c) => {
      // Filter out revisions
      if (isRevision(c)) return false
      // Filter by contentType and status
      const contentType = (c.contentType || '').toString().toUpperCase()
      const status = (c.status || '').toString().toUpperCase()
      return (contentType === 'BLOG' || contentType === 'POST') && (status === 'PUBLISHED' || !status)
    })
    
    const sanitizedSlug = sanitizeString(slug)
    if (!sanitizedSlug) return null

    const shapedBlogs = filtered
      .map((c) => ensureBlogShape(c, siteData))
      .filter(Boolean)

    return shapedBlogs.find((blog) => {
      const cid = blog.id
      // Match by slug, or by ID (for backwards compatibility)
      return blog.slug === sanitizedSlug || (cid && cid === sanitizedSlug)
    }) || null
  }

  // Keep getBlogById for backwards compatibility
  const getBlogById = async (id) => {
    return getBlogBySlug(id)
  }

  const getProjects = async () => {
    // Fetch from new site API endpoint
    const siteData = await getSiteData()
    if (!siteData || !siteData.content) return []
    
    // Get all content items and filter for projects
    const allItems = getAllContentItems(siteData)
    
    const filtered = allItems.filter((c) => {
      // Filter out revisions
      if (isRevision(c)) return false
      // Filter by contentType and status
      const contentType = (c.contentType || '').toString().toUpperCase()
      const status = (c.status || '').toString().toUpperCase()
      return contentType === 'PROJECT' && (status === 'PUBLISHED' || !status)
    })
    // Generate slug from title and ensure it exists for routing
    return filtered
      .map((c) => ensureProjectShape(c, siteData))
      .filter(Boolean)
  }

  const getProjectBySlug = async (slug) => {
    if (!slug) return null
    // Fetch from new site API endpoint
    const siteData = await getSiteData()
    if (!siteData || !siteData.content) return null
    
    // Get all content items and filter for projects
    const allItems = getAllContentItems(siteData)
    
    const filtered = allItems.filter((c) => {
      // Filter out revisions
      if (isRevision(c)) return false
      // Filter by contentType and status
      const contentType = (c.contentType || '').toString().toUpperCase()
      const status = (c.status || '').toString().toUpperCase()
      return contentType === 'PROJECT' && (status === 'PUBLISHED' || !status)
    })
    const sanitizedSlug = sanitizeString(slug)
    if (!sanitizedSlug) return null

    const shapedProjects = filtered
      .map((c) => ensureProjectShape(c, siteData))
      .filter(Boolean)

    return shapedProjects.find((project) => {
      const cid = project.id
      return project.slug === sanitizedSlug || (cid && cid === sanitizedSlug)
    }) || null
  }

  // Keep getProjectById for backwards compatibility
  const getProjectById = async (id) => {
    return getProjectBySlug(id)
  }

  const getExperiences = async () => {
    // Fetch from new site API endpoint
    const siteData = await getSiteData()
    if (!siteData || !siteData.content) return []
    
    // Get all content items and filter for experiences
    const allItems = getAllContentItems(siteData)
    
    const filtered = allItems.filter((c) => {
      // Filter out revisions
      if (isRevision(c)) return false
      // Filter by contentType and status
      const contentType = (c.contentType || '').toString().toUpperCase()
      const status = (c.status || '').toString().toUpperCase()
      return contentType === 'EXPERIENCE' && (status === 'PUBLISHED' || !status)
    })
    // Sort by date (most recent first) if available
    return filtered
      .map((c) => ({
        ...c,
        id: normalizeId(c)
      }))
      .sort((a, b) => {
        const dateA = a.startDate || a.date || a.createdAt || ''
        const dateB = b.startDate || b.date || b.createdAt || ''
        return dateB.localeCompare(dateA)
      })
  }

  return { 
    getBlogs, 
    getBlogById, 
    getBlogBySlug,
    getProjects,
    getProjectById,
    getProjectBySlug,
    getExperiences
  }
}


