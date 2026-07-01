import { useState } from 'react'
// Removed motion
import { Loader2, ExternalLink } from 'lucide-react'
import { useAdminGenerations } from '../../hooks/useAdmin'

export function GlobalActivity() {
  const [page, setPage] = useState(0)
  const limit = 20
  const { data, isLoading, error } = useAdminGenerations(limit, page * limit)

  if (isLoading && page === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
        Failed to load activity.
      </div>
    )
  }

  const generations = data.data
  const total = data.total
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Global Activity</h2>
        <p className="text-zinc-400">Recent generations from all users across the platform.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-300">
              <tr>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Session ID</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Prompt</th>
                <th className="px-6 py-4 font-medium text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {generations.map((gen: any) => (
                <tr key={gen.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(gen.created_at * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-mono text-xs">
                    {gen.session_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {gen.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-zinc-800 px-2 py-1 rounded-md text-zinc-300 text-xs">
                      {gen.model}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={gen.prompt}>
                    {gen.prompt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {gen.result_url && (
                      <a 
                        href={gen.result_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {generations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <span className="text-sm text-zinc-400">
            Showing {Math.min(page * limit + 1, total)} to {Math.min((page + 1) * limit, total)} of {total} entries
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-700 transition-colors text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-md disabled:opacity-50 hover:bg-zinc-700 transition-colors text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
