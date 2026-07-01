import { Hono } from 'hono'
import { Env } from '../types'

export const proxyRoutes = new Hono<{ Bindings: Env }>()

proxyRoutes.all('/*', async (c) => {
  const url = new URL(c.req.url)
  const targetPath = url.pathname.replace('/api/proxy', '')
  const targetUrl = `https://gen.pollinations.ai${targetPath}${url.search}`
  
  const headers = new Headers(c.req.raw.headers)
  headers.delete('host')
  
  // If no authorization is provided by the frontend, inject the server's secret key
  if (!headers.has('Authorization') && c.env.POLLINATIONS_SECRET_KEY) {
    headers.set('Authorization', `Bearer ${c.env.POLLINATIONS_SECRET_KEY}`)
  }

  const reqInit: RequestInit = {
    method: c.req.method,
    headers,
  }

  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    reqInit.body = await c.req.blob()
  }

  const response = await fetch(targetUrl, reqInit)
  
  // We recreate the response to avoid immutable headers issues
  const newResponse = new Response(response.body, response)
  // Hono CORS middleware will add the correct CORS headers on top
  newResponse.headers.delete('access-control-allow-origin')
  
  return newResponse
})
