import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ProLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProLoginModal({ isOpen, onClose }: ProLoginModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl z-10"
          >
            <div className="p-6 flex flex-col gap-4 text-center items-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Pro Model Selected</h3>
              <p className="text-sm text-zinc-400">
                To use 'Pro' tier models, you need a Pollinations AI account. Please log in or sign up at pollinations.ai to continue using this model.
              </p>
            </div>
            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.open('https://pollinations.ai', '_blank')
                  onClose()
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-600 transition-colors"
              >
                Login
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
