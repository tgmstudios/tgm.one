import test from 'node:test'
import assert from 'node:assert/strict'
import { createFoligoClient } from '../lib/foligoClient.js'

test('project and blog lookups fetch fresh Foligo site content', async () => {
  const requests = []
  globalThis.$fetch = async (url) => {
    requests.push(url)
    return { content: { projects: [{ id: 'p1', slug: 'known-project', title: 'Live project', contentType: 'PROJECT', status: 'PUBLISHED' }], blogs: [{ id: 'b1', slug: 'known-blog', title: 'Live blog', contentType: 'BLOG', status: 'PUBLISHED' }] } }
  }
  try {
    const client = createFoligoClient({ foligoBaseUrl: 'https://api.foligo.org', foligoSubdomain: 'aiden' })
    assert.equal((await client.getProjectBySlug('known-project')).title, 'Live project')
    assert.equal((await client.getBlogBySlug('known-blog')).title, 'Live blog')
    assert.equal(requests.length, 2, 'each lookup re-fetches current site data')
  } finally { delete globalThis.$fetch }
})

test('a genuine missing project remains distinguishable from an upstream failure', async () => {
  globalThis.$fetch = async () => ({ content: { projects: [], blogs: [] } })
  try {
    const client = createFoligoClient({ foligoBaseUrl: 'https://api.foligo.org', foligoSubdomain: 'aiden' })
    assert.equal(await client.getProjectBySlug('missing'), null)
  } finally { delete globalThis.$fetch }
})

test('upstream site API failure is surfaced, not converted into a false 404', async () => {
  globalThis.$fetch = async () => { throw new Error('Foligo unavailable') }
  try {
    const client = createFoligoClient({ foligoBaseUrl: 'https://api.foligo.org', foligoSubdomain: 'aiden' })
    await assert.rejects(client.getProjectBySlug('known-project'), /Foligo unavailable/)
  } finally { delete globalThis.$fetch }
})
