import { useAuthStore } from '../stores/authStore'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'
const API_BASE = `${WORKER_URL}/api/proxy`

function getHeaders() {
  const apiKey = useAuthStore.getState().apiKey
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }
  return headers
}

export async function generateText(messages: {role: string, content: string}[], model: string, systemPrompt?: string) {
  const payloadMessages = []
  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt })
  }
  payloadMessages.push(...messages)

  const res = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      messages: payloadMessages
    })
  })

  if (!res.ok) throw new Error('Failed to generate text')
  const data = await res.json()
  return data.choices[0].message.content
}

export function generateAudio(text: string, voice: string = 'sage') {
  let url = `${API_BASE}/audio/${encodeURIComponent(text)}?voice=${voice}`
  const apiKey = useAuthStore.getState().apiKey
  if (apiKey) url += `&key=${apiKey}`
  return url
}

export function generateVideo(prompt: string, model: string = 'wan-fast', duration: number = 5, width: number = 1024, height: number = 1024) {
  let url = `${API_BASE}/video/${encodeURIComponent(prompt)}?model=${model}&duration=${duration}&width=${width}&height=${height}`
  const apiKey = useAuthStore.getState().apiKey
  if (apiKey) url += `&key=${apiKey}`
  return url
}

export function generateImage(prompt: string, model: string = 'flux', width: number = 1024, height: number = 1024, seed?: number, enhance: boolean = true, isPrivate: boolean = false, referenceImage?: string) {
  const actualSeed = seed !== undefined ? seed : Math.floor(Math.random() * 1000000)
  let url = `${API_BASE}/image/${encodeURIComponent(prompt)}?seed=${actualSeed}&nologo=true&enhance=${enhance}&model=${model}&width=${width}&height=${height}`
  if (isPrivate) {
    url += '&private=true'
  }
  if (referenceImage) {
    url += `&image=${encodeURIComponent(referenceImage)}`
  }
  const apiKey = useAuthStore.getState().apiKey
  if (apiKey) url += `&key=${apiKey}`
  return url
}

export async function translatePromptToEnglish(prompt: string): Promise<string> {
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: 'You are a translator. Translate the following text to English. Output ONLY the English translation and nothing else. If it is already in English, return it exactly as is.' },
          { role: 'user', content: prompt }
        ]
      })
    })
    
    if (res.ok) {
      const translation = await res.text()
      return translation.trim() || prompt
    }
    return prompt
  } catch (err) {
    console.error('Translation failed', err)
    return prompt
  }
}

export async function generateEmbeddings(text: string, model: string = 'openai', dimensions?: number) {
  const body: any = {
    model,
    input: text
  }
  if (dimensions) {
    body.dimensions = dimensions
  }
  
  const res = await fetch(`${API_BASE}/v1/embeddings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!res.ok) throw new Error('Failed to generate embeddings')
  const data = await res.json()
  return data.data[0].embedding
}

export async function fetchModels(type: string) {
  // Using direct Pollinations endpoints per specification
  const typeMap: Record<string, string> = {
    text: 'text',
    image: 'image', // also returns video models
    video: 'image',
    audio: 'audio',
    embedding: 'embeddings' // note the plural
  }
  
  const endpointType = typeMap[type] || type
  const res = await fetch(`https://gen.pollinations.ai/${endpointType}/models`)
  
  if (!res.ok) throw new Error('Failed to fetch models')
  
  const json = await res.json()
  
  // Ensure we only return models that match the specific type requested
  // Since /image/models returns BOTH image and video models, we filter them.
  if (Array.isArray(json)) {
    return json.filter((m: any) => m.type === type || type === 'embedding' || m.category === type)
  }
  
  return json || []
}

export async function fetchHistory(sessionId: string) {
  const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'
  const res = await fetch(`${WORKER_URL}/api/generations/history?session_id=${sessionId}`)
  if (!res.ok) throw new Error('Failed to fetch history')
  const json = await res.json()
  return json.data || []
}

export async function saveGeneration(data: { session_id: string, type: string, model: string, prompt: string, result_url?: string }) {
  const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'
  const res = await fetch(`${WORKER_URL}/api/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to save generation')
  return await res.json()
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'
  const res = await fetch(`${WORKER_URL}/api/generations/${id}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_favorite: isFavorite })
  })
  if (!res.ok) throw new Error('Failed to toggle favorite')
  return await res.json()
}

export async function deleteGeneration(id: string) {
  const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'
  const res = await fetch(`${WORKER_URL}/api/generations/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete generation')
  return await res.json()
}

export async function clearHistory(sessionId: string, type?: string) {
  const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'
  let url = `${WORKER_URL}/api/generations/history?session_id=${sessionId}`
  if (type) {
    url += `&type=${type}`
  }
  const res = await fetch(url, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to clear history')
  return await res.json()
}

export async function uploadMedia(file: File) {
  const apiKey = useAuthStore.getState().apiKey
  if (!apiKey) {
    throw new Error('API Key is required to upload media. Please set it in settings.')
  }
  
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await fetch('https://media.pollinations.ai/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  })
  
  if (!res.ok) throw new Error('Failed to upload media')
  const text = await res.text()
  
  try {
    const json = JSON.parse(text)
    return json.url || text
  } catch (e) {
    return text
  }
}

