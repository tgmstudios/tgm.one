import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Read the logo file from assets
    const logoPath = join(process.cwd(), 'assets', 'logo.png')
    const logoBuffer = await readFile(logoPath)
    
    // Set appropriate headers
    event.node.res.setHeader('Content-Type', 'image/png')
    event.node.res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    
    return logoBuffer
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Logo not found'
    })
  }
})

