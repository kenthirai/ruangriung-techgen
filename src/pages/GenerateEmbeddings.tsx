import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Database, Copy, Check, Hash, History as HistoryIcon, Trash2, ArrowRightLeft, Percent } from 'lucide-react'
import { useGenerateEmbeddings } from '../hooks/useGeneration'
import { useHistory, useDeleteHistory, useClearHistory } from '../hooks/useHistory'
import { ModelSelector } from '../components/ModelSelector'
import { ConfirmModal } from '../components/ConfirmModal'

export function GenerateEmbeddings() {
  const [mode, setMode] = useState<'single' | 'compare'>('single')
  const [prompt, setPrompt] = useState('')
  const [comparePrompt, setComparePrompt] = useState('')
  const [model, setModel] = useState('openai')
  const [dimensions, setDimensions] = useState<string>('')
  const [embedding, setEmbedding] = useState<number[] | null>(null)
  const [similarity, setSimilarity] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single', id: string } | { type: 'all' } | null>(null)
  
  const generate = useGenerateEmbeddings()
  const { data: history = [] } = useHistory('default')
  const { mutate: deleteHistory, isPending: isDeleting } = useDeleteHistory()
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory()

  function cosineSimilarity(A: number[], B: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < A.length; i++) {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || generate.isPending) return
    if (mode === 'compare' && !comparePrompt.trim()) return
    
    try {
      const parsedDim = dimensions ? parseInt(dimensions, 10) : undefined
      
      if (mode === 'single') {
        const data = await generate.mutateAsync({ text: prompt, model, dimensions: parsedDim })
        setEmbedding(data)
        setSimilarity(null)
      } else {
        // Compare mode
        const [dataA, dataB] = await Promise.all([
          generate.mutateAsync({ text: prompt, model, dimensions: parsedDim }),
          generate.mutateAsync({ text: comparePrompt, model, dimensions: parsedDim })
        ])
        const sim = cosineSimilarity(dataA, dataB)
        setSimilarity(sim)
        setEmbedding(null)
      }
      setCopied(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleCopy = () => {
    if (embedding) {
      navigator.clipboard.writeText(JSON.stringify(embedding))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReuse = (item: any) => {
    setPrompt(item.prompt)
    setModel(item.model)
    setMode('single')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeleteTarget({ type: 'single', id })
  }

  const handleClearAll = () => {
    setDeleteTarget({ type: 'all' })
  }

  const embeddingHistory = history.filter((item: any) => item.type === 'embedding')

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-500" />
            Text Embeddings
          </h1>
          <p className="text-zinc-400 mt-2">Convert text into vector representations or compare semantic similarity.</p>
        </div>
      </div>
      
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'single' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Single Vector
        </button>
        <button
          onClick={() => setMode('compare')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'compare' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Compare Similarity
        </button>
      </div>

      <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">
            {mode === 'single' ? 'Input Text' : 'Text A'}
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={handleTextareaInput}
              placeholder="Enter the text to vectorize..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none overflow-hidden min-h-[72px]"
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
        </div>
        
        {mode === 'compare' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Text B</label>
            <div className="relative">
              <textarea
                value={comparePrompt}
                onChange={(e) => {
                  setComparePrompt(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                placeholder="Enter the second text to compare..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y min-h-[72px]"
                style={{ maxHeight: '200px' }}
              />
              {comparePrompt && (
                <button
                  type="button"
                  onClick={() => setComparePrompt('')}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  title="Clear Prompt"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Model</label>
            <ModelSelector type="embedding" value={model} onChange={setModel} disabled={generate.isPending} />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Hash className="w-4 h-4"/> Dimensions (Optional)
            </label>
            <input
              type="number"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 512, 1536"
              disabled={generate.isPending}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-[9px] text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800/50">
          <button
            type="submit"
            disabled={!prompt.trim() || (mode === 'compare' && !comparePrompt.trim()) || generate.isPending}
            className="w-full sm:w-auto h-[48px] px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-purple-500/25"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {mode === 'single' ? <Database className="w-5 h-5 fill-current" /> : <Percent className="w-5 h-5" />}
                {mode === 'single' ? 'Get Vector' : 'Compare'}
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {embedding && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-zinc-200">Result Vector</h3>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-mono">
                  Dimensions: {embedding.length}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
            </div>
            <div className="w-full bg-zinc-950 p-6 rounded-xl border border-zinc-800 h-64 overflow-y-auto font-mono text-xs text-zinc-400 break-all leading-relaxed shadow-inner">
              [{embedding.join(', ')}]
            </div>
          </motion.div>
        )}
        
        {similarity !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-2xl"
          >
            <h3 className="text-lg font-medium text-zinc-400">Cosine Similarity Score</h3>
            <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
              {(similarity * 100).toFixed(2)}%
            </div>
            <p className="text-zinc-500 text-sm mt-2 max-w-md text-center">
              {similarity > 0.8 ? 'These texts are highly similar in semantic meaning.' : 
               similarity > 0.5 ? 'These texts share some semantic similarities but differ in key aspects.' : 
               'These texts are semantically quite different.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User History Section */}
      {embeddingHistory.length > 0 && (
        <div className="pt-8 border-t border-zinc-800/50 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-purple-400" /> Your Recent Embeddings
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
            {embeddingHistory.slice(0, 6).map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => handleReuse(item)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 transition-colors flex flex-col gap-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                    {item.model}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 line-clamp-3">{item.prompt}</p>
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 font-mono truncate">{item.result_url}</p>
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
        message={deleteTarget?.type === 'all' ? 'Are you sure you want to delete all embedding history? This action cannot be undone.' : 'Are you sure you want to delete this embedding from your history?'}
        onConfirm={() => {
          if (deleteTarget?.type === 'all') {
            clearHistory({ sessionId: 'default', type: 'embedding' })
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
