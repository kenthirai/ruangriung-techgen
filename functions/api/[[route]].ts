import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/cloudflare-pages'
import { authRoutes } from './routes/auth'
import { generationRoutes } from './routes/generations'
import { modelRoutes } from './routes/models'
import { proxyRoutes } from './routes/proxy'
import { adminRoutes } from './routes/admin'
import { settingsRoutes } from './routes/settings'
import { Env } from './types'

const app = new Hono<{ Bindings: Env }>().basePath('/api')

app.use('/*', cors())

app.route('/auth', authRoutes)
app.route('/generations', generationRoutes)
app.route('/models', modelRoutes)
app.route('/proxy', proxyRoutes)
app.route('/admin', adminRoutes)
app.route('/settings', settingsRoutes)

export const onRequest = handle(app)
