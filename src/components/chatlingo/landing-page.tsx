'use client'

import { useChatLingoStore } from '@/lib/store'
import { useEffect } from 'react'

export function LandingPage() {
  const { setView, setUser } = useChatLingoStore()

  // Allow body scroll for landing page
  useEffect(() => {
    document.body.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = 'hidden'
    }
  }, [])

  // Check for returning user on mount
  const savedName = typeof window !== 'undefined'
    ? (() => { try { const u = localStorage.getItem('chatlingo_user'); return u ? JSON.parse(u)?.name || null : null } catch { return null } })()
    : null

  // "Sign In" handler: if saved session exists, restore it and go to chat; otherwise show login form
  const handleSignIn = () => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('chatlingo_token')
      const savedUser = localStorage.getItem('chatlingo_user')
      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser)
          setUser(parsed, savedToken)
          return
        } catch { /* fall through to login form */ }
      }
    }
    setView('login')
  }

  return (
    <div className="min-h-screen bg-white overflow-y-auto overflow-x-hidden">

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#0F4C5C] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large gradient orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#134E5E]/40 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#A3E635]/10 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-[#0F766E]/30 blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '4s' }} />

          {/* Floating language bubbles */}
          <div className="absolute top-[15%] left-[8%] animate-float-slow opacity-20">
            <span className="text-white text-6xl font-light select-none">EN</span>
          </div>
          <div className="absolute top-[25%] right-[12%] animate-float-medium opacity-20">
            <span className="text-[#A3E635] text-5xl font-light select-none">JP</span>
          </div>
          <div className="absolute bottom-[30%] left-[15%] animate-float-fast opacity-15">
            <span className="text-white text-4xl font-light select-none">ES</span>
          </div>
          <div className="absolute top-[60%] right-[20%] animate-float-slow opacity-20">
            <span className="text-[#A3E635] text-5xl font-light select-none">FR</span>
          </div>
          <div className="absolute top-[45%] left-[5%] animate-float-medium opacity-15">
            <span className="text-white text-3xl font-light select-none">ZH</span>
          </div>
          <div className="absolute bottom-[20%] right-[8%] animate-float-fast opacity-15">
            <span className="text-[#A3E635] text-4xl font-light select-none">DE</span>
          </div>

          {/* Subtle connection lines (decorative) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="20%" x2="90%" y2="35%" stroke="white" strokeWidth="1" />
            <line x1="15%" y1="60%" x2="85%" y2="25%" stroke="white" strokeWidth="1" />
            <line x1="20%" y1="80%" x2="80%" y2="50%" stroke="white" strokeWidth="1" />
            <circle cx="10%" cy="20%" r="3" fill="#A3E635" />
            <circle cx="90%" cy="35%" r="3" fill="#A3E635" />
            <circle cx="15%" cy="60%" r="3" fill="white" />
            <circle cx="85%" cy="25%" r="3" fill="white" />
            <circle cx="20%" cy="80%" r="3" fill="#A3E635" />
            <circle cx="80%" cy="50%" r="3" fill="#A3E635" />
          </svg>

          {/* Grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Logo mark */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <img src="/chatlingo-logo.png" alt="ChatLingo" className="w-36 h-auto mx-auto mb-6 drop-shadow-[0_0_40px_rgba(163,230,53,0.3)]" />
          </div>

          {/* Brand name */}
          <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Chat<span className="text-[#A3E635]">Lingo</span>
          </h1>

          {/* Main sales copy — paragraph 1 */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-10 animate-fade-in-up font-light" style={{ animationDelay: '0.4s' }}>
            ChatLingo doesn&apos;t just translate your messages — it makes the translation invisible.{' '}
            <span className="text-white font-medium">You type in English. Your friend in Tokyo reads in Japanese. They reply in Japanese. You read in English.</span>{' '}
            No buttons. No delays. No breaking the flow of a real conversation.
          </p>

          {/* Divider — emotional hook */}
          <div className="relative my-12 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-[#0F4C5C] px-6 py-3">
                <p className="text-base sm:text-lg text-[#A3E635] font-medium italic leading-relaxed">
                  The world is full of incredible people — and incredible conversations that never happen because of language.
                </p>
              </div>
            </div>
          </div>

          {/* Final statement */}
          <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            ChatLingo is the first social media that help you break that global language barrier to connect with people of different cultures around the globe.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            {/* Returning user: show "Continue as..." */}
            {savedName && (
              <button
                onClick={handleSignIn}
                className="group w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-base rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#A3E635] flex items-center justify-center text-[#0A0A0A] text-xs font-bold shrink-0">
                  {savedName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span>Continue as {savedName.split(' ')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setView('signup')}
                className="group w-full sm:w-auto px-8 py-4 bg-[#A3E635] hover:bg-[#bef264] text-[#0A0A0A] font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(163,230,53,0.25)] hover:shadow-[0_0_60px_rgba(163,230,53,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={handleSignIn}
                className="w-full sm:w-auto px-8 py-4 border-2 border-white/25 hover:border-white/50 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-white/40 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            Free forever. No credit card required. End-to-end encrypted.
          </p>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ===== MINIMAL FOOTER ===== */}
      <footer className="py-8 px-6 text-center bg-white">
        <p className="text-xs text-[#A3A3A3]">
          &copy; {new Date().getFullYear()} ChatLingo. Breaking language barriers, one conversation at a time.
        </p>
      </footer>

    </div>
  )
}
