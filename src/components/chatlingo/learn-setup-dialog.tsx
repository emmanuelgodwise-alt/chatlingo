'use client'

import { useChatLingoStore } from '@/lib/store'
import { LANGUAGES, getLanguageFlag } from '@/lib/languages'
import { X, ChevronDown, GraduationCap, ArrowRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function LearnSetupDialog() {
  const {
    user,
    token,
    setShowLearnSetup,
    setLearningProfile,
  } = useChatLingoStore()

  const [nativeLanguage, setNativeLanguage] = useState(
    user?.preferredLanguage || 'English'
  )
  const [targetLanguage, setTargetLanguage] = useState('')
  const [showNativeDropdown, setShowNativeDropdown] = useState(false)
  const [showTargetDropdown, setShowTargetDropdown] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const availableTargetLanguages = LANGUAGES.filter(
    (l) => l.code !== nativeLanguage
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNativeDropdown(false)
        setShowTargetDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async () => {
    if (!targetLanguage || !token) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/learn/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetLanguage, nativeLanguage }),
      })
      if (res.ok) {
        const profile = await res.json()
        setLearningProfile(profile)
        setShowLearnSetup(false)
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const nativeLabel =
    LANGUAGES.find((l) => l.code === nativeLanguage)?.label || nativeLanguage
  const nativeFlag = getLanguageFlag(nativeLanguage)
  const targetLabel =
    LANGUAGES.find((l) => l.code === targetLanguage)?.label || ''
  const targetFlag = targetLanguage ? getLanguageFlag(targetLanguage) : ''

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Green Header */}
        <div className="bg-[#0F4C5C] px-6 py-5 rounded-t-xl flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-white text-xl font-semibold">
              <span className="text-2xl">🎓</span>
              Start Learning
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Choose the language you want to learn
            </p>
          </div>
          <button
            onClick={() => setShowLearnSetup(false)}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Language Pair Visual */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center text-3xl">
                {nativeFlag}
              </div>
              <span className="text-xs text-[#525252] font-medium">
                I speak
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-[#84CC16]" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center text-3xl">
                {targetFlag || '🌐'}
              </div>
              <span className="text-xs text-[#525252] font-medium">
                I learn
              </span>
            </div>
          </div>

          {/* Native Language Dropdown */}
          <div className="space-y-1.5" ref={dropdownRef}>
            <label className="text-sm font-medium text-[#0A0A0A]">
              Your native language
            </label>
            <button
              onClick={() => {
                setShowNativeDropdown(!showNativeDropdown)
                setShowTargetDropdown(false)
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors text-sm text-[#0A0A0A]"
            >
              <span className="flex items-center gap-2">
                <span>{nativeFlag}</span>
                <span>{nativeLabel}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#525252] transition-transform ${
                  showNativeDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showNativeDropdown && (
              <div className="absolute z-50 mt-1 w-[calc(100%-3rem)] max-h-48 overflow-y-auto bg-white rounded-lg border border-[#E2E8F0] shadow-lg scrollbar-thin">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setNativeLanguage(lang.code)
                      setShowNativeDropdown(false)
                      if (targetLanguage === lang.code) setTargetLanguage('')
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 ${
                      lang.code === nativeLanguage
                        ? 'bg-[#84CC16]/10 text-[#0F4C5C] font-medium'
                        : 'text-[#0A0A0A]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === nativeLanguage && (
                      <span className="ml-auto text-[#84CC16]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Target Language Dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0A0A0A]">
              Language you want to learn
            </label>
            <button
              onClick={() => {
                setShowTargetDropdown(!showTargetDropdown)
                setShowNativeDropdown(false)
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors text-sm text-[#0A0A0A]"
            >
              <span className="flex items-center gap-2">
                <span>{targetFlag || '🌐'}</span>
                <span className={targetLanguage ? '' : 'text-[#A3A3A3]'}>
                  {targetLabel || 'Select a language...'}
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#525252] transition-transform ${
                  showTargetDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showTargetDropdown && (
              <div className="absolute z-50 mt-1 w-[calc(100%-3rem)] max-h-48 overflow-y-auto bg-white rounded-lg border border-[#E2E8F0] shadow-lg scrollbar-thin">
                {availableTargetLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setTargetLanguage(lang.code)
                      setShowTargetDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 ${
                      lang.code === targetLanguage
                        ? 'bg-[#84CC16]/10 text-[#0F4C5C] font-medium'
                        : 'text-[#0A0A0A]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === targetLanguage && (
                      <span className="ml-auto text-[#84CC16]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-[#F1F5F9] rounded-lg p-3">
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-[#0F4C5C] mt-0.5 shrink-0" />
              <div className="text-xs text-[#525252] space-y-1">
                <p>
                  You&apos;ll get personalized lessons, exercises, and vocabulary
                  tailored to your language pair.
                </p>
                <p>
                  You can also connect with native speakers to practice
                  real conversations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2 border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!targetLanguage || submitting}
            className="bg-[#0F4C5C] hover:bg-[#134E5E] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Setting up...' : 'Begin Learning'}
          </button>
        </div>
      </div>
    </div>
  )
}
