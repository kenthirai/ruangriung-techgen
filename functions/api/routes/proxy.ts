import { Hono } from 'hono'
import { Env } from '../types'

export const proxyRoutes = new Hono<{ Bindings: Env }>()

proxyRoutes.all('/*', async (c) => {
  const url = new URL(c.req.url)
  const targetPath = url.pathname.replace('/api/proxy', '')
  
  const headers = new Headers(c.req.raw.headers)
  headers.delete('host')
  
  // Multi-Provider Routing
  const provider = headers.get('x-provider') || 'pollinations'
  let providerKey = headers.get('x-provider-key')
  
  headers.delete('x-provider')
  headers.delete('x-provider-key')

  // Fetch global keys from database
  let globalKeys: any = {}
  try {
    const result = await c.env.DB.prepare('SELECT value FROM site_settings WHERE key = ?')
      .bind('global_api_keys').first('value')
    if (result) globalKeys = JSON.parse(result as string)
  } catch (e) {
    // Ignore db errors
  }

  // Read body text once so we can modify and reuse it for retries
  let requestBodyText: string | null = null
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    const blob = await c.req.blob()
    requestBodyText = await blob.text()
  }

  const tryFetch = async (currentProvider: string, modelOverride?: string) => {
    let currentTargetUrl = `https://gen.pollinations.ai${targetPath}${url.search}`
    const fetchHeaders = new Headers(headers)
    fetchHeaders.delete('Authorization')
    
    let currentBody = requestBodyText
    if (modelOverride && currentBody && targetPath.includes('/v1/chat/completions')) {
      try {
        const json = JSON.parse(currentBody)
        json.model = modelOverride
        currentBody = JSON.stringify(json)
      } catch (e) {}
    }

    if (currentProvider === 'openai') {
      currentTargetUrl = `https://api.openai.com${targetPath}${url.search}`
      const key = providerKey || globalKeys.openai
      if (key) fetchHeaders.set('Authorization', `Bearer ${key}`)
    } else if (currentProvider === 'gemini') {
      let geminiPath = targetPath
      if (geminiPath.startsWith('/v1/')) {
        geminiPath = geminiPath.replace('/v1/', '/v1beta/openai/')
      }
      currentTargetUrl = `https://generativelanguage.googleapis.com${geminiPath}${url.search}`
      const key = providerKey || globalKeys.gemini
      if (key) fetchHeaders.set('Authorization', `Bearer ${key}`)
    } else if (currentProvider === 'deepseek') {
      currentTargetUrl = `https://api.deepseek.com${targetPath}${url.search}`
      const key = providerKey || globalKeys.deepseek
      if (key) fetchHeaders.set('Authorization', `Bearer ${key}`)
    } else {
      // Pollinations default
      const key = providerKey || globalKeys.pollinations || c.env.POLLINATIONS_SECRET_KEY
      if (key) {
        fetchHeaders.set('Authorization', `Bearer ${key}`)
      }
    }

    const init: RequestInit = {
      method: c.req.method,
      headers: fetchHeaders,
    }
    if (currentBody) init.body = currentBody
    
    return fetch(currentTargetUrl, init)
  }

  // 1. Initial Attempt
  let response = await tryFetch(provider)
  
  // 2. Fallback Rotation Logic (Only for text completions, and if initial provider is Pollinations)
  if (
    (!response.ok || response.status === 429 || response.status >= 500) && 
    targetPath.includes('/v1/chat/completions') && 
    provider === 'pollinations'
  ) {
    console.log(`[Smart Router] Pollinations failed (${response.status}). Initiating fallback rotation...`)
    
    const fallbackChain = [
      { provider: 'deepseek', model: 'deepseek-chat', keyExists: !!globalKeys.deepseek },
      { provider: 'gemini', model: 'gemini-1.5-flash', keyExists: !!globalKeys.gemini },
      { provider: 'openai', model: 'gpt-4o-mini', keyExists: !!globalKeys.openai }
    ]

    for (const fallback of fallbackChain) {
      if (fallback.keyExists) {
        console.log(`[Smart Router] Trying fallback: ${fallback.provider} with model ${fallback.model}`)
        const fallbackRes = await tryFetch(fallback.provider, fallback.model)
        if (fallbackRes.ok) {
          response = fallbackRes
          console.log(`[Smart Router] Fallback to ${fallback.provider} SUCCESS!`)
          break
        }
      }
    }
  }

  // We recreate the response to avoid immutable headers issues
  const newResponse = new Response(response.body, response)
  // Hono CORS middleware will add the correct CORS headers on top
  newResponse.headers.delete('access-control-allow-origin')
  
  return newResponse
})
