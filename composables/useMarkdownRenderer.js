import MarkdownIt from 'markdown-it'

// Singleton markdown renderer instance (reused across all components)
let mdInstance = null

function getMarkdownRenderer() {
  if (!mdInstance) {
    mdInstance = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str, lang) {
      const safeLang = (lang || '').toLowerCase()
      
      // Handle mermaid diagrams - client-side only rendering
      if (safeLang === 'mermaid') {
        // Escape for display in HTML
        const escapeHtml = (s) => s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        
        // Escape for data attribute (different - need to escape quotes)
        const escapeAttr = (s) => s
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        
        // IMPORTANT: Always output plain text (same on server and client)
        // The mermaid rendering happens client-side via watchEffect in ContentRenderer
        return `<pre class="mermaid" data-mermaid-code="${escapeAttr(str)}">${escapeHtml(str)}</pre>`
      }
      
      // Preserve code blocks with language class for client-side highlighters if present
      const className = safeLang ? `language-${safeLang}` : ''
      const esc = (s) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<pre class="${className}"><code class="${className}">${esc(str)}</code></pre>`
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
      // Ensure alt attribute exists (markdown-it usually handles this, but ensure it's present)
      const altIdx = token.attrIndex('alt')
      if (altIdx < 0 || !token.attrs[altIdx][1]) {
        token.attrSet('alt', 'Content image')
      }
      return imageRender(tokens, idx, options, env, self)
    }
  }
  return mdInstance
}

export function useMarkdownRenderer() {
  const md = getMarkdownRenderer()

  const render = (content) => {
    if (!content) return ''
    // Always process through markdown to handle mermaid diagrams and other custom rendering
    return md.render(content)
  }

  const renderMermaid = async (contentRef) => {
    if (!process.client || !contentRef.value) return
    
    console.log('[renderMermaid] Starting')
    
    // Wait for mermaid to be available
    if (!window.mermaid) {
      console.log('[renderMermaid] Waiting for mermaid library...')
      // Poll for mermaid with timeout
      let attempts = 0
      while (!window.mermaid && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      if (!window.mermaid) {
        console.warn('[renderMermaid] Mermaid library not available after waiting')
        return
      }
      console.log('[renderMermaid] Mermaid library loaded')
    }
    
    // Retry finding mermaid elements in case DOM isn't ready yet
    let mermaidElements = contentRef.value.querySelectorAll('pre.mermaid:not([data-processed])')
    console.log(`[renderMermaid] Found ${mermaidElements.length} unprocessed elements`)
    
    if (mermaidElements.length === 0) {
      // Retry after a short delay in case DOM is still updating
      await new Promise(resolve => setTimeout(resolve, 100))
      mermaidElements = contentRef.value.querySelectorAll('pre.mermaid:not([data-processed])')
      console.log(`[renderMermaid] After retry: ${mermaidElements.length} elements`)
    }
    if (mermaidElements.length === 0) return
    
    // Process mermaid elements sequentially to avoid overwhelming the browser
    for (const el of mermaidElements) {
      // Skip if element already contains SVG (already rendered)
      if (el.querySelector('svg')) {
        el.setAttribute('data-processed', 'true')
        continue
      }
      
      console.log(`[renderMermaid] Processing element ${Array.from(mermaidElements).indexOf(el) + 1}`)
      
      // Get code from data attribute (set during markdown rendering)
      let code = el.getAttribute('data-mermaid-code') || el.getAttribute('data-original-code')
      console.log('[renderMermaid] Code from data attr:', code ? code.substring(0, 100) : 'NONE')
      
      // If we got code from data attribute, decode HTML entities
      if (code) {
        // Decode HTML entities from attribute
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = code
        code = (tempDiv.textContent || tempDiv.innerText || '').trim()
        console.log('[renderMermaid] Decoded code:', code.substring(0, 100))
      }
      
      // Fallback: try to get it from element content
      if (!code) {
        console.log('[renderMermaid] No data attr, trying element content')
        // Method 1: Try textContent directly (works if browser decoded HTML entities)
        code = (el.textContent || el.innerText || '').trim()
        console.log('[renderMermaid] From textContent:', code ? code.substring(0, 100) : 'NONE')
        
        // Method 2: If no code, the element might be empty or have nested elements
        if (!code) {
          // Clone and remove nested SVG/style elements that might be from previous renders
          const clone = el.cloneNode(true)
          clone.querySelectorAll('style, svg, script').forEach(child => child.remove())
          code = (clone.textContent || clone.innerText || '').trim()
          console.log('[renderMermaid] From clone:', code ? code.substring(0, 100) : 'NONE')
        }
        
        // Method 3: If still no code, try decoding innerHTML directly
        if (!code && el.innerHTML) {
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = el.innerHTML
          code = (tempDiv.textContent || tempDiv.innerText || '').trim()
          console.log('[renderMermaid] From innerHTML decode:', code ? code.substring(0, 100) : 'NONE')
        }
      }
      
      if (!code || !code.trim()) {
        console.warn('Mermaid: Skipping element with no code')
        continue
      }
      
      // Validate that this looks like mermaid code, not rendered content
      const mermaidKeywords = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 
                               'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph', 'mindmap', 'timeline',
                               'C4Context', 'C4Container', 'C4Component', 'quadrantChart', 'requirement']
      const looksLikeMermaid = mermaidKeywords.some(keyword => 
        code.toLowerCase().trim().startsWith(keyword.toLowerCase())
      )
      
      // Also check for common rendered content patterns
      const looksLikeRendered = code.includes('#mermaid-') || 
                                code.includes('<svg') || 
                                code.includes('@keyframes') ||
                                (code.includes('font-family:') && !code.includes('graph'))
      
      if (looksLikeRendered && !looksLikeMermaid) {
        console.warn('Mermaid: Skipping element with rendered content')
        continue
      }
      
      // Store original code for potential re-rendering (always update to ensure we have it)
      el.setAttribute('data-original-code', code.trim())
      
      el.setAttribute('data-processed', 'true')
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      el.id = id
      
      try {
        console.log('[renderMermaid] Calling mermaid.render with id:', id)
        console.log('[renderMermaid] Code to render:', code.substring(0, 200))
        // Code is already decoded from the data attribute
        const { svg } = await window.mermaid.render(id, code.trim())
        el.innerHTML = svg
        console.log('[renderMermaid] Successfully rendered SVG')
      } catch (error) {
        console.error('[renderMermaid] Rendering error:', error)
        // On error, show error message but keep the original code
        el.innerHTML = `<div style="color: #ef4444; padding: 1rem; border: 1px solid #ef4444; border-radius: 4px;">
          <strong>Error rendering diagram:</strong><br/>
          ${error.message}<br/>
          <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; color: #fca5a5;">Show code</summary>
            <pre style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 4px; overflow-x: auto;">${code}</pre>
          </details>
        </div>`
        // Don't remove data-processed so we don't keep retrying
        // But keep the original code for debugging
      }
    }
  }

  return {
    render,
    renderMermaid
  }
}

