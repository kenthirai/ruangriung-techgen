import { Hono } from 'hono'
import { Env } from '../types'

export const settingsRoutes = new Hono<{ Bindings: Env }>()

// Public route to get site settings (e.g. maintenance mode)
settingsRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT value FROM site_settings WHERE key = ?')
    .bind('maintenance').first('value')
    
  let maintenance = {
    isActive: false,
    startTime: '',
    endTime: '',
    contactEmail: '',
    contactPhone: '',
    facebookGroup: '',
    message: ''
  }

  if (result) {
    try {
      maintenance = JSON.parse(result as string)
    } catch (e) {
      console.error('Failed to parse maintenance settings')
    }
  }

  return c.json({ maintenance })
})
