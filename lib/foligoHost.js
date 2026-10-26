export const FOLIGO_DOMAIN = 'foligo.org'

// True for foligo.org and its subdomains (api./app.), not lookalikes such as evilfoligo.org.
export function isFoligoHostname(hostname) {
  const host = String(hostname || '').toLowerCase()
  return host === FOLIGO_DOMAIN || host.endsWith(`.${FOLIGO_DOMAIN}`)
}
