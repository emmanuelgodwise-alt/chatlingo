'use client'

import { useState } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Globe, LogIn } from 'lucide-react'

export function LoginForm() {
  const { setView, setUser } = useChatLingoStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setUser(data.user, data.token)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center wa-auth-gradient p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ChatLingo</h1>
          <p className="text-white/70 mt-2 text-sm">
            Break the language barrier. Connect with the world.
          </p>
        </div>

        <Card className="shadow-xl border-0 rounded-lg overflow-hidden">
          <CardHeader className="text-center pb-2 pt-6 px-6">
            <CardTitle className="text-xl text-[#111B21] flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5 text-[#075E54]" />
              Welcome Back
            </CardTitle>
            <CardDescription className="text-[#667781]">
              Sign in to continue chatting across languages
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4 px-6">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#111B21] text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-md border-[#E9EDEF] focus:border-[#25D366] focus:ring-[#25D366]/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#111B21] text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-md border-[#E9EDEF] focus:border-[#25D366] focus:ring-[#25D366]/20"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
              <Button
                type="submit"
                className="w-full h-11 bg-[#25D366] hover:bg-[#22C55E] text-white font-semibold rounded-md shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>
              <p className="text-sm text-[#667781]">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="text-[#075E54] hover:text-[#128C7E] font-semibold"
                >
                  Create one
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-white/50 mt-6">
          Your conversations are end-to-end encrypted and auto-translated.
        </p>
      </div>
    </div>
  )
}
