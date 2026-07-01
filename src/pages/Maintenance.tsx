import { motion } from 'framer-motion'
import { Wrench, Mail, Phone, Users } from 'lucide-react'
import { useSiteSettings } from '../hooks/useSettings'

export function Maintenance() {
  const { data } = useSiteSettings()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="p-6 bg-purple-500/10 rounded-full">
            <Wrench className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          We'll be back soon!
        </h1>
        
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
          {data?.maintenance?.message || "Sorry for the inconvenience but we're performing some maintenance at the moment. We'll be back online shortly!"}
        </p>

        {data?.maintenance?.startTime && data?.maintenance?.endTime && (
          <div className="inline-flex flex-col items-center p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 mb-12 backdrop-blur-sm">
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-2">Estimated Downtime</p>
            <div className="flex items-center gap-4 text-white">
              <span className="font-mono text-lg">{new Date(data.maintenance.startTime).toLocaleString()}</span>
              <span className="text-zinc-500">→</span>
              <span className="font-mono text-lg">{new Date(data.maintenance.endTime).toLocaleString()}</span>
            </div>
          </div>
        )}

        {(data?.maintenance?.contactEmail || data?.maintenance?.contactPhone || data?.maintenance?.facebookGroup) && (
          <div className="pt-12 border-t border-zinc-800/50">
            <p className="text-zinc-400 mb-6">Need to get in touch?</p>
            <div className="flex flex-wrap justify-center gap-6">
              {data.maintenance.contactEmail && (
                <a href={`mailto:${data.maintenance.contactEmail}`} className="flex items-center gap-3 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-zinc-300 hover:text-white transition-all border border-zinc-700/50 hover:border-zinc-600">
                  <Mail className="w-5 h-5" />
                  <span>{data.maintenance.contactEmail}</span>
                </a>
              )}
              {data.maintenance.contactPhone && (
                <a href={`tel:${data.maintenance.contactPhone}`} className="flex items-center gap-3 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-zinc-300 hover:text-white transition-all border border-zinc-700/50 hover:border-zinc-600">
                  <Phone className="w-5 h-5" />
                  <span>{data.maintenance.contactPhone}</span>
                </a>
              )}
              {data.maintenance.facebookGroup && (
                <a href={data.maintenance.facebookGroup} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-xl text-[#1877F2] hover:text-white transition-all border border-[#1877F2]/20 hover:border-[#1877F2]/40">
                  <Users className="w-5 h-5" />
                  <span>Join Facebook Group</span>
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
