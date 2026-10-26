// Regression: Foligo content stored with retired foligo.tech media URLs (DNS -> 127.0.0.1)
// must be rewritten to foligo.org so project images load.
// Run: node --test tests/foligo-legacy-media.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { rewriteLegacyFoligoUrls } from '../lib/foligoHost.js'
import { createFoligoClient } from '../lib/foligoClient.js'

const OLD = 'https://api.foligo.tech/api/media/790d429a-1550-44fe-94a2-df4ae2e158cf/file'
const NEW = 'https://api.foligo.org/api/media/790d429a-1550-44fe-94a2-df4ae2e158cf/file'

test('rewriteLegacyFoligoUrls rewrites strings, nested objects and markdown', () => {
  assert.equal(rewriteLegacyFoligoUrls(OLD), NEW)
  assert.equal(rewriteLegacyFoligoUrls('![x](' + OLD + ')'), '![x](' + NEW + ')')
  assert.equal(rewriteLegacyFoligoUrls('http://script.foligo.tech/a'), 'http://script.foligo.org/a')
  assert.deepEqual(rewriteLegacyFoligoUrls({ a: [OLD, { b: 'https://foligo.tech/' }], n: 3, z: null }),
    { a: [NEW, { b: 'https://foligo.org/' }], n: 3, z: null })
})

test('rewriteLegacyFoligoUrls leaves lookalike hosts and other URLs alone', () => {
  for (const u of ['https://evilfoligo.tech/x', 'https://foligo.tech.evil.com/x', 'https://api.foligo.org/x', 'https://img.youtube.com/a.jpg', '/favicon.ico'])
    assert.equal(rewriteLegacyFoligoUrls(u), u)
})

test('client getProjects/getProjectBySlug/getBlogs never expose foligo.tech URLs', async () => {
  const site = { content: {
    projects: [{ id: 'p1', title: 'Foligo', slug: 'foligo', contentType: 'PROJECT', status: 'PUBLISHED',
      featuredImage: OLD, content: `![shot](${OLD})`, metadata: { projectLinks: { other: ['https://foligo.tech/'] } } }],
    blogs: [{ id: 'b1', title: 'Post', slug: 'post', contentType: 'BLOG', status: 'PUBLISHED', content: `![a](${OLD})` }],
    experiences: [] } }
  globalThis.$fetch = async () => structuredClone(site)
  const c = createFoligoClient({ foligoBaseUrl: 'https://api.foligo.org', foligoSubdomain: 'aiden' })
  const [p] = await c.getProjects()
  assert.equal(p.featuredImage, NEW)
  assert.equal((await c.getProjectBySlug('foligo')).featuredImage, NEW)
  const all = JSON.stringify([p, await c.getBlogs()])
  assert.ok(!/foligo\.tech/.test(all), all)
})

test('absoluteUrl does not prefix site origin onto absolute image URLs (og:image / JSON-LD)', async () => {
  const { absoluteUrl } = await import('../lib/foligoHost.js')
  assert.equal(absoluteUrl('https://tgm.one', NEW), NEW)
  assert.equal(absoluteUrl('https://tgm.one', '/a.png'), 'https://tgm.one/a.png')
  assert.equal(absoluteUrl('https://tgm.one', null), 'https://tgm.one/favicon.ico')
})
