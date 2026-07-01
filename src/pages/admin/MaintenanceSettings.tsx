import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, Wrench } from 'lucide-react'
import { useSiteSettings, useUpdateMaintenance, type MaintenanceSettings as MaintenanceSettingsType } from '../../hooks/useSettings'

export function MaintenanceSettings() {
  const { data, isLoading } = useSiteSettings()
  const { mutate: updateSettings, isPending } = useUpdateMaintenance()
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<MaintenanceSettingsType>({
    isActive: false,
    startTime: '',
    endTime: '',
    contactEmail: '',
    contactPhone: '',
    facebookGroup: '',
    message: ''
  })

  useEffect(() => {
    if (data?.maintenance) {
      setFormData(data.maintenance)
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    updateSettings(formData, {
      onSuccess: () => {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Maintenance Mode</h2>
        <p className="text-zinc-400">Configure maintenance window and contact information for users.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${formData.isActive ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-medium">Enable Maintenance Mode</h3>
                <p className="text-sm text-zinc-400">Users will be redirected to the maintenance page.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Schedule (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Estimated End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-lg font-medium text-white">Message & Contact</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Maintenance Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="We are currently performing scheduled maintenance to improve our services."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="support@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Contact Phone (Optional)</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+1 234 567 890"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Facebook Group URL (Optional)</label>
              <input
                type="url"
                name="facebookGroup"
                value={formData.facebookGroup}
                onChange={handleChange}
                placeholder="https://facebook.com/groups/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Settings</>}
            </button>
            {success && (
              <p className="text-green-400 text-sm text-center mt-3">Settings saved successfully!</p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}
