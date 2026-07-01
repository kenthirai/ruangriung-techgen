import { useState, useRef } from 'react'
import { Loader2, MessageSquare, Send, History as HistoryIcon, Copy, Check, Trash2, Settings2 } from 'lucide-react'
import { useGenerateText } from '../hooks/useGeneration'
import { useHistory } from '../hooks/useHistory'
import { ModelSelector } from '../components/ModelSelector'
// Removed ConfirmModal
import ReactMarkdown from 'react-markdown'

export function GenerateText() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('openai')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  const generate = useGenerateText()
  const { data: history = [] } = useHistory('default')

  const textHistory = history.filter((item: any) => item.type === 'text')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || generate.isPending) return

    const userMsg = prompt
    setPrompt('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)

    try {
      const response = await generate.mutateAsync({ 
        messages: newMessages, 
        model,
        systemPrompt: systemPrompt.trim() ? systemPrompt.trim() : undefined
      })
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'system', content: 'Error generating response. Please try again.' }])
    }
  }

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }



  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleReuse = (item: any) => {
    setMessages([{ role: 'user', content: item.prompt }, { role: 'assistant', content: item.result_url || '' }])
    setModel(item.model)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-purple-500" />
          Text Chat
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'}`}
            title="AI Settings"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <div className="w-48 sm:w-64">
            <ModelSelector type="text" value={model} onChange={setModel} disabled={generate.isPending} />
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg animate-in fade-in slide-in-from-top-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">System Prompt / AI Persona</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. You are a senior software engineer who explains concepts simply..."
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y"
          />
        </div>
      )}

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-4 p-4 overflow-y-auto space-y-4 shadow-xl">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>Start a conversation with {model}</p>
            
            {textHistory.length > 0 && (
              <div className="mt-8 w-full max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-purple-400" /> Recent Conversations
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      * Note: History is automatically deleted every 24 hours for privacy.
                    </p>
                  </div>

                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {textHistory.slice(0, 6).map((item: any) => (
                    <div
                      key={item.id}
                      className="text-left p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 transition-colors flex flex-col group cursor-pointer relative"
                      onClick={() => handleReuse(item)}
                    >
                      <p className="text-sm text-zinc-200 line-clamp-2 font-medium mb-2">{item.prompt}</p>
                      <p className="text-xs text-zinc-500 line-clamp-3 mb-4">{item.result_url}</p>
                      <span className="text-[10px] text-zinc-600 uppercase font-bold mt-auto tracking-wider">{item.model}</span>
                      

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : msg.role === 'system'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="relative group/msg">
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-700 max-w-none break-words">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="absolute -top-2 -right-2 bg-zinc-700 hover:bg-zinc-600 p-1.5 rounded-md text-zinc-300 opacity-0 group-hover/msg:opacity-100 transition-opacity shadow-sm"
                      title="Copy message"
                    >
                      {copiedIndex === i ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                )}
              </div>
            </div>
          ))
        )}
        
        {generate.isPending && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative shadow-xl">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y min-h-[56px]"
          style={{ maxHeight: '200px' }}
          rows={1}
          disabled={generate.isPending}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || generate.isPending}
          className="absolute right-3 bottom-3 p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
