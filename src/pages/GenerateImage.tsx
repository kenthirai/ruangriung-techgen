import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Image as ImageIcon, Download, ZoomIn, History as HistoryIcon, X, Trash2, Sparkles, Upload } from 'lucide-react'
import { useGenerateImage } from '../hooks/useGeneration'
import { useHistory, useDeleteHistory, useClearHistory } from '../hooks/useHistory'
import { ModelSelector } from '../components/ModelSelector'
import { ConfirmModal } from '../components/ConfirmModal'
import { ProLoginModal } from '../components/ProLoginModal'
import { generateText, uploadMedia } from '../lib/pollinations'

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', width: 1024, height: 1024 },
  { label: 'Portrait (9:16)', width: 576, height: 1024 },
  { label: 'Landscape (16:9)', width: 1024, height: 576 },
  { label: 'Classic Portrait (3:4)', width: 768, height: 1024 },
  { label: 'Classic Landscape (4:3)', width: 1024, height: 768 },
]

const STYLE_PRESETS = [
  { label: 'Anime', keyword: 'anime style, masterpiece, best quality, highly detailed' },
  { label: 'Cinematic', keyword: 'cinematic lighting, highly detailed, photorealistic, 8k' },
  { label: '3D Render', keyword: '3d render, unreal engine 5, ray tracing, volumetric lighting' },
  { label: 'Pixel Art', keyword: 'pixel art, 16-bit, retro gaming style' },
  { label: 'Watercolor', keyword: 'watercolor painting, artistic, expressive brush strokes' },
  { label: 'Cyberpunk', keyword: 'cyberpunk style, neon lights, futuristic city, highly detailed' },
]

