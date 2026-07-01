// Imports removed because they are not used

export function Login() {
  const handleConnectWallet = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`)
    const clientId = import.meta.env.VITE_POLLINATIONS_PK_KEY || 'pk_x1HgyzwMRjvFB6KZ'
    const authUrl = `https://enter.pollinations.ai/authorize?redirect_uri=${redirectUri}&client_id=${clientId}&scope=usage&models=flux,openai,gptimage&budget=10&expiry=7`
    window.location.href = authUrl
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome</h1>
          <p className="text-zinc-400">Connect with Pollinations.ai to access Pro Models (GitHub/Google Login).</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConnectWallet}
            className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20"
          >
            Connect / Sign in with Pollinations
          </button>
        </div>
      </div>
    </div>
  )
}
