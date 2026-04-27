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
import { Globe, UserPlus, Eye, EyeOff } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    <div className="h-screen flex items-center justify-center wa-auth-gradient p-3 overflow-y-auto">
      <div className="w-full max-w-md my-2">
        {/* Brand — compact */}
        <div className="text-center mb-4">
          <img src="/chatlingo-logo.png" alt="ChatLingo" className="w-16 h-auto mx-auto mb-2 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-white tracking-tight">ChatLingo</h1>
          <p className="text-white/70 mt-1 text-xs">
            Break the language barrier. Connect with the world.
          </p>
        </div>

        <Card className="shadow-xl border-0 rounded-lg overflow-hidden">
          <CardHeader className="text-center pb-1 pt-4 px-5">
            <CardTitle className="text-lg text-[#0A0A0A] flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4 text-[#0F4C5C]" />
              Create Your Account
            </CardTitle>
            <CardDescription className="text-[#525252] text-xs">
              Join millions breaking language barriers
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-2.5 pt-3 px-5">
              {error && (
                <div className="bg-red-50 text-red-700 text-xs p-2 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="name" className="text-[#0A0A0A] text-xs font-medium">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9 rounded-md border-[#E5E5E5] focus:border-[#A3E635] focus:ring-[#A3E635]/20 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-[#0A0A0A] text-xs font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9 rounded-md border-[#E5E5E5] focus:border-[#A3E635] focus:ring-[#A3E635]/20 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-[#0A0A0A] text-xs font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 rounded-md border-[#E5E5E5] focus:border-[#A3E635] focus:ring-[#A3E635]/20 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-[#0A0A0A] text-xs font-medium">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9 rounded-md border-[#E5E5E5] focus:border-[#A3E635] focus:ring-[#A3E635]/20 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 p-2 text-[#A3A3A3] hover:text-[#0A0A0A] active:text-[#0F4C5C] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-[#0A0A0A] text-xs font-medium">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-9 rounded-md border-[#E5E5E5] focus:border-[#A3E635] focus:ring-[#A3E635]/20 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 p-2 text-[#A3A3A3] hover:text-[#0A0A0A] active:text-[#0F4C5C] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="language" className="text-[#0A0A0A] text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#0F4C5C]" />
                    Your Preferred Language *
                  </span>
                </Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger className="h-9 rounded-md border-[#E5E5E5] focus:border-[#A3E635] focus:ring-[#A3E635]/20 text-sm">
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
            <CardFooter className="flex flex-col gap-3 pt-2 pb-4 px-5">
              <Button
                type="submit"
                className="w-full h-9 bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] font-semibold rounded-md shadow-sm text-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Next'
                )}
              </Button>
              <p className="text-xs text-[#525252]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-[#0F4C5C] hover:text-[#134E5E] font-semibold"
                >
                  Sign in
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[10px] text-white/50 mt-3">
          By creating an account, you agree to ChatLingo&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