export function GenerateImage() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('flux')
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0])
  const [imageCount, setImageCount] = useState(1)
  const [seed, setSeed] = useState('')
  const [enhance, setEnhance] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [referenceImage, setReferenceImage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'all' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { mutate: generateImage, isPending: isLoading } = useGenerateImage()
  const { data: history = [] } = useHistory('default')
  const { mutate: deleteHistory, isPending: isDeleting } = useDeleteHistory()
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory()

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    generateImage({ 
      prompt, 
      model,
      width: aspectRatio.width,
      height: aspectRatio.height,
      count: imageCount,
      seed: seed ? parseInt(seed, 10) : undefined,
      enhance,
      isPrivate,
      referenceImage: referenceImage.trim() || undefined
    }, {
      onSuccess: (urls) => {
        setImageUrls(urls)
      },
      onError: (err) => {
        console.error(err)
      }
    })
  }

  const handleClear = () => {
    setPrompt('')
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }
  
  const applyStyle = (keyword: string) => {
    if (!keyword) return;
    setPrompt(prev => {
      const trimmed = prev.trim()
      if (!trimmed) return keyword
      if (trimmed.includes(keyword)) return prev
      return `${trimmed}, ${keyword}`
    })
    
    // Trigger resize for textarea manually
    setTimeout(() => {
      const textarea = document.getElementById('prompt-textarea')
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, 0)
  }
  
  const handleReuse = (item: any) => {
    setPrompt(item.prompt)
    setModel(item.model)
    setImageUrls([item.result_url])
    setImageCount(1)
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
      const systemPrompt = "You are a professional prompt engineer for AI image generation. Take the user's short idea and expand it into a highly detailed, descriptive, and vivid image generation prompt. Include details about lighting, composition, camera angle, and atmosphere. ONLY output the expanded prompt, do not add any conversational text."
      const enhanced = await generateText([{ role: 'user', content: prompt }], 'openai', systemPrompt)
      setPrompt(enhanced.trim())
      // Trigger resize for textarea manually
      setTimeout(() => {
        const textarea = document.getElementById('prompt-textarea')
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const url = await uploadMedia(file)
      setReferenceImage(url)
    } catch (err: any) {
      console.error('Failed to upload image', err)
      alert(err.message || 'Failed to upload image. Please check your API key.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const imageHistory = history.filter((item: any) => item.type === 'image')

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-8 h-8 text-purple-400" /> Image Generator
        </h1>
        <p className="text-zinc-400">Transform your text into stunning images in seconds.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2 col-span-1 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-medium text-zinc-300">Model</label>
            <ModelSelector type="image" value={model} onChange={(val, isPro) => {
              setModel(val)
              if (isPro) setShowProModal(true)
            }} disabled={isLoading} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
            <select
              value={aspectRatio.label}
              onChange={(e) => {
                const selected = ASPECT_RATIOS.find(r => r.label === e.target.value)
                if (selected) setAspectRatio(selected)
              }}
              disabled={isLoading}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.label} value={ratio.label}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Count</label>
            <select
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              disabled={isLoading}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} Image{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Seed (Optional)</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              disabled={isLoading}
              placeholder="Random"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Reference Image URL (Optional)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={referenceImage}
              onChange={(e) => setReferenceImage(e.target.value)}
              disabled={isLoading || isUploading}
              placeholder="https://example.com/image.jpg or upload file ->"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-zinc-700 disabled:opacity-50 whitespace-nowrap"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                id="prompt-textarea"
                value={prompt}
                onChange={handleTextareaInput}
                placeholder="Describe what you want to see (e.g. 'A futuristic city at sunset, cyberpunk style')..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12 resize-y min-h-[48px]"
                style={{ maxHeight: '200px' }}
              />
              {prompt && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  title="Clear Prompt"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.map(style => (
                <button
                  key={style.label}
                  type="button"
                  onClick={() => applyStyle(style.keyword)}
                  className="text-xs bg-zinc-800/80 hover:bg-purple-900/50 text-zinc-400 hover:text-purple-300 px-3 py-1.5 rounded-full border border-zinc-700/50 hover:border-purple-500/50 transition-colors"
                >
                  {style.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 mt-1">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={!prompt.trim() || isEnhancing || isLoading}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-300 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  ✨ Enhance Prompt
                </button>
                <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isPrivate" 
                    checked={isPrivate} 
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-600 focus:ring-offset-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="isPrivate" className="text-xs text-zinc-400 cursor-pointer select-none">
                    Private Mode
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="enhancePrompt" 
                    checked={enhance} 
                    onChange={(e) => setEnhance(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-600 focus:ring-offset-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="enhancePrompt" className="text-xs text-zinc-400 cursor-pointer select-none">
                    Auto-enhance
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 whitespace-nowrap"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl min-h-[500px] flex items-center justify-center p-6 ${imageUrls.length > 0 ? '' : 'overflow-hidden relative'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center text-zinc-500 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            <p>Creating your masterpiece{imageCount > 1 ? 's' : ''}...</p>
          </div>
        ) : imageUrls.length > 0 ? (
          <div className={`grid gap-4 w-full h-full ${imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {imageUrls.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative group w-full h-full flex justify-center items-center bg-zinc-950 rounded-xl overflow-hidden"
              >
                <img 
                  src={url} 
                  alt={`${prompt} - ${i + 1}`} 
                  className="max-w-full max-h-[600px] object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedImage(url)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-6 h-6" />
                  </button>
                  <a 
                    href={url} 
                    download 
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-colors"
                    title="Download"
                  >
                    <Download className="w-6 h-6" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 flex flex-col items-center">
            <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
            <p>Your generated image will appear here</p>
          </div>
        )}
      </div>

      {/* User History Section */}
      {imageHistory.length > 0 && (
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
            {imageHistory.slice(0, 16).map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => handleReuse(item)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-colors relative aspect-square"
              >
                <img 
                  src={item.result_url} 
                  alt={item.prompt}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-xs text-zinc-300 line-clamp-2">{item.prompt}</p>
                </div>
                
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={isDeleting}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox for Zoom */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'all' ? 'Clear All History' : 'Delete History Item'}
        message={deleteTarget?.type === 'all' 
          ? 'Are you sure you want to clear all image generation history? This cannot be undone.'
          : 'Are you sure you want to delete this image from your history?'}
        onConfirm={() => {
          if (deleteTarget?.type === 'all') {
            clearHistory({ sessionId: 'default', type: 'image' })
          } else if (deleteTarget?.type === 'single') {
            deleteHistory(deleteTarget.id)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Delete"
      />
      <ProLoginModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
      />
    </div>
  )
}
