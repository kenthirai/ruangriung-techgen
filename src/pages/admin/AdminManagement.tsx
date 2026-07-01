import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminList, useAddAdmin, useUpdateAdmin, useDeleteAdmin } from '../../hooks/useAdmin'
import { Shield, Trash2, Edit2, Loader2 } from 'lucide-react'

export function AdminManagement() {
  const { data: admins, isLoading, error } = useAdminList()
  const { mutate: addAdmin, isPending: isAdding } = useAddAdmin()
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin()
  const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin()

  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('admin')
  const [newExpires, setNewExpires] = useState('')
  const [addError, setAddError] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    if (!newEmail) return

    let expiresAt = null
    if (newExpires) {
      expiresAt = Math.floor(new Date(newExpires).getTime() / 1000)
    }

    addAdmin({ email: newEmail, role: newRole, expires_at: expiresAt }, {
      onSuccess: () => {
        setNewEmail('')
        setNewRole('admin')
        setNewExpires('')
      },
      onError: (err: any) => {
        setAddError(err.message)
      }
    })
  }

  const handleDelete = (email: string) => {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
      deleteAdmin(email)
    }
  }

  const handleRoleToggle = (email: string, currentRole: string) => {
    const newR = currentRole === 'admin' ? 'superadmin' : 'admin'
    updateAdmin({ email, role: newR })
  }

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
  if (error) return <div className="text-red-400">Error: {(error as any).message}</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Admin Management</h2>
        <p className="text-zinc-400">Add, remove, or change roles of administrators.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Add New Admin</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-sm text-zinc-400">Email Address</label>
            <input 
              type="email" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="w-32 space-y-2">
            <label className="text-sm text-zinc-400">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div className="w-48 space-y-2">
            <label className="text-sm text-zinc-400">Expires (Optional)</label>
            <input 
              type="date"
              value={newExpires}
              onChange={(e) => setNewExpires(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 h-[42px] rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add'}
          </button>
        </form>
        {addError && <p className="text-red-400 mt-2 text-sm">{addError}</p>}
      </motion.div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
              <th className="p-4 font-medium">Admin</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Added</th>
              <th className="p-4 font-medium">Expires</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {admins?.map((admin: any) => (
              <tr key={admin.email} className="hover:bg-zinc-800/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {admin.avatar_url ? (
                      <img src={admin.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">{admin.name || admin.email.split('@')[0]}</div>
                      <div className="text-zinc-500 text-sm">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-zinc-400">
                  {new Date(admin.created_at * 1000).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm text-zinc-400">
                  {admin.expires_at ? new Date(admin.expires_at * 1000).toLocaleDateString() : 'Never'}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleRoleToggle(admin.email, admin.role)}
                      disabled={admin.email === 'arekgresikid@gmail.com' || isUpdating}
                      title="Toggle Role"
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(admin.email)}
                      disabled={admin.email === 'arekgresikid@gmail.com' || isDeleting}
                      title="Remove Admin"
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
