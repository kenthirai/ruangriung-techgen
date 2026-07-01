import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useSiteSettings } from '../hooks/useSettings'

export function EventBannerModal() {
  const { data } = useSiteSettings()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (data?.event_banner?.isActive) {
      const lastDismissed = localStorage.getItem('event_banner_dismissed')
      // Show if never dismissed, or if dismissed more than 24h ago
      if (!lastDismissed || (Date.now() - parseInt(lastDismissed)) > 86400000) {
        // Small delay so it doesn't pop up instantly jarring the user
        const timer = setTimeout(() => setIsOpen(true), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [data])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('event_banner_dismissed', Date.now().toString())
  }

  if (!isOpen || !data?.event_banner) return null

  const { title, message, imageUrl, buttonText, buttonLink } = data.event_banner

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          {imageUrl && (
            <div className="w-full h-48 bg-zinc-800">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              {message}
            </p>
            
            {buttonText && buttonLink && (
              <div className="pt-4">
                <a
                  href={buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose} // Usually closing it when they click through is good UX
                  className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20"
                >
                  {buttonText}
                </a>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
