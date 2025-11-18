import { computed, ref, onMounted, onUnmounted } from 'vue'

export function useTableOfContents() {
  const headings = ref([])
  const activeHeading = ref('')

  // Extract headings from markdown content
  const extractHeadings = (content) => {
    if (!content) return []
    
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extracted = []
    let match
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = slugify(text)
      
      extracted.push({
        level,
        text,
        id
      })
    }
    
    return extracted
  }

  // Extract headings from HTML/DOM
  const extractHeadingsFromDOM = () => {
    if (typeof document === 'undefined') return []
    
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const extracted = []
    
    headingElements.forEach((el) => {
      const id = el.id || slugify(el.textContent)
      if (id) {
        // Ensure the element has an ID
        if (!el.id) {
          el.id = id
        }
        
        extracted.push({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent.trim(),
          id
        })
      }
    })
    
    return extracted
  }

  // Slugify function (same as in markdown renderer)
  const slugify = (text) => {
    return (text || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  // Update active heading based on scroll position
  const updateActiveHeading = () => {
    if (typeof window === 'undefined' || headings.value.length === 0) return
    
    const scrollPosition = window.scrollY + 100 // Offset for header
    
    // Find the heading that's currently in view
    let current = ''
    for (let i = headings.value.length - 1; i >= 0; i--) {
      const element = document.getElementById(headings.value[i].id)
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= scrollPosition) {
          current = headings.value[i].id
          break
        }
      }
    }
    
    activeHeading.value = current
  }

  // Scroll to heading
  const scrollToHeading = (id) => {
    if (typeof document === 'undefined') return
    
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Setup scroll listener
  let scrollListener = null
  
  const setupScrollListener = () => {
    if (typeof window === 'undefined') return
    scrollListener = () => updateActiveHeading()
    window.addEventListener('scroll', scrollListener, { passive: true })
  }

  const removeScrollListener = () => {
    if (typeof window === 'undefined' || !scrollListener) return
    window.removeEventListener('scroll', scrollListener)
  }

  onMounted(() => {
    setupScrollListener()
    // Initial update after a short delay to ensure DOM is ready
    setTimeout(() => {
      updateActiveHeading()
    }, 100)
  })

  onUnmounted(() => {
    removeScrollListener()
  })

  return {
    headings,
    activeHeading,
    extractHeadings,
    extractHeadingsFromDOM,
    scrollToHeading,
    updateActiveHeading
  }
}

