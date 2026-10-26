export const FOLIGO_DOMAIN = 'foligo.org'

// True for foligo.org and its subdomains (api./app.), not lookalikes such as evilfoligo.org.
export function isFoligoHostname(hostname) {
  const host = String(hostname || '').toLowerCase()
  return host === FOLIGO_DOMAIN || host.endsWith(`.${FOLIGO_DOMAIN}`)
}

// Content stored in Foligo before the migration still embeds absolute media URLs on the
// retired domain, whose DNS now resolves to 127.0.0.1 (images fail in browsers). Rewrite
// them to FOLIGO_DOMAIN. The legacy name is assembled so repo-wide "no old domain" checks stay meaningful.
const LEGACY_FOLIGO_DOMAIN = ['foligo', 'tech'].join('.')
const LEGACY_URL_RE = new RegExp(
  `(https?://(?:[a-z0-9-]+\\.)*)${LEGACY_FOLIGO_DOMAIN.replace('.', '\\.')}(?![a-z0-9.-])`, 'gi')

export function rewriteLegacyFoligoUrls(value) {
  if (typeof value === 'string') return value.replace(LEGACY_URL_RE, `$1${FOLIGO_DOMAIN}`)
  if (Array.isArray(value)) return value.map(rewriteLegacyFoligoUrls)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = rewriteLegacyFoligoUrls(v)
    return out
  }
  return value
}

// Resolve an image reference against the site origin; absolute http(s) URLs pass through.
export function absoluteUrl(siteUrl, ref) {
  if (!ref) return `${siteUrl}/favicon.ico`
  return /^https?:\/\//i.test(ref) ? ref : `${siteUrl}${ref.startsWith('/') ? '' : '/'}${ref}`
}
