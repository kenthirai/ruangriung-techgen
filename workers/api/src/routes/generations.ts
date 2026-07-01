import { Hono } from 'hono'
import { Env } from '../types'

export const generationRoutes = new Hono<{ Bindings: Env }>()

// Get generation history
generationRoutes.get('/history', async (c) => {
  const sessionId = c.req.query('session_id')
  if (!sessionId) return c.json({ error: 'session_id required' }, 400)

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM generations WHERE session_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(sessionId).all()
  
  return c.json({ data: results })
})

// Clear all history for a session (optionally filtered by type)
generationRoutes.delete('/history', async (c) => {
  const sessionId = c.req.query('session_id')
  const type = c.req.query('type')
  if (!sessionId) return c.json({ error: 'session_id required' }, 400)

  if (type) {
    await c.env.DB.prepare('DELETE FROM generations WHERE session_id = ? AND type = ?')
      .bind(sessionId, type).run()
  } else {
    await c.env.DB.prepare('DELETE FROM generations WHERE session_id = ?')
      .bind(sessionId).run()
  }
  
  return c.json({ success: true })
})

// Save new generation
generationRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const id = crypto.randomUUID()
  
  await c.env.DB.prepare(
    `INSERT INTO generations (id, session_id, type, model, prompt, result_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, unixepoch())`
  ).bind(
    id, 
    body.session_id, 
    body.type, 
    body.model, 
    body.prompt, 
    body.result_url || null
  ).run()

  return c.json({ success: true, id })
})

// Toggle favorite
generationRoutes.post('/:id/favorite', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const isFavorite = body.is_favorite ? 1 : 0

  await c.env.DB.prepare(
    'UPDATE generations SET is_favorite = ? WHERE id = ?'
  ).bind(isFavorite, id).run()

  return c.json({ success: true, id, favorite: isFavorite === 1 })
})

// Delete a single generation
generationRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  
  await c.env.DB.prepare('DELETE FROM generations WHERE id = ?')
    .bind(id).run()
    
  return c.json({ success: true, id })
})
