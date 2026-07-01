import { Box, Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useModels } from '../hooks/useModels'

export function Models() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  // We fetch image models by default just to show something, ideally we'd have a hook to fetch ALL models from our cache
  // For simplicity we'll just show 'image' models first, or implement a real get all later
  const { data: models = [], isLoading } = useModels('image') 
  const { data: textModels = [] } = useModels('text')
  const { data: audioModels = [] } = useModels('audio')
  const { data: videoModels = [] } = useModels('video')

  const allModels = [...models, ...textModels, ...audioModels, ...videoModels].filter((v,i,a)=>a.findIndex(v2=>(v2.name===v.name))===i)

  const filteredModels = allModels.filter((m: any) => {
    const matchesFilter = filter === 'all' || m.type === filter
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Box className="w-8 h-8 text-purple-500" />
            Model Catalog
          </h1>
          <p className="text-zinc-400 mt-2">Explore available AI models on Pollinations.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search models..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'image', 'text', 'audio', 'video'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModels.map((model: any) => (
            <div key={model.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-zinc-200 truncate pr-4">{model.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  {model.type || 'image'}
                </span>
              </div>
              <p className="text-sm text-zinc-500 line-clamp-2">
                {model.description || `Pollinations.ai ${model.type} model.`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
