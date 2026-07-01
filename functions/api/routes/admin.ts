import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { Env } from '../types'

export const adminRoutes = new Hono<{ Bindings: Env }>()

// Middleware to check JWT admin token
adminRoutes.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    return await next()
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.split(' ')[1]
  const secret = c.env.JWT_SECRET || c.env.ADMIN_PASSWORD || 'default_secret_for_dev'
  
  try {
    const payload = await verify(token, secret, 'HS256')
    // Pass payload to handlers
    c.set('jwtPayload', payload)
    await next()
  } catch (err: any) {
    console.error('JWT Verification failed:', err)
    return c.json({ 
      error: 'Unauthorized: Invalid token', 
      details: err.message,
      secretLength: secret ? secret.length : 0,
      tokenPrefix: token ? token.substring(0, 10) : 'none'
    }, 401)
  }
})

// Middleware to check superadmin
const requireSuperAdmin = async (c: any, next: any) => {
  const payload = c.get('jwtPayload')
  if (payload.role !== 'superadmin') {
    return c.json({ error: 'Forbidden: Superadmin only' }, 403)
  }
  await next()
}

// Get system stats
adminRoutes.get('/stats', async (c) => {
  const totalGenerations = await c.env.DB.prepare('SELECT COUNT(*) as count FROM generations').first('count')
  const last24hGenerations = await c.env.DB.prepare('SELECT COUNT(*) as count FROM generations WHERE created_at >= unixepoch() - 86400').first('count')
  const activeSessions = await c.env.DB.prepare('SELECT COUNT(DISTINCT session_id) as count FROM generations WHERE created_at >= unixepoch() - 86400').first('count')
  
  const typeBreakdownResult = await c.env.DB.prepare('SELECT type, COUNT(*) as count FROM generations GROUP BY type').all()
  const typeBreakdown = typeBreakdownResult.results.reduce((acc: any, row: any) => {
    acc[row.type] = row.count
    return acc
  }, {})

  return c.json({
    totalGenerations,
    last24hGenerations,
    activeSessions,
    typeBreakdown
  })
})

// Get all generations globally
adminRoutes.get('/generations', async (c) => {
  const limit = parseInt(c.req.query('limit') || '50', 10)
  const offset = parseInt(c.req.query('offset') || '0', 10)
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM generations ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all()
  
  const total = await c.env.DB.prepare('SELECT COUNT(*) as count FROM generations').first('count')
  
  return c.json({ data: results, total })
})

// Update maintenance settings
adminRoutes.put('/settings/maintenance', async (c) => {
  const body = await c.req.json()
  
  const maintenance = {
    isActive: !!body.isActive,
    startTime: body.startTime || '',
    endTime: body.endTime || '',
    contactEmail: body.contactEmail || '',
    contactPhone: body.contactPhone || '',
    facebookGroup: body.facebookGroup || '',
    message: body.message || ''
  }
  
  await c.env.DB.prepare('UPDATE site_settings SET value = ? WHERE key = ?')
    .bind(JSON.stringify(maintenance), 'maintenance').run()
    
  return c.json({ success: true, maintenance })
})

// Update banner settings
adminRoutes.put('/settings/banner', async (c) => {
  const body = await c.req.json()
  
  const banner = {
    isActive: !!body.isActive,
    title: body.title || '',
    message: body.message || '',
    imageUrl: body.imageUrl || '',
    buttonText: body.buttonText || '',
    buttonLink: body.buttonLink || ''
  }
  
  await c.env.DB.prepare('UPDATE site_settings SET value = ? WHERE key = ?')
    .bind(JSON.stringify(banner), 'event_banner').run()
    
  return c.json({ success: true, banner })
})

// Get global API keys (Superadmin only for extra security)
adminRoutes.get('/settings/keys', requireSuperAdmin, async (c) => {
  const result = await c.env.DB.prepare('SELECT value FROM site_settings WHERE key = ?')
    .bind('global_api_keys').first('value')
    
  let keys = { pollinations: '', openai: '', gemini: '', deepseek: '' }
  if (result) {
    try {
      keys = JSON.parse(result as string)
    } catch (e) {}
  }
  
  return c.json({ keys })
})

// Update global API keys (Superadmin only)
adminRoutes.put('/settings/keys', requireSuperAdmin, async (c) => {
  const body = await c.req.json()
  
  const keys = {
    pollinations: body.pollinations || '',
    openai: body.openai || '',
    gemini: body.gemini || '',
    deepseek: body.deepseek || ''
  }
  
  // Make sure the row exists first by checking
  const exists = await c.env.DB.prepare('SELECT 1 FROM site_settings WHERE key = ?').bind('global_api_keys').first()
  if (exists) {
    await c.env.DB.prepare('UPDATE site_settings SET value = ? WHERE key = ?')
      .bind(JSON.stringify(keys), 'global_api_keys').run()
  } else {
    await c.env.DB.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)')
      .bind('global_api_keys', JSON.stringify(keys)).run()
  }
    
  return c.json({ success: true, keys })
})

// === Admin Management (Superadmin Only) ===

// Get all admins
adminRoutes.get('/admins', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT email, name, avatar_url, role, expires_at, created_at, last_login FROM admins ORDER BY created_at DESC').all()
  return c.json({ admins: results })
})

// Add an admin
adminRoutes.post('/admins', requireSuperAdmin, async (c) => {
  const body = await c.req.json()
  const { email, role, expires_at } = body
  
  if (!email || !role) {
    return c.json({ error: 'Email and role are required' }, 400)
  }
  
  try {
    await c.env.DB.prepare(
      'INSERT INTO admins (email, role, expires_at) VALUES (?, ?, ?)'
    ).bind(email, role, expires_at || null).run()
    return c.json({ success: true })
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Admin already exists' }, 400)
    }
    return c.json({ error: err.message }, 500)
  }
})

// Update an admin
adminRoutes.put('/admins/:email', requireSuperAdmin, async (c) => {
  const emailParam = c.req.param('email')
  const body = await c.req.json()
  const { role, expires_at } = body
  
  if (emailParam === 'arekgresikid@gmail.com') {
    return c.json({ error: 'Cannot modify primary superadmin' }, 400)
  }
  
  await c.env.DB.prepare(
    'UPDATE admins SET role = ?, expires_at = ? WHERE email = ?'
  ).bind(role, expires_at || null, emailParam).run()
  
  return c.json({ success: true })
})

// Delete an admin
adminRoutes.delete('/admins/:email', requireSuperAdmin, async (c) => {
  const emailParam = c.req.param('email')
  
  if (emailParam === 'arekgresikid@gmail.com') {
    return c.json({ error: 'Cannot delete primary superadmin' }, 400)
  }
  
  await c.env.DB.prepare('DELETE FROM admins WHERE email = ?').bind(emailParam).run()
  return c.json({ success: true })
})
