'use client'

import { useEffect, useState } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [details, setDetails] = useState('')

  useEffect(() => {
    console.error('Application error:', error)
    setDetails(error?.message || 'Unknown error')
  }, [error])

  return (
    <div className="h-screen flex items-center justify-center bg-[#0F4C5C] p-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-[#A3E635] font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-white/70 mb-4 leading-relaxed">
          An unexpected error occurred. This has been logged automatically.
        </p>
        {details && (
          <div className="bg-white/10 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs text-[#A3E635] font-mono break-all">{details}</p>
          </div>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[#A3E635] hover:bg-[#bef264] text-[#0A0A0A] rounded-lg text-sm font-semibold transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('chatlingo_token')
            localStorage.removeItem('chatlingo_user')
            window.location.reload()
          }}
          className="block mx-auto mt-3 px-4 py-2 text-white/60 text-xs font-medium hover:text-white transition-colors"
        >
          Sign out and reload
        </button>
      </div>
    </div>
  )
}
