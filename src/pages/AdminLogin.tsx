import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Loader2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'

export function AdminLogin() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isAdmin, loginAsAdmin } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin) {
      navigate('/dashboard/overview', { replace: true })
    }
  }, [isAdmin, navigate])

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(import.meta.env.VITE_WORKER_URL + '/api/auth/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      // data.token and data.user
      loginAsAdmin(data.token, data.user)
      
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to authenticate with server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed or was cancelled.')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8 text-center relative"
      >
        <Link 
          to="/" 
          className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex flex-col items-center space-y-4 pt-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <p className="text-zinc-400 mt-2">Sign in with your Google Workspace or authorized email to access the dashboard.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
