import { History as HistoryIcon } from 'lucide-react'
import { useState } from 'react'
import { useHistory } from '../hooks/useHistory'
import { GalleryGrid } from '../components/GalleryGrid'

export function History() {
  const { data: history = [], isLoading } = useHistory('default') // TODO: use real session ID
  const [filter, setFilter] = useState('all')

  const filteredHistory = history.filter((item: any) => {
    if (filter === 'all') return true
    if (filter === 'favorites') return item.is_favorite
    return item.type === filter
  })

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-purple-500" />
            Generation History
          </h1>
          <p className="text-zinc-400 mt-2">View and manage your past AI generations.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'favorites', 'image', 'video', 'audio', 'text'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/30 rounded-3xl p-6 border border-zinc-800/50">
        <GalleryGrid items={filteredHistory} isLoading={isLoading} />
      </div>
    </div>
  )
}
