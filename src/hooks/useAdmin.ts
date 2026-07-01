import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787'

export function useAdminStats() {
  const { adminToken } = useAuthStore()

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch(`${WORKER_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats')
      }
      return response.json()
    },
    enabled: !!adminToken,
  })
}

export function useAdminGenerations(limit = 50, offset = 0) {
  const { adminToken } = useAuthStore()

  return useQuery({
    queryKey: ['admin-generations', limit, offset],
    queryFn: async () => {
      const response = await fetch(`${WORKER_URL}/api/admin/generations?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch admin generations')
      }
      return response.json()
    },
    enabled: !!adminToken,
  })
}

// === Superadmin Management Hooks ===

export function useAdminList() {
  const { adminToken, adminUser } = useAuthStore()

  return useQuery({
    queryKey: ['admin-list'],
    queryFn: async () => {
      const response = await fetch(`${WORKER_URL}/api/admin/admins`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch admin list')
      }
      const data = await response.json()
      return data.admins
    },
    enabled: !!adminToken && adminUser?.role === 'superadmin',
  })
}

export function useAddAdmin() {
  const { adminToken } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { email: string, role: string, expires_at?: number | null }) => {
      const response = await fetch(`${WORKER_URL}/api/admin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to add admin')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] })
    }
  })
}

export function useUpdateAdmin() {
  const { adminToken } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, role, expires_at }: { email: string, role: string, expires_at?: number | null }) => {
      const response = await fetch(`${WORKER_URL}/api/admin/admins/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ role, expires_at })
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update admin')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] })
    }
  })
}

export function useDeleteAdmin() {
  const { adminToken } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`${WORKER_URL}/api/admin/admins/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete admin')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] })
    }
  })
}
