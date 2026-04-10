'use client'

import { useChatLingoStore } from '@/lib/store'
import { SignUpForm } from '@/components/chatlingo/sign-up-form'
import { LoginForm } from '@/components/chatlingo/login-form'
import { LandingPage } from '@/components/chatlingo/landing-page'
import { useEffect, useState, useCallback } from 'react'

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-2">{error.message}</p>
        <pre className="text-xs text-red-500 bg-red-50 p-3 rounded-lg mb-4 overflow-auto max-h-40 text-left">
          {error.stack?.substring(0, 500)}
        </pre>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#0F4C5C] text-white rounded-lg text-sm font-medium hover:bg-[#134E5E]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const { view, token, user, setUser } = useChatLingoStore()
  const [error, setError] = useState<Error | null>(null)
  const [ChatInterface, setChatInterface] = useState<React.ComponentType | null>(null)

  const reset = useCallback(() => {
    setError(null)
    setChatInterface(null)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('chatlingo_token')
      const savedUser = localStorage.getItem('chatlingo_user')

      const params = new URLSearchParams(window.location.search)
      if (params.has('logout') || params.has('fresh')) {
        localStorage.removeItem('chatlingo_token')
        localStorage.removeItem('chatlingo_user')
        window.history.replaceState({}, '', window.location.pathname)
        return
      }

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser, savedToken)
        } catch {
          localStorage.removeItem('chatlingo_token')
          localStorage.removeItem('chatlingo_user')
        }
      }
    }
  }, [setUser])

  // Lazy load ChatInterface only when needed
  useEffect(() => {
    if (view === 'chat' && token && user && !ChatInterface && !error) {
      import('@/components/chatlingo/chat-interface')
        .then(mod => setChatInterface(() => mod.ChatInterface))
        .catch(err => {
          console.error('Failed to load ChatInterface:', err)
          setError(err instanceof Error ? err : new Error(String(err)))
        })
    }
  }, [view, token, user, ChatInterface, error])

  if (error) {
    return <ErrorFallback error={error} reset={reset} />
  }

  if (view === 'landing') {
    return <LandingPage />
  }

  if (view === 'signup') {
    return <SignUpForm />
  }

  if (view === 'chat' && token && user) {
    if (ChatInterface) {
      return <ChatInterface />
    }
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#0F4C5C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading ChatLingo...</p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}
