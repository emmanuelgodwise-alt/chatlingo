'use client'

import { useEffect, useState, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { getLanguageFlag, getLanguageLabel } from '@/lib/languages'
import { BookOpen, Volume2, Lightbulb } from 'lucide-react'

export function WordOfTheDay() {
  const { token, setActiveConversation, setActiveTab } = useChatLingoStore()
  const [wordData, setWordData] = useState<{
    phrase: string
    language: string
    translations: Array<{ language: string; translation: string }>
    culturalNote: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadWord = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/explore/word-of-day', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setWordData(data.word || null)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadWord()
  }, [loadWord])

  const handlePractice = () => {
    setActiveTab('chats')
  }

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden bg-[#F1F5F9] h-40 animate-pulse p-4 space-y-2">
        <div className="h-3 bg-[#E5E5E5] rounded w-1/3" />
        <div className="h-5 bg-[#E5E5E5] rounded w-2/3" />
        <div className="h-3 bg-[#E5E5E5] rounded w-full" />
        <div className="h-3 bg-[#E5E5E5] rounded w-4/5" />
      </div>
    )
  }

  if (!wordData) return null

  return (
    <div className="rounded-xl bg-white border border-[#E5E5E5] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#ECFCCB] px-4 py-2.5 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#0F4C5C]" />
        <span className="text-[#0F4C5C] text-xs font-semibold">Word of the Day</span>
        <span className="text-[#0F4C5C]/60 text-xs ml-1">
          {getLanguageFlag(wordData.language)} {wordData.language}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <p className="text-xl font-bold text-[#0A0A0A]">{wordData.phrase}</p>

        {/* Translations */}
        <div className="space-y-1.5">
          {wordData.translations.slice(0, 5).map((t, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm">{getLanguageFlag(t.language)}</span>
              <span className="text-sm text-[#525252]">{getLanguageLabel(t.language)}</span>
              <span className="text-sm text-[#0A0A0A] font-medium">{t.translation}</span>
            </div>
          ))}
        </div>

        {/* Cultural Note */}
        {wordData.culturalNote && (
          <div className="flex items-start gap-2 bg-[#F1F5F9] rounded-lg p-3">
            <Lightbulb className="w-4 h-4 text-[#A3E635] mt-0.5 shrink-0" />
            <p className="text-xs text-[#525252] leading-relaxed">{wordData.culturalNote}</p>
          </div>
        )}

        {/* Practice Button */}
        <button
          onClick={handlePractice}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] text-sm font-medium rounded-full transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Practice in Chat
        </button>
      </div>
    </div>
  )
}
