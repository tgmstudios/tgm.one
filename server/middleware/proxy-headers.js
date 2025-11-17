/**
 * Server middleware to handle reverse proxy headers
 * This ensures that when behind a reverse proxy, the application correctly
 * detects HTTPS and uses the correct protocol for redirects and URLs
 * 
 * This middleware runs on every request in production when using Nitro server
 * (required for ISR pages like /projects, /blogs, /project/**, /blog/**)
 */
export default defineEventHandler((event) => {
  const headers = event.node.req.headers
  
  // Check for X-Forwarded-Proto header (set by reverse proxy)
  const forwardedProto = headers['x-forwarded-proto'] || headers['x-forwarded-protocol']
  const forwardedHost = headers['x-forwarded-host'] || headers['host']
  const forwardedFor = headers['x-forwarded-for']
  const forwardedPort = headers['x-forwarded-port']
  
  // If we're behind a reverse proxy, update the request to reflect the original protocol
  if (forwardedProto) {
    // Normalize the protocol (handle comma-separated values from multiple proxies)
    const protocol = forwardedProto.split(',')[0].trim().toLowerCase()
    
    // Set the protocol based on X-Forwarded-Proto
    // This ensures Nuxt/Nitro generates URLs with the correct protocol
    if (protocol === 'https') {
      // Store original protocol info in event context for use in the app
      event.context.proxyProtocol = 'https'
      event.context.proxyHost = forwardedHost
      
      // Update the request URL scheme if possible
      if (event.node.req.url && event.node.req.url.startsWith('http://')) {
        event.node.req.url = event.node.req.url.replace('http://', 'https://')
      }
    }
    
    // Set headers that Nitro will respect for URL generation
    if (forwardedHost) {
      event.node.req.headers['host'] = forwardedHost
    }
    
    // Ensure X-Forwarded-Proto is set correctly (single value, lowercase)
    event.node.req.headers['x-forwarded-proto'] = protocol
    
    // Set port if provided
    if (forwardedPort) {
      event.node.req.headers['x-forwarded-port'] = forwardedPort
    }
  }
  
  // If X-Forwarded-For is present, we're definitely behind a proxy
  if (forwardedFor) {
    event.context.isBehindProxy = true
  }
  
  // Store protocol in context for use by Nuxt's URL generation
  if (forwardedProto) {
    const protocol = forwardedProto.split(',')[0].trim().toLowerCase()
    event.context.url = event.context.url || {}
    event.context.url.protocol = protocol === 'https' ? 'https:' : 'http:'
  }
})

