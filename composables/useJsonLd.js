// JSON-LD structured data helpers for SEO
export function useJsonLd() {
  const route = useRoute()
  const siteUrl = 'https://tgm.one'

  // Inject JSON-LD script into head
  function injectJsonLd(schema) {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema, null, 0),
          tagPriority: 'high'
        }
      ]
    })
  }

  // Person schema for /about page (and as global entity)
  function personSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${siteUrl}/about/#person`,
      name: 'Aiden Johnson',
      givenName: 'Aiden',
      familyName: 'Johnson',
      url: siteUrl,
      jobTitle: 'Software Developer',
      worksFor: [
        {
          '@type': 'Organization',
          name: 'Telaeris, Inc.',
          url: 'https://telaeris.com'
        }
      ],
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Penn State University',
        url: 'https://www.psu.edu'
      },
      sameAs: [
        'https://github.com/tgmstudios',
        'https://www.linkedin.com/in/aiden-johnson-cs/',
        'https://www.instagram.com/tgmstudios_/'
      ],
      description: 'Software developer focused on building practical, reliable systems — from AI and IoT to web platforms and infrastructure.',
      knowsAbout: [
        'Software Development',
        'IoT',
        'Web Platforms',
        'Infrastructure',
        'Systems Design',
        'Container Orchestration',
        'Kubernetes',
        'Cybersecurity',
        'Machine Learning'
      ],
      image: `${siteUrl}/og-image.png`
    }
  }

  // Article schema for blog posts
  function articleSchema({ title, description, datePublished, dateModified, author, url }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}/#article`,
      headline: title,
      description: description || '',
      datePublished: datePublished,
      dateModified: dateModified || datePublished,
      author: {
        '@type': 'Person',
        name: author || 'Aiden Johnson',
        url: `${siteUrl}/about/`
      },
      publisher: {
        '@type': 'Person',
        name: 'Aiden Johnson',
        url: siteUrl
      },
      url: url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      },
      image: `${siteUrl}/og-image.png`
    }
  }

  // WebSite schema for homepage
  function webSiteSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'TGM.One',
      description: 'Portfolio and blog of Aiden Johnson — software developer building complete systems from design to deployment.',
      author: {
        '@id': `${siteUrl}/about/#person`
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
  }

  // BreadcrumbList schema
  function breadcrumbSchema(items) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  }

  // Project/CreativeWork schema
  function projectSchema({ title, description, url, dateCreated, image }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${url}/#creativework`,
      name: title,
      description: description || '',
      url: url,
      dateCreated: dateCreated,
      author: {
        '@id': `${siteUrl}/about/#person`
      },
      image: image || `${siteUrl}/og-image.png`
    }
  }

  return {
    injectJsonLd,
    personSchema,
    articleSchema,
    webSiteSchema,
    breadcrumbSchema,
    projectSchema
  }
}
