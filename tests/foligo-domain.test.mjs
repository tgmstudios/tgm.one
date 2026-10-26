// Regression: Foligo integration must use foligo.org, never the retired foligo.tech.
// Run: node --test tests/foligo-domain.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { isFoligoHostname } from '../lib/foligoHost.js'

test('isFoligoHostname matches foligo.org and subdomains only', () => {
  for (const h of ['foligo.org', 'api.foligo.org', 'app.foligo.org', 'API.Foligo.org']) assert.ok(isFoligoHostname(h), h)
  for (const h of ['foligo.tech', 'api.foligo.tech', 'evilfoligo.org', 'foligo.org.evil.com', '', undefined]) assert.ok(!isFoligoHostname(h), String(h))
})

test('no tracked file references foligo.tech', () => {
  const root = new URL('..', import.meta.url).pathname
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString().split('\0')
    .filter((f) => f && f !== 'pnpm-lock.yaml' && f !== 'tests/foligo-domain.test.mjs' && !/\.(png|jpe?g|webp|ico|woff2?|gif|svg)$/i.test(f))
  const offenders = files.filter((f) => { try { return /foligo\.tech/i.test(readFileSync(root + f, 'utf8')) } catch { return false } })
  assert.deepEqual(offenders, [])
})

test('default API base is api.foligo.org', () => {
  const root = new URL('..', import.meta.url).pathname
  assert.match(readFileSync(root + 'nuxt.config.ts', 'utf8'), /FOLIGO_BASE_URL \|\| 'https:\/\/api\.foligo\.org'/)
  assert.match(readFileSync(root + 'lib/foligoClient.js', 'utf8'), /'https:\/\/api\.foligo\.org'/)
})
