import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Play, Download, Video, Clock, History as HistoryIcon, Trash2, Sparkles } from 'lucide-react'
import { useGenerateVideo } from '../hooks/useGeneration'
import { useHistory, useDeleteHistory, useClearHistory } from '../hooks/useHistory'
import { ConfirmModal } from '../components/ConfirmModal'
import { ModelSelector } from '../components/ModelSelector'
import { generateText } from '../lib/pollinations'

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', width: 1024, height: 1024 },
  { label: 'Portrait (9:16)', width: 576, height: 1024 },
  { label: 'Landscape (16:9)', width: 1024, height: 576 },
]

export function GenerateVideo() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('wan-fast')
  const [duration, setDuration] = useState(5)
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[2])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'all' } | null>(null)
  
  const generate = useGenerateVideo()
  const { data: history = [] } = useHistory('default')
  const { mutate: deleteHistory, isPending: isDeleting } = useDeleteHistory()
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || generate.isPending) return
    
    try {
      const url = await generate.mutateAsync({ 
        prompt, 
        model, 
        duration,
        width: aspectRatio.width,
        height: aspectRatio.height
      })
      setVideoUrl(url)
    } catch (err) {
      console.error(err)
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleReuse = (item: any) => {
    setPrompt(item.prompt)
    setModel(item.model)
    setVideoUrl(item.result_url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeleteTarget({ type: 'single', id })
  }

  const handleClearAll = () => {
    setDeleteTarget({ type: 'all' })
  }

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return
    setIsEnhancing(true)
    try {
      const systemPrompt = "You are a professional prompt engineer for AI video generation. Take the user's short idea and expand it into a highly detailed, descriptive, and vivid cinematic video generation prompt. Include details about camera movement, lighting, subject action, atmosphere, and colors. ONLY output the expanded prompt, do not add any conversational text."
      const enhanced = await generateText([{ role: 'user', content: prompt }], 'openai', systemPrompt)
      setPrompt(enhanced.trim())
      setTimeout(() => {
        const textarea = document.getElementById('video-prompt-textarea')
        if (textarea) {
          textarea.style.height = 'auto'
          textarea.style.height = `${textarea.scrollHeight}px`
        }
      }, 0)
    } catch (err) {
      console.error('Failed to enhance prompt', err)
      alert('Failed to enhance prompt. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const videoHistory = history.filter((item: any) => item.type === 'video')

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-500" />
            Video Generator
          </h1>
          <p className="text-zinc-400 mt-2">Generate high-quality videos using the latest AI models.</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">Video Prompt</label>
          <div className="relative">
            <textarea
              id="video-prompt-textarea"
              value={prompt}
              onChange={handleTextareaInput}
              placeholder="A spacecraft landing on mars, cinematic lighting, 4k resolution..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y min-h-[72px]"
              style={{ maxHeight: '200px' }}
            />
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                title="Clear Prompt"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={!prompt.trim() || isEnhancing || generate.isPending}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              ✨ Enhance Prompt
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Model</label>
            <ModelSelector type="video" value={model} onChange={setModel} disabled={generate.isPending} />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
            <select
              value={aspectRatio.label}
              onChange={(e) => {
                const selected = ASPECT_RATIOS.find(r => r.label === e.target.value)
                if (selected) setAspectRatio(selected)
              }}
              disabled={generate.isPending}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.label} value={ratio.label}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4"/> Duration</span>
              <span className="text-purple-400 font-mono">{duration}s</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              disabled={generate.isPending}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-3"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800/50">
          <button
            type="submit"
            disabled={!prompt.trim() || generate.isPending}
            className="w-full sm:w-auto h-[48px] px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-purple-500/25"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Generate Now
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl"
          >
            <div className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden relative group border border-zinc-800">
              <video 
                src={videoUrl} 
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-zinc-500 font-mono truncate max-w-xs">{videoUrl}</span>
              <a
                href={videoUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download Video
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {videoHistory.length > 0 && (
        <div className="pt-8 border-t border-zinc-800/50 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-purple-400" /> Your Recent Generations
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                * Note: History is automatically deleted every 24 hours for privacy.
              </p>
            </div>
            
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-900/50 transition-colors flex items-center gap-1.5"
            >
              {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Clear All History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {videoHistory.slice(0, 8).map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => handleReuse(item)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-colors relative aspect-video"
              >
                <video 
                  src={item.result_url} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  muted 
                  loop 
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                  playsInline 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-xs text-zinc-300 line-clamp-2">{item.prompt}</p>
                </div>

                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={isDeleting}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'all' ? 'Clear All History' : 'Delete History Item'}
        message={deleteTarget?.type === 'all' ? 'Are you sure you want to delete all video history? This action cannot be undone.' : 'Are you sure you want to delete this video from your history?'}
        onConfirm={() => {
          if (deleteTarget?.type === 'all') {
            clearHistory({ sessionId: 'default', type: 'video' })
          } else if (deleteTarget?.type === 'single') {
            deleteHistory(deleteTarget.id)
          }
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Delete"
      />
    </div>
  )
}
