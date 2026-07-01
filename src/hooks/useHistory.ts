import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHistory, toggleFavorite, deleteGeneration, clearHistory } from '../lib/pollinations'

export function useHistory(sessionId: string = 'default') {
  return useQuery({
    queryKey: ['history', sessionId],
    queryFn: () => fetchHistory(sessionId),
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string, isFavorite: boolean }) => toggleFavorite(id, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}

export function useDeleteHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGeneration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}

export function useClearHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, type }: { sessionId: string, type?: string }) => clearHistory(sessionId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}
