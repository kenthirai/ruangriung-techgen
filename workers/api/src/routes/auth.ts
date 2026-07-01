import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { Env } from '../types'

export const authRoutes = new Hono<{ Bindings: Env }>()

authRoutes.post('/login/google', async (c) => {
  try {
    const { credential } = await c.req.json()
    
    if (!credential) {
      return c.json({ success: false, message: 'No credential provided' }, 400)
    }

    // Verify token with Google
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    const payload = await response.json() as any

    if (!response.ok || !payload.email) {
      return c.json({ success: false, message: 'Invalid Google token' }, 401)
    }

    const email = payload.email
    const name = payload.name
    const picture = payload.picture

    // Check if user is an admin
    const adminQuery = await c.env.DB.prepare('SELECT * FROM admins WHERE email = ?')
      .bind(email)
      .first()

    if (!adminQuery) {
      return c.json({ success: false, message: 'Unauthorized. Not an admin.' }, 403)
    }

    // If expires_at is set, check if it's expired
    if (adminQuery.expires_at) {
      const now = Math.floor(Date.now() / 1000)
      if (now > (adminQuery.expires_at as number)) {
        return c.json({ success: false, message: 'Admin access expired.' }, 403)
      }
    }

    // Generate JWT token
    const secret = c.env.JWT_SECRET || c.env.ADMIN_PASSWORD || 'default_secret_for_dev'
    const token = await sign({
      email: adminQuery.email,
      role: adminQuery.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    }, secret)

    return c.json({
      success: true,
      token,
      user: {
        email: adminQuery.email,
        name: name || adminQuery.name,
        picture: picture || adminQuery.avatar_url,
        role: adminQuery.role
      }
    })
  } catch (error: any) {
    console.error('Google login error:', error)
    return c.json({ success: false, message: error.message }, 500)
  }
})

// BYOP key save
authRoutes.post('/byop', async (c) => {
  const body = await c.req.json()
  return c.json({ success: true, keySaved: true })
})
