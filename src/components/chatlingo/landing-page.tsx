'use client'

import { useChatLingoStore } from '@/lib/store'
import { useEffect } from 'react'

export function LandingPage() {
  const { setView } = useChatLingoStore()

  // Allow body scroll for landing page
  useEffect(() => {
    document.body.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = 'hidden'
    }
  }, [])

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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#A3E635] shadow-[0_0_60px_rgba(163,230,53,0.3)] mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="#0A0A0A" />
                <circle cx="12" cy="10" r="1" fill="#0A0A0A" />
                <circle cx="15" cy="10" r="1" fill="#0A0A0A" />
                <path d="M8 2v4M12 2v4M16 2v4" strokeDasharray="2 2" />
              </svg>
            </div>
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
            ChatLingo is the first Chatting App that helps you break that global language barrier to socialize with people of different cultures all over the world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '1s' }}>
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
              onClick={() => setView('login')}
              className="w-full sm:w-auto px-8 py-4 border-2 border-white/25 hover:border-white/50 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Sign In
            </button>
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
