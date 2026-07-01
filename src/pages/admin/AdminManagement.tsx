import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminList, useAddAdmin, useUpdateAdmin, useDeleteAdmin } from '../../hooks/useAdmin'
import { Shield, Trash2, Edit2, Loader2, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'

export function AdminManagement() {
  const { data: admins, isLoading, error } = useAdminList()
  const { mutate: addAdmin, isPending: isAdding } = useAddAdmin()
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin()
  const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin()

  // Add Form State
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('admin')
  const [newExpires, setNewExpires] = useState('')
  const [addError, setAddError] = useState('')

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Edit Modal State
  const [editingAdmin, setEditingAdmin] = useState<any>(null)
  const [editRole, setEditRole] = useState('')
  const [editExpires, setEditExpires] = useState('')

  // --- Handlers ---
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

  const handleEditClick = (admin: any) => {
    setEditingAdmin(admin)
    setEditRole(admin.role)
    if (admin.expires_at) {
      const d = new Date(admin.expires_at * 1000)
      setEditExpires(d.toISOString().split('T')[0])
    } else {
      setEditExpires('')
    }
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAdmin) return

    let expiresAt = null
    if (editExpires) {
      expiresAt = Math.floor(new Date(editExpires).getTime() / 1000)
    }

    updateAdmin({ email: editingAdmin.email, role: editRole, expires_at: expiresAt }, {
      onSuccess: () => {
        setEditingAdmin(null)
      }
    })
  }

  // --- Filter & Pagination Logic ---
  const filteredAdmins = useMemo(() => {
    if (!admins) return []
    let result = admins

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((a: any) => 
        (a.name && a.name.toLowerCase().includes(q)) || 
        a.email.toLowerCase().includes(q)
      )
    }

    if (filterRole !== 'all') {
      result = result.filter((a: any) => a.role === filterRole)
    }

    return result
  }, [admins, searchQuery, filterRole])

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage)
  const currentAdmins = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
  if (error) return <div className="text-red-400">Error: {(error as any).message}</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Admin Management</h2>
        <p className="text-zinc-400">Add, remove, or manage roles of administrators.</p>
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

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search admins..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="p-4 font-medium">Admin</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Last Login</th>
                <th className="p-4 font-medium">Expires</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {currentAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No admins found.
                  </td>
                </tr>
              ) : (
                currentAdmins.map((admin: any) => (
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
                      {admin.last_login ? new Date(admin.last_login * 1000).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-sm text-zinc-400">
                      {admin.expires_at ? new Date(admin.expires_at * 1000).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(admin)}
                          disabled={admin.email === 'arekgresikid@gmail.com' || isUpdating}
                          title="Edit Admin"
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
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length} admins
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Edit Admin</h3>
                <button onClick={() => setEditingAdmin(null)} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Email</label>
                  <div className="text-white font-medium px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl opacity-70">
                    {editingAdmin.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Expires At</label>
                  <input
                    type="date"
                    value={editExpires}
                    onChange={(e) => setEditExpires(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Leave empty for no expiration.</p>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center justify-center min-w-[100px]"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
