import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Dashboard } from './pages/Dashboard'
import { AdminLogin } from './pages/AdminLogin'
import { UserLayout } from './layouts/UserLayout'
import { AuthCallback } from './pages/AuthCallback'
import { GenerateImage } from './pages/GenerateImage'
import { GenerateText } from './pages/GenerateText'
import { GenerateVideo } from './pages/GenerateVideo'
import { GenerateAudio } from './pages/GenerateAudio'
import { GenerateEmbeddings } from './pages/GenerateEmbeddings'
import { History } from './pages/History'
import { Models } from './pages/Models'
import { Account } from './pages/Account'
import { Login } from './pages/Login'
import { Overview } from './pages/admin/Overview'
import { GlobalActivity } from './pages/admin/GlobalActivity'
import { AdminManagement } from './pages/admin/AdminManagement'
import { BannerSettings } from './pages/admin/BannerSettings'
import { MaintenanceSettings } from './pages/admin/MaintenanceSettings'
import { Maintenance } from './pages/Maintenance'
import { EventBannerModal } from './components/EventBannerModal'
import { useAuthStore } from './stores/authStore'
import { useSiteSettings } from './hooks/useSettings'
import { useLocation } from 'react-router-dom'

const queryClient = new QueryClient()

function AppRoutes() {
  const location = useLocation()
  const { data, isLoading } = useSiteSettings()
  
  const isMaintenanceActive = data?.maintenance?.isActive
  const isBypassedRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (isMaintenanceActive && !isBypassedRoute) {
    return <Maintenance />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route path="/" element={
        <>
          <EventBannerModal />
          <UserLayout />
        </>
      }>
        <Route index element={<Navigate to="/generate/image" replace />} />
        <Route path="generate/image" element={<GenerateImage />} />
        <Route path="generate/text" element={<GenerateText />} />
        <Route path="generate/video" element={<GenerateVideo />} />
        <Route path="generate/audio" element={<GenerateAudio />} />
        <Route path="generate/embeddings" element={<GenerateEmbeddings />} />
      </Route>

      <Route path="/admin" element={<AdminLogin />} />

      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="global-activity" element={<GlobalActivity />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="banner" element={<BannerSettings />} />
        <Route path="maintenance" element={<MaintenanceSettings />} />
        <Route path="history" element={<History />} />
        <Route path="models" element={<Models />} />
        <Route path="account" element={<Account />} /> 
      </Route>
    </Routes>
  )
}

function App() {
  const { isAuthenticated, logout } = useAuthStore()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
            <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
              <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Ruangriung AI Generator
              </div>
              <nav className="space-x-6 text-sm font-medium text-zinc-300 flex items-center">
                {isAuthenticated && (
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-purple-400">Pollen API Key Active</span>
                    <button onClick={logout} className="px-4 py-2 bg-zinc-800 text-white hover:bg-zinc-700 rounded-md transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </nav>
            </header>
            
            <main className="flex-1 p-6 mx-auto w-full max-w-screen-2xl">
              <AppRoutes />
            </main>
          </div>
        </Router>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

export default App
