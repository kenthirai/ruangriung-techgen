import { useState, useEffect } from 'react'
import { User, Key, Shield, LogOut, Save, Bot, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Account() {
  const { logout, token, role } = useAuthStore()

  const [pollinationsKey, setPollinationsKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [deepseekKey, setDeepseekKey] = useState('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/admin/settings/keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPollinationsKey(data.keys.pollinations || '')
        setGeminiKey(data.keys.gemini || '')
        setOpenaiKey(data.keys.openai || '')
        setDeepseekKey(data.keys.deepseek || '')
      }
    } catch (err) {
      console.error('Failed to fetch keys', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (role !== 'superadmin') {
      setMessage({ text: 'Only superadmins can change global API keys.', type: 'error' })
      return
    }

    setIsSaving(true)
    setMessage({ text: '', type: '' })
    
    try {
      const res = await fetch('/api/admin/settings/keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pollinations: pollinationsKey,
          openai: openaiKey,
          gemini: geminiKey,
          deepseek: deepseekKey
        })
      })
      
      if (res.ok) {
        setMessage({ text: 'Global API Keys saved successfully.', type: 'success' })
      } else {
        const data = await res.json()
        setMessage({ text: data.error || 'Failed to save API keys.', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'A network error occurred.', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-purple-500" />
            Global API Settings
          </h1>
          <p className="text-zinc-400 mt-2">Manage API keys that will be used globally by all your users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Key className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-semibold">Backend API Authentication</h2>
          </div>
          
          {message.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Pollinations API Key */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <img src="/providers/pollinations.svg" alt="Pollinations" className="w-5 h-5 object-contain" />
                Pollinations API Key
              </label>
              <input
                type="password"
                value={pollinationsKey}
                onChange={(e) => setPollinationsKey(e.target.value)}
                placeholder="Enter Global Pollinations API Key"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-zinc-500">
                This key handles all image and video generation for your users.
              </p>
            </div>

            {/* Gemini API Key */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <img src="/providers/gemini.png" alt="Gemini" className="w-5 h-5 object-contain" />
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter Global Google Gemini API Key"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* OpenAI API Key */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <img src="/providers/openai.png" alt="OpenAI" className="w-5 h-5 object-contain" />
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Enter Global OpenAI API Key"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* DeepSeek API Key */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <img src="/providers/deepseek.png" alt="DeepSeek" className="w-5 h-5 object-contain" />
                DeepSeek API Key
              </label>
              <input
                type="password"
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
                placeholder="Enter Global DeepSeek API Key"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || role !== 'superadmin'}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Global API Keys'}
            </button>
          </form>
          
          <button
            onClick={logout}
            className="mt-4 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Admin
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Security Note</h2>
          </div>
          
          <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
            <p>
              These API keys are stored securely on your Cloudflare D1 Database. 
              They are <strong>never</strong> exposed to the end users' browsers.
            </p>
            <p>
              When a user generates text using a specific model (e.g. gpt-4o), the request goes to your Cloudflare Worker proxy first. The proxy fetches your Global API Key from the database, attaches it to the request, and forwards it to the provider.
            </p>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 mt-4">
              <strong>Superadmin Access Only:</strong> Only superadmins can view or modify these keys.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

