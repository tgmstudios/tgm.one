export default defineEventHandler(async (event) => {
  // Always use production domain for sitemap (even in dev builds for prerendering)
  // During static generation, the host header might be localhost, so we force production
  const productionDomain = 'tgm.one'
  const baseUrl = `https://${productionDomain}`

  // Static pages
  const staticPages = [
    '/',
    '/about',
    '/projects',
    '/blogs'
  ]

  // Get dynamic project pages
  // Note: We can't import projectsLoader.js directly in server routes because it imports image assets
  // Instead, we list the project keys directly (they match the keys in projectsLoader.js)
  const projectKeys = [
    'tagaby',
    'android-ota-update',
    'perfect-portion',
    'campus-calendar',
    'telaeris-website',
    'xpressrfid-ecommerce',
    'squarebrain',
    'saints-verify',
    'r2d2-replica',
    'red-bird-pantry',
    'tgm-auth',
    'tgm-mine',
    'tgmusic-bot',
    'tgmmc',
    'site-generator'
  ]
  const projectPages = projectKeys.map(key => `/project/${key}`)

  // Get blog posts from API
  let blogPages = []
  try {
    const config = useRuntimeConfig()
    const { createFoligoClient } = await import('~/lib/foligoClient.js')
    const foligo = createFoligoClient({
      foligoBaseUrl: config.public.foligoBaseUrl,
      foligoProjectId: config.public.foligoProjectId
    })
    const blogs = await foligo.getBlogs()
    blogPages = blogs.map(blog => {
      // Use slug if available, fallback to ID for backwards compatibility
      const slug = blog.slug || blog.id || blog._id || blog.contentId
      return `/blog/${slug}`
    })
  } catch (e) {
    // If blog API fails, continue without blog pages
    console.error('Failed to fetch blogs for sitemap:', e)
  }

  // Combine all pages
  const allPages = [...staticPages, ...projectPages, ...blogPages]

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'text/xml; charset=utf-8')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600')
  return sitemap
})

