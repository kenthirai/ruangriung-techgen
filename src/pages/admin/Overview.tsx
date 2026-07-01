import { motion } from 'framer-motion'
import { Activity, Users, Image as ImageIcon, Video, Music, Type } from 'lucide-react'
import { useAdminStats } from '../../hooks/useAdmin'
import { Loader2 } from 'lucide-react'

export function Overview() {
  const { data: stats, isLoading, error } = useAdminStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
        Failed to load statistics. Are you sure you are logged in as admin?
      </div>
    )
  }

  const { totalGenerations, activeSessions, last24hGenerations, typeBreakdown } = stats

  const statCards = [
    { title: 'Total Generations', value: totalGenerations, icon: Activity, color: 'text-blue-500' },
    { title: 'Generations (24h)', value: last24hGenerations, icon: Activity, color: 'text-green-500' },
    { title: 'Active Sessions (24h)', value: activeSessions, icon: Users, color: 'text-purple-500' },
  ]

  const mediaTypes = [
    { type: 'image', icon: ImageIcon, color: 'text-pink-500' },
    { type: 'video', icon: Video, color: 'text-indigo-500' },
    { type: 'audio', icon: Music, color: 'text-amber-500' },
    { type: 'text', icon: Type, color: 'text-cyan-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Platform Overview</h2>
        <p className="text-zinc-400">Global statistics and usage metrics across all users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value?.toLocaleString() || 0}</h3>
              </div>
              <div className={`p-3 bg-zinc-800/50 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Generations by Media Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaTypes.map((mt, i) => (
            <motion.div
              key={mt.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-zinc-800 rounded-lg ${mt.color}`}>
                  <mt.icon className="w-5 h-5" />
                </div>
                <span className="text-zinc-300 capitalize">{mt.type}</span>
              </div>
              <span className="text-white font-bold">{typeBreakdown[mt.type] || 0}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
