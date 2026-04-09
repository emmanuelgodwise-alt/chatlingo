'use client'

// Clear session IMMEDIATELY before any React code runs
// This handles both ?fresh query param and #fresh hash (hash survives proxy rewrites)
if (typeof window !== 'undefined') {
  const url = window.location.href
  if (url.includes('fresh') || url.includes('logout')) {
    localStorage.removeItem('chatlingo_token')
    localStorage.removeItem('chatlingo_user')
    window.history.replaceState({}, '', window.location.pathname)
  }
}

import { useChatLingoStore } from '@/lib/store'
import { SignUpForm } from '@/components/chatlingo/sign-up-form'
import { LoginForm } from '@/components/chatlingo/login-form'
import { ChatInterface } from '@/components/chatlingo/chat-interface'
import { useEffect } from 'react'

export default function Home() {
  const { view, token, user, setUser } = useChatLingoStore()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('chatlingo_token')
      const savedUser = localStorage.getItem('chatlingo_user')
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

  if (view === 'signup') {
    return <SignUpForm />
  }

  if (view === 'login' && !token) {
    return <LoginForm />
  }

  if (view === 'chat' && token && user) {
    return <ChatInterface />
  }

  return <LoginForm />
}
