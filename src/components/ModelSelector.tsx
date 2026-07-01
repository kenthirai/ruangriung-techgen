import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { useModels } from '../hooks/useModels'

interface ModelSelectorProps {
  type: 'image' | 'text' | 'audio' | 'video' | 'embedding'
  value: string
  onChange: (value: string, isPro?: boolean) => void
  disabled?: boolean
}

export function ModelSelector({ type, value, onChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: models = [], isLoading } = useModels(type)

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50"
      >
        <span className="truncate">
          {isLoading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading models...</span>
          ) : (
            (() => {
              const selectedModel = models.find((m: any) => m.name === value)
              return selectedModel ? (selectedModel.title || selectedModel.name) : (value || 'Select a model')
            })()
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-zinc-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-72 overflow-y-auto overflow-x-hidden"
          >
            <div className="p-1 flex flex-col gap-1">
              {models.map((model: any) => (
                <button
                  key={model.name}
                  type="button"
                  onClick={() => {
                    onChange(model.name, !!model.paid_only)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all ${
                    value === model.name ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                  title={model.description || model.title || model.name}
                >
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate font-medium flex items-center gap-2">
                      {model.title || model.name}
                      {model.paid_only && (
                        <span className="px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold tracking-wider">Pro</span>
                      )}
                    </span>
                    {(model.description || model.brand) && (
                      <span className="truncate text-xs text-zinc-500 w-full text-left">
                        {model.brand || model.description}
                      </span>
                    )}
                  </div>
                  {value === model.name && <Check className="w-4 h-4 flex-shrink-0 ml-2" />}
                </button>
              ))}
              {models.length === 0 && !isLoading && (
                <div className="px-3 py-4 text-center text-zinc-500 text-sm">No models found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
