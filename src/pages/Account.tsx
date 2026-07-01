import { User, Key, Shield, LogOut } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Account() {
  const { apiKey, logout } = useAuthStore()

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-purple-500" />
            Account & Settings
          </h1>
          <p className="text-zinc-400 mt-2">Manage your Pollinations API key and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Key className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-semibold">API Authentication</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-400">Current API Key</label>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-300 break-all">
              {apiKey ? apiKey : 'No API key configured.'}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              This key is used to authenticate all your requests to gen.pollinations.ai.
            </p>
          </div>
          
          <button
            onClick={logout}
            className="mt-auto px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Disconnect & Logout
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Session Info</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Status</span>
              <span className="text-zinc-200">{apiKey ? 'Connected via BYOP' : 'Guest Mode'}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Storage</span>
              <span className="text-zinc-200">Cloudflare D1 Database</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
