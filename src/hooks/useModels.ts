import { useQuery } from '@tanstack/react-query'
import { fetchModels } from '../lib/pollinations'

export function useModels(type: 'image' | 'text' | 'audio' | 'video' | 'embedding') {
  return useQuery({
    queryKey: ['models', type],
    queryFn: () => fetchModels(type),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
