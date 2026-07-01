import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { generationRoutes } from './routes/generations'
import { modelRoutes } from './routes/models'
import { proxyRoutes } from './routes/proxy'
import { adminRoutes } from './routes/admin'
import { settingsRoutes } from './routes/settings'
import { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE']
}))

app.route('/api/auth', authRoutes)
app.route('/api/generations', generationRoutes)
app.route('/api/models', modelRoutes)
app.route('/api/proxy', proxyRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/settings', settingsRoutes)

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Delete history older than 24 hours (86400 seconds)
    ctx.waitUntil(
      env.DB.prepare(
        'DELETE FROM generations WHERE created_at < unixepoch() - 86400'
      ).run()
    )
  }
}
