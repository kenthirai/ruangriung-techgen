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
  geminiApiKey: string | null
  openAiApiKey: string | null
  deepseekApiKey: string | null
  
  // API Key User info
  user: {
    name?: string
  } | null

  // Admin Auth
  isAdmin: boolean
  adminToken: string | null
  adminUser: AdminUser | null

  setApiKey: (key: string) => void
  setGeminiApiKey: (key: string) => void
  setOpenAiApiKey: (key: string) => void
  setDeepseekApiKey: (key: string) => void
  loginAsAdmin: (token: string, user: AdminUser) => void
  logout: () => void
  logoutAdmin: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('pollinations_api_key'),
  apiKey: localStorage.getItem('pollinations_api_key'),
  geminiApiKey: localStorage.getItem('gemini_api_key'),
  openAiApiKey: localStorage.getItem('openai_api_key'),
  deepseekApiKey: localStorage.getItem('deepseek_api_key'),
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
  
  setGeminiApiKey: (key: string) => {
    localStorage.setItem('gemini_api_key', key)
    set({ geminiApiKey: key })
  },
  
  setOpenAiApiKey: (key: string) => {
    localStorage.setItem('openai_api_key', key)
    set({ openAiApiKey: key })
  },

  setDeepseekApiKey: (key: string) => {
    localStorage.setItem('deepseek_api_key', key)
    set({ deepseekApiKey: key })
  },

  loginAsAdmin: (token: string, user: AdminUser) => {
    sessionStorage.setItem('admin_token', token)
    sessionStorage.setItem('admin_user', JSON.stringify(user))
    set({ isAdmin: true, adminToken: token, adminUser: user })
  },

  logout: () => {
    localStorage.removeItem('pollinations_api_key')
    localStorage.removeItem('gemini_api_key')
    localStorage.removeItem('openai_api_key')
    localStorage.removeItem('deepseek_api_key')
    set({ isAuthenticated: false, apiKey: null, geminiApiKey: null, openAiApiKey: null, deepseekApiKey: null, user: null })
  },

  logoutAdmin: () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    set({ isAdmin: false, adminToken: null, adminUser: null })
  }
}))
