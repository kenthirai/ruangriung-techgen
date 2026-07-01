import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function AuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const setApiKey = useAuthStore((state) => state.setApiKey)

  useEffect(() => {
    // URL format: /auth/callback#api_key=sk_...
    const hash = new URLSearchParams(location.hash.slice(1))
    const apiKey = hash.get('api_key')

    if (apiKey) {
      setApiKey(apiKey)
      navigate('/')
    } else {
      // If no api key is found, redirect to login
      navigate('/login')
    }
  }, [navigate, location, setApiKey])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      <h2 className="text-xl font-medium text-white">Authenticating...</h2>
      <p className="text-zinc-400">Please wait while we log you in.</p>
    </div>
  )
}
