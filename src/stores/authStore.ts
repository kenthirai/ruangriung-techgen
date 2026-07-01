import { create } from 'zustand'

export interface AdminUser {
  email: string
  name?: string
  picture?: string
  role: 'superadmin' | 'admin'
}

interface AuthState {
  isAuthenticated: boolean
  apiKey: string | null
  
  // API Key User info
  user: {
    name?: string
  } | null

  // Admin Auth
  isAdmin: boolean
  adminToken: string | null
  adminUser: AdminUser | null

  setApiKey: (key: string) => void
  loginAsAdmin: (token: string, user: AdminUser) => void
  logout: () => void
  logoutAdmin: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('pollinations_api_key'),
  apiKey: localStorage.getItem('pollinations_api_key'),
  user: null,

  isAdmin: !!sessionStorage.getItem('admin_token'),
  adminToken: sessionStorage.getItem('admin_token'),
  adminUser: sessionStorage.getItem('admin_user') 
    ? JSON.parse(sessionStorage.getItem('admin_user')!) 
    : null,

  setApiKey: (key: string) => {
    localStorage.setItem('pollinations_api_key', key)
    set({ isAuthenticated: true, apiKey: key, user: { name: 'Pollinator' } })
  },

  loginAsAdmin: (token: string, user: AdminUser) => {
    sessionStorage.setItem('admin_token', token)
    sessionStorage.setItem('admin_user', JSON.stringify(user))
    set({ isAdmin: true, adminToken: token, adminUser: user })
  },

  logout: () => {
    localStorage.removeItem('pollinations_api_key')
    set({ isAuthenticated: false, apiKey: null, user: null })
  },

  logoutAdmin: () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    set({ isAdmin: false, adminToken: null, adminUser: null })
  }
}))
