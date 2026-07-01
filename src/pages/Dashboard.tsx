import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { History, Box, User, Lock, LayoutDashboard, Globe, Wrench, Shield, Megaphone, ArrowLeft, Menu, X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Dashboard() {
  const { isAdmin, adminUser, logoutAdmin } = useAuthStore()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const systemItems = [
    { name: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, link: '/dashboard/overview' },
    { name: 'Global Activity', icon: <Globe className="w-5 h-5" />, link: '/dashboard/global-activity' },
    ...(adminUser?.role === 'superadmin' ? [
      { name: 'Admin Management', icon: <Shield className="w-5 h-5" />, link: '/dashboard/admin-management' }
    ] : []),
    { name: 'Event Banner', icon: <Megaphone className="w-5 h-5" />, link: '/dashboard/banner' },
    { name: 'Maintenance', icon: <Wrench className="w-5 h-5" />, link: '/dashboard/maintenance' },
    { name: 'My History', icon: <History className="w-5 h-5" />, link: '/dashboard/history' },
    { name: 'Models', icon: <Box className="w-5 h-5" />, link: '/dashboard/models' },
    { name: 'Account', icon: <User className="w-5 h-5" />, link: '/dashboard/account' },
  ]

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-61px)] -m-6 relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800">
        <h2 className="text-lg font-bold text-white">Dashboard</h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 top-0 left-0 h-full w-64 flex-shrink-0 flex flex-col justify-between py-6 px-6 
        border-r border-zinc-800 overflow-y-auto bg-zinc-950/95 md:bg-zinc-950/50 backdrop-blur-xl md:backdrop-blur-none
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-6 px-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Admin Dashboard</h3>
            {systemItems.map((item) => {
              const isActive = location.pathname.startsWith(item.link)
              return (
                <Link key={item.name} to={item.link}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                    isActive ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}>
                    {item.icon}
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={() => logoutAdmin()}
            className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors font-medium text-sm"
          >
            <Lock className="w-5 h-5" />
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto pb-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
