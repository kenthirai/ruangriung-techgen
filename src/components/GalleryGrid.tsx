import { GenerationCard } from './GenerationCard'
import { Loader2 } from 'lucide-react'

interface GalleryGridProps {
  items: any[]
  isLoading?: boolean
}

export function GalleryGrid({ items, isLoading }: GalleryGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
        <p className="text-zinc-500">No generations yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item) => (
        <GenerationCard key={item.id} item={item} />
      ))}
    </div>
  )
}
