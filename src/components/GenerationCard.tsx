import { motion } from 'framer-motion'
import { Download, Heart, Play, FileText, Image as ImageIcon } from 'lucide-react'
import { useToggleFavorite } from '../hooks/useHistory'

interface GenerationCardProps {
  item: {
    id: string
    type: string
    model: string
    prompt: string
    result_url: string
    is_favorite?: boolean
    created_at: string
  }
}

export function GenerationCard({ item }: GenerationCardProps) {
  const toggleFavorite = useToggleFavorite()

  const handleFavorite = () => {
    toggleFavorite.mutate({ id: item.id, isFavorite: !item.is_favorite })
  }

  const renderContent = () => {
    switch (item.type) {
      case 'image':
        return (
          <img 
            src={item.result_url} 
            alt={item.prompt}
            className="w-full h-48 object-cover rounded-t-xl"
            loading="lazy"
          />
        )
      case 'video':
        return (
          <div className="w-full h-48 bg-zinc-900 rounded-t-xl flex items-center justify-center relative overflow-hidden group">
            <video src={item.result_url} className="w-full h-full object-cover opacity-80" muted loop playsInline />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
        )
      case 'audio':
        return (
          <div className="w-full h-32 bg-zinc-900 rounded-t-xl flex items-center justify-center p-4">
            <audio src={item.result_url} controls className="w-full" />
          </div>
        )
      case 'text':
        return (
          <div className="w-full h-48 bg-zinc-900 rounded-t-xl p-4 overflow-y-auto">
            <p className="text-sm text-zinc-300 line-clamp-6">{item.result_url}</p>
          </div>
        )
      default:
        return (
          <div className="w-full h-32 bg-zinc-900 rounded-t-xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-zinc-600" />
          </div>
        )
    }
  }

  const TypeIcon = item.type === 'image' ? ImageIcon : item.type === 'video' ? Play : item.type === 'audio' ? Play : FileText

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden group hover:border-purple-500/50 transition-colors"
    >
      {renderContent()}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-2 text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
            <TypeIcon className="w-3 h-3" />
            {item.type}
          </span>
          <span className="text-xs text-zinc-500 font-mono">{item.model}</span>
        </div>
        
        <p className="text-sm text-zinc-300 line-clamp-2 mb-4" title={item.prompt}>
          {item.prompt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
          <button 
            onClick={handleFavorite}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <Heart className={`w-5 h-5 ${item.is_favorite ? 'fill-pink-500 text-pink-500' : 'text-zinc-500'}`} />
          </button>
          
          {(item.type === 'image' || item.type === 'video' || item.type === 'audio') && (
            <a 
              href={item.result_url}
              download
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
