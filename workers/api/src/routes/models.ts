import { Hono } from 'hono'
import { Env } from '../types'

export const modelRoutes = new Hono<{ Bindings: Env }>()

modelRoutes.get('/', async (c) => {
  // Let's implement caching strategy:
  // 1. Try to get models from D1
  const { results: cachedModels } = await c.env.DB.prepare('SELECT * FROM models_cache WHERE updated_at > unixepoch() - 86400').all()
  
  if (cachedModels && cachedModels.length > 0) {
    return c.json({ data: cachedModels, source: 'cache' })
  }

  // 2. If not in D1 or expired, fetch from Pollinations
  try {
    const res = await fetch('https://gen.pollinations.ai/models')
    const models = await res.json()
    
    // Save to D1 (fire and forget)
    c.executionCtx.waitUntil(
      (async () => {
        const stmt = c.env.DB.prepare('INSERT OR REPLACE INTO models_cache (id, name, type, updated_at) VALUES (?, ?, ?, unixepoch())')
        const batch = []
        // Process text and image models
        if (Array.isArray(models)) {
          for (const m of models) {
            batch.push(stmt.bind(m.name, m.name, m.type || 'image'))
          }
        }
        if (batch.length > 0) await c.env.DB.batch(batch)
      })()
    )

    return c.json({ data: models, source: 'api' })
  } catch (error) {
    return c.json({ error: 'Failed to fetch models' }, 500)
  }
})

modelRoutes.get('/:type', async (c) => {
  const type = c.req.param('type')
  const { results: cachedModels } = await c.env.DB.prepare('SELECT * FROM models_cache WHERE type = ?').bind(type).all()
  
  if (cachedModels && cachedModels.length > 0) {
    return c.json({ data: cachedModels })
  }

  // Fallback to fetch
  try {
    const res = await fetch(`https://gen.pollinations.ai/models`)
    const models = await res.json()
    // Filter by type
    const filtered = Array.isArray(models) ? models.filter((m: any) => m.type === type) : []
    return c.json({ data: filtered })
  } catch (error) {
    return c.json({ data: [] })
  }
})
