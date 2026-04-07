'use client'

import { useEffect, useState, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Globe, Share2, BookOpen } from 'lucide-react'

export function SpotlightCard() {
  const { token } = useChatLingoStore()
  const [spotlight, setSpotlight] = useState<{
    culture: string
    tradition: string
    description: string
    translatedDescription?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSpotlight = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/spotlight', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSpotlight(data.spotlight || null)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadSpotlight()
  }, [loadSpotlight])

  const gradients = [
    'linear-gradient(135deg, #0F4C5C 0%, #C45B28 40%, #1A6B7A 70%, #0A6E5C 100%)',
    'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 40%, #1E40AF 70%, #172554 100%)',
    'linear-gradient(135deg, #7F1D1D 0%, #EF4444 40%, #B91C1C 70%, #450A0A 100%)',
  ]

  const randomGradient = gradients[new Date().getDate() % gradients.length]

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden h-48 bg-[#F5F0EA] animate-pulse">
        <div className="p-4 space-y-3">
          <div className="h-4 bg-[#E2D9CF] rounded w-1/2" />
          <div className="h-3 bg-[#E2D9CF] rounded w-full" />
          <div className="h-3 bg-[#E2D9CF] rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!spotlight) return null

  return (
    <div className="rounded-xl overflow-hidden shadow-md">
      <div
        className="wa-gradient-rotate p-5 relative"
        style={{ background: randomGradient }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-white/90" />
          <span className="text-white/90 text-xs font-semibold uppercase tracking-wide">
            Today&apos;s Cultural Spotlight
          </span>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-white text-lg font-bold mb-1">{spotlight.culture}</h3>
          <p className="text-white/80 text-sm font-medium mb-2">{spotlight.tradition}</p>
          <p className="text-white/70 text-sm leading-relaxed">
            {spotlight.translatedDescription || spotlight.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs font-medium transition-colors backdrop-blur-sm">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs font-medium transition-colors backdrop-blur-sm">
            <BookOpen className="w-3.5 h-3.5" />
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}
