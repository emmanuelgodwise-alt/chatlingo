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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES } from '@/lib/languages'
import { Globe, UserPlus } from 'lucide-react'

export function SignUpForm() {
  const { setView, setUser } = useChatLingoStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          preferredLanguage,
        }),
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
            <CardTitle className="text-xl text-[#1C1917] flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5 text-[#0F4C5C]" />
              Create Your Account
            </CardTitle>
            <CardDescription className="text-[#78716C]">
              Join millions breaking language barriers
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
                <Label htmlFor="name" className="text-[#1C1917] text-sm font-medium">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 rounded-md border-[#E2D9CF] focus:border-[#C45B28] focus:ring-[#C45B28]/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#1C1917] text-sm font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-md border-[#E2D9CF] focus:border-[#C45B28] focus:ring-[#C45B28]/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[#1C1917] text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-md border-[#E2D9CF] focus:border-[#C45B28] focus:ring-[#C45B28]/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#1C1917] text-sm font-medium">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-md border-[#E2D9CF] focus:border-[#C45B28] focus:ring-[#C45B28]/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[#1C1917] text-sm font-medium">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 rounded-md border-[#E2D9CF] focus:border-[#C45B28] focus:ring-[#C45B28]/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-[#1C1917] text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#0F4C5C]" />
                    Your Preferred Language *
                  </span>
                </Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger className="h-11 rounded-md border-[#E2D9CF] focus:border-[#C45B28] focus:ring-[#C45B28]/20">
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
              <Button
                type="submit"
                className="w-full h-11 bg-[#C45B28] hover:bg-[#A04920] text-white font-semibold rounded-md shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Next'
                )}
              </Button>
              <p className="text-sm text-[#78716C]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-[#0F4C5C] hover:text-[#1A6B7A] font-semibold"
                >
                  Sign in
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-white/50 mt-6">
          By creating an account, you agree to ChatLingo&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
