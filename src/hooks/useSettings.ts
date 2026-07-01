import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'

export interface MaintenanceSettings {
  isActive: boolean
  startTime: string
  endTime: string
  contactEmail: string
  contactPhone: string
  facebookGroup: string
  message: string
}

export interface BannerSettings {
  isActive: boolean
  title: string
  message: string
  imageUrl: string
  buttonText: string
  buttonLink: string
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const response = await fetch(`${WORKER_URL}/api/settings`)
      if (!response.ok) {
        throw new Error('Failed to fetch site settings')
      }
      return response.json()
    },
    refetchInterval: 60000, // Check every minute
  })
}

export function useUpdateMaintenance() {
  const { adminToken } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: MaintenanceSettings) => {
      const response = await fetch(`${WORKER_URL}/api/admin/settings/maintenance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(settings)
      })
      if (!response.ok) {
        throw new Error('Failed to update maintenance settings')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    }
  })
}

export function useUpdateBanner() {
  const { adminToken } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: BannerSettings) => {
      const response = await fetch(`${WORKER_URL}/api/admin/settings/banner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(settings)
      })
      if (!response.ok) {
        throw new Error('Failed to update banner settings')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    }
  })
}
