import MarkdownIt from 'markdown-it'

const MERMAID_PLACEHOLDER_PREFIX = '__MERMAID_PLACEHOLDER__'
const MERMAID_PLACEHOLDER_REGEX = new RegExp(`<!--${MERMAID_PLACEHOLDER_PREFIX}(\\d+)-->`, 'g')

// Singleton markdown renderer instance (reused across all components)
let mdInstance = null

function createCodeBlockHtml(str, lang = '') {
  const className = lang ? `language-${lang}` : ''
  const esc = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `<pre class="${className}"><code class="${className}">${esc(str)}</code></pre>`
}

function getMarkdownRenderer() {
  if (!mdInstance) {
    mdInstance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight(str, lang) {
        const safeLang = (lang || '').toLowerCase()
        return createCodeBlockHtml(str, safeLang)
      }
    })

    // Add target/_blank and rel to external links
    const defaultLinkRender = mdInstance.renderer.rules.link_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
    mdInstance.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      const token = tokens[idx]
      const hrefIdx = token.attrIndex('href')
      const href = hrefIdx >= 0 ? token.attrs[hrefIdx][1] : ''
      const isExternal = /^https?:\/\//i.test(href)
      if (isExternal) {
        token.attrSet('target', '_blank')
        token.attrSet('rel', 'noopener noreferrer')
      }
      return defaultLinkRender(tokens, idx, options, env, self)
    }

    // Make headings linkable with ids
    function slugify(text) {
      return (text || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    }
    const headingOpen = mdInstance.renderer.rules.heading_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
    mdInstance.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
      const next = tokens[idx + 1]
      if (next && next.type === 'inline') {
        const text = next.children?.filter(t => t.type === 'text' || t.type === 'code_inline').map(t => t.content).join(' ') || ''
        const id = slugify(text)
        if (id) {
          tokens[idx].attrSet('id', id)
        }
      }
      return headingOpen(tokens, idx, options, env, self)
    }

    // Add classes to images for consistent styling and ensure alt attributes
    const imageRender = mdInstance.renderer.rules.image || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
    mdInstance.renderer.rules.image = function(tokens, idx, options, env, self) {
      const token = tokens[idx]
      token.attrJoin('class', 'rounded-lg shadow-sm')
      const altIdx = token.attrIndex('alt')
      if (altIdx < 0 || !token.attrs[altIdx][1]) {
        token.attrSet('alt', 'Content image')
      }
      return imageRender(tokens, idx, options, env, self)
    }

    const defaultFence = mdInstance.renderer.rules.fence
    mdInstance.renderer.rules.fence = function(tokens, idx, options, env, self) {
      const token = tokens[idx]
      const langInfo = (token.info || '').trim().toLowerCase()
      if (langInfo === 'mermaid') {
        env.__mermaidIndex = typeof env.__mermaidIndex === 'number' ? env.__mermaidIndex : 0
        env.mermaidBlocks = env.mermaidBlocks || []
        const index = env.__mermaidIndex
        env.__mermaidIndex += 1
        const code = token.content || ''
        const id = `mermaid-${index}`
        env.mermaidBlocks[index] = { id, code }
        return `<!--${MERMAID_PLACEHOLDER_PREFIX}${index}-->`
      }
      if (defaultFence) {
        return defaultFence(tokens, idx, options, env, self)
      }
      return createCodeBlockHtml(token.content || '', langInfo)
    }
  }
  return mdInstance
}

function splitHtmlWithMermaidPlaceholders(html, mermaidBlocks = []) {
  if (!html) return []
  const segments = []
  let lastIndex = 0
  let keyCounter = 0
  let match

  while ((match = MERMAID_PLACEHOLDER_REGEX.exec(html)) !== null) {
    const index = match.index
    if (index > lastIndex) {
      const chunk = html.slice(lastIndex, index)
      if (chunk.trim()) {
        segments.push({
          type: 'html',
          content: chunk,
          key: `html-${keyCounter++}`
        })
      }
    }

    const blockIndex = Number(match[1])
    const block = mermaidBlocks[blockIndex]
    if (block) {
      segments.push({
        type: 'mermaid',
        code: block.code,
        id: block.id,
        key: block.id
      })
    }

    lastIndex = MERMAID_PLACEHOLDER_REGEX.lastIndex
  }

  if (lastIndex < html.length) {
    const chunk = html.slice(lastIndex)
    if (chunk.trim()) {
      segments.push({
        type: 'html',
        content: chunk,
        key: `html-${keyCounter++}`
      })
    }
  }

  if (segments.length === 0 && html) {
    segments.push({
      type: 'html',
      content: html,
      key: `html-${keyCounter++}`
    })
  }

  return segments
}

function createHtmlSegmentsFromPreRenderedHtml(html) {
  if (!html) return []
  const segments = []
  const regex = /<pre class="mermaid"[\s\S]*?<\/pre>/gi
  let lastIndex = 0
  let match
  let keyCounter = 0
  let mermaidCounter = 0

  const decodeEntities = (value = '') => value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  while ((match = regex.exec(html)) !== null) {
    const index = match.index
    if (index > lastIndex) {
      const chunk = html.slice(lastIndex, index)
      if (chunk.trim()) {
        segments.push({
          type: 'html',
          content: chunk,
          key: `html-${keyCounter++}`
        })
      }
    }

    const mermaidHtml = match[0]
    const attrMatch = mermaidHtml.match(/data-mermaid-code="([^"]*)"/i)
    let code = ''

    if (attrMatch) {
      code = decodeEntities(attrMatch[1])
    } else {
      const inner = mermaidHtml
        .replace(/<\/?pre[^>]*>/gi, '')
        .replace(/<\/?code[^>]*>/gi, '')
      code = decodeEntities(inner).trim()
    }

    if (code) {
      const id = `mermaid-html-${mermaidCounter++}`
      segments.push({
        type: 'mermaid',
        code,
        id,
        key: id
      })
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < html.length) {
    const chunk = html.slice(lastIndex)
    if (chunk.trim()) {
      segments.push({
        type: 'html',
        content: chunk,
        key: `html-${keyCounter++}`
      })
    }
  }

  if (segments.length === 0 && html) {
    segments.push({
      type: 'html',
      content: html,
      key: `html-${keyCounter++}`
    })
  }

  return segments
}

export function useMarkdownRenderer() {
  const md = getMarkdownRenderer()

  return {
    render(content) {
      const markdown = content || ''
      return md.render(markdown)
    },
    renderContent(content) {
      const markdown = content || ''
      const env = { mermaidBlocks: [] }
      const html = md.render(markdown, env)
      return {
        segments: splitHtmlWithMermaidPlaceholders(html, env.mermaidBlocks)
      }
    },
    renderHtml(html) {
      return {
        segments: createHtmlSegmentsFromPreRenderedHtml(html)
      }
    }
  }
}

