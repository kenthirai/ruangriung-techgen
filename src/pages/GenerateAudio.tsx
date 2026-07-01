import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mic, Play, Download, Settings, History as HistoryIcon, Trash2, FastForward, Sparkles } from 'lucide-react'
import { useGenerateAudio } from '../hooks/useGeneration'
import { useHistory, useDeleteHistory, useClearHistory } from '../hooks/useHistory'
import { ConfirmModal } from '../components/ConfirmModal'

const VOICES = [
  'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'ash', 'ballad', 'coral', 'sage', 'verse', 
  'rachel', 'domi', 'bella', 'elli', 'charlotte', 'dorothy', 'sarah', 'emily', 'lily', 'matilda', 
  'adam', 'antoni', 'arnold', 'josh', 'sam', 'daniel', 'charlie', 'james', 'fin', 'callum', 'liam', 
  'george', 'brian', 'bill'
]

export function GenerateAudio() {
  const [prompt, setPrompt] = useState('')
  const [voice, setVoice] = useState('nova')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'all' } | null>(null)
  const [isEnhancing] = useState(false)
  
  const generate = useGenerateAudio()
  const { data: history = [] } = useHistory('default')
  const { mutate: deleteHistory, isPending: isDeleting } = useDeleteHistory()
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory()

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed, audioUrl])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || generate.isPending) return
    
    try {
      const url = await generate.mutateAsync({ text: prompt, voice })
      setAudioUrl(url)
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
    setVoice(item.model)
    setAudioUrl(item.result_url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEnhancePrompt = async () => {
    // Enhancement logic would go here
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeleteTarget({ type: 'single', id })
  }

  const handleClearAll = () => {
    setDeleteTarget({ type: 'all' })
  }

  const audioHistory = history.filter((item: any) => item.type === 'audio')

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mic className="w-8 h-8 text-purple-500" />
            Audio & TTS Generator
          </h1>
          <p className="text-zinc-400 mt-2">Convert text to speech or generate high-quality audio with 30+ voices.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <form onSubmit={handleGenerate} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                id="audio-prompt-textarea"
                value={prompt}
                onChange={handleTextareaInput}
                placeholder="Type your script or describe the audio (e.g. 'Hello world')..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y min-h-[96px]"
                style={{ maxHeight: '250px' }}
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
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 mt-1">
              <div className="flex items-center gap-2">
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
              <button
                type="submit"
                disabled={!prompt.trim() || generate.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25 whitespace-nowrap"
              >
                {generate.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-end">
          <div className="flex flex-col gap-2 w-full sm:w-1/2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Settings className="w-4 h-4"/> Voice
            </label>
            <div className="relative">
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                disabled={generate.isPending}
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 capitalize shadow-inner cursor-pointer"
              >
                {VOICES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!prompt.trim() || generate.isPending}
            className="w-full sm:w-auto h-[48px] px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-purple-500/25"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Audio...
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
      </div>

      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 items-center justify-center shadow-2xl"
          >
            <div className="w-full max-w-2xl bg-zinc-950 p-6 rounded-xl border border-zinc-800 flex flex-col gap-4 shadow-inner">
              <audio 
                ref={audioRef}
                src={audioUrl} 
                controls
                autoPlay
                className="w-full"
              />
              <div className="flex items-center gap-2 justify-end">
                <FastForward className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-400 font-medium mr-2">Speed:</span>
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      playbackSpeed === speed 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                        : 'bg-zinc-800 text-zinc-400 border border-transparent hover:border-zinc-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            
            <a
              href={audioUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download Audio File
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User History Section */}
      {audioHistory.length > 0 && (
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
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {audioHistory.slice(0, 6).map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => handleReuse(item)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 transition-colors flex flex-col gap-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                    {item.model}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 line-clamp-3">{item.prompt}</p>
                <div className="mt-auto pt-3 flex gap-2">
                  <audio src={item.result_url} controls className="w-full h-8" onClick={(e) => e.stopPropagation()} />
                </div>
                
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={isDeleting}
                  className="absolute top-2 right-2 bg-zinc-900/80 hover:bg-red-500/80 p-1.5 rounded text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'all' ? 'Clear All History' : 'Delete History Item'}
        message={deleteTarget?.type === 'all' ? 'Are you sure you want to delete all audio history? This action cannot be undone.' : 'Are you sure you want to delete this audio from your history?'}
        onConfirm={() => {
          if (deleteTarget?.type === 'all') {
            clearHistory({ sessionId: 'default', type: 'audio' })
          } else if (deleteTarget?.type === 'single') {
            deleteHistory(deleteTarget.id)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Delete"
      />
    </div>
  )
}
