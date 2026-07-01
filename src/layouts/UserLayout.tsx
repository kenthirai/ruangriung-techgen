import { Outlet, Link, useLocation } from 'react-router-dom'
import { Image as ImageIcon, Video, Mic, MessageSquare, Database } from 'lucide-react'

export function UserLayout() {
  const location = useLocation()
  
  const navItems = [
    { name: 'Image', icon: <ImageIcon className="w-4 h-4" />, link: '/generate/image' },
    { name: 'Video', icon: <Video className="w-4 h-4" />, link: '/generate/video' },
    { name: 'Audio', icon: <Mic className="w-4 h-4" />, link: '/generate/audio' },
    { name: 'Text', icon: <MessageSquare className="w-4 h-4" />, link: '/generate/text' },
    { name: 'Embeddings', icon: <Database className="w-4 h-4" />, link: '/generate/embeddings' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex justify-center gap-2 mb-4 flex-wrap">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.link)
          return (
            <Link key={item.name} to={item.link}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}>
                {item.icon}
                {item.name}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="flex-1 pb-10">
        <Outlet />
      </div>
    </div>
  )
}
