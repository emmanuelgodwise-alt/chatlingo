'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { X, Reply, ChevronLeft, ChevronRight } from 'lucide-react'

export function StatusViewer() {
  const {
    token,
    user,
    statuses,
    activeStatusIndex,
    setActiveStatusIndex,
    setShowStatusViewer,
    setActiveConversation,
    setConversations,
  } = useChatLingoStore()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<number>(0)
  const animFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentStatus = statuses[activeStatusIndex]

  const markAsViewed = useCallback(async (statusId: string) => {
    if (!token) return
    try {
      await fetch(`/api/status/${statusId}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // ignore
    }
  }, [token])

  const advanceToNext = useCallback(() => {
    if (activeStatusIndex < statuses.length - 1) {
      const nextIdx = activeStatusIndex + 1
      markAsViewed(statuses[nextIdx]?.id)
      setActiveStatusIndex(nextIdx)
      startTimeRef.current = Date.now()
      progressRef.current = 0
    } else {
      setShowStatusViewer(false)
    }
  }, [activeStatusIndex, statuses, setActiveStatusIndex, setShowStatusViewer, markAsViewed])

  const goToPrevious = useCallback(() => {
    if (activeStatusIndex > 0) {
      setActiveStatusIndex(activeStatusIndex - 1)
      startTimeRef.current = Date.now()
      progressRef.current = 0
    }
  }, [activeStatusIndex, setActiveStatusIndex])

  // Auto-advance timer
  useEffect(() => {
    if (!currentStatus) return

    markAsViewed(currentStatus.id)

    const DURATION = 5000
    startTimeRef.current = Date.now()
    progressRef.current = 0

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      progressRef.current = Math.min((elapsed / DURATION) * 100, 100)

      // Update progress bars
      const fills = document.querySelectorAll('.wa-status-progress .fill')
      fills.forEach((fill, idx) => {
        const el = fill as HTMLElement
        if (idx < activeStatusIndex) {
          el.style.width = '100%'
        } else if (idx === activeStatusIndex) {
          el.style.width = `${progressRef.current}%`
        } else {
          el.style.width = '0%'
        }
      })

      if (progressRef.current >= 100) {
        advanceToNext()
        return
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeStatusIndex, currentStatus, advanceToNext, markAsViewed])

  const handleReply = async () => {
    if (!currentStatus || !token) return
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participant2Id: currentStatus.owner.id,
          participant2Lang: currentStatus.language,
        }),
      })
      if (res.ok) {
        const convRes = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (convRes.ok) {
          const data = await convRes.json()
          setConversations(data.conversations)
          const conv = data.conversations.find(
            (c: { otherUser: { id: string } }) => c.otherUser.id === currentStatus.owner.id
          )
          if (conv) setActiveConversation(conv)
        }
        setShowStatusViewer(false)
        useChatLingoStore.getState().setActiveTab('chats')
      }
    } catch {
      // ignore
    }
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const third = rect.width / 3

    if (clickX < third) {
      goToPrevious()
    } else if (clickX > third * 2) {
      advanceToNext()
    }
  }

  // Group statuses by owner for progress bars
  const statusGroups: string[] = []
  statuses.forEach((s) => {
    if (!statusGroups.includes(s.owner.id)) statusGroups.push(s.owner.id)
  })

  if (!currentStatus) return null

  const gradientMap: Record<string, string> = {
    emerald: 'linear-gradient(135deg, #0F4C5C 0%, #84CC16 50%, #0D4D47 100%)',
    blue: 'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 50%, #1E40AF 100%)',
    red: 'linear-gradient(135deg, #7F1D1D 0%, #EF4444 50%, #B91C1C 100%)',
    purple: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 50%, #6D28D9 100%)',
    orange: 'linear-gradient(135deg, #78350F 0%, #F97316 50%, #C2410C 100%)',
    pink: 'linear-gradient(135deg, #831843 0%, #EC4899 50%, #BE185D 100%)',
  }

  const bgGradient = gradientMap[currentStatus.bgGradient] || gradientMap.emerald

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Progress Bars */}
      <div className="flex gap-1 px-2 pt-2 z-10">
        {statuses.map((s, idx) => (
          <div key={s.id} className="wa-status-progress">
            <div className="fill" style={{ width: idx < activeStatusIndex ? '100%' : '0%' }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 z-10">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-[#E2E8F0] text-[#0A0A0A] text-xs font-semibold">
              {currentStatus.owner.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white text-sm font-medium">{currentStatus.owner.name}</p>
            <p className="text-white/60 text-xs">Today</p>
          </div>
        </div>
        <button
          onClick={() => setShowStatusViewer(false)}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Status Content */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="flex-1 flex items-center justify-center px-8 cursor-pointer"
        style={{ background: bgGradient }}
      >
        <div className="max-w-sm text-center">
          {currentStatus.mediaUrl && (
            <img
              src={currentStatus.mediaUrl}
              alt="Status media"
              className="w-full max-h-[60vh] object-cover rounded-lg mb-4"
            />
          )}
          <p className="text-white text-xl font-medium whitespace-pre-wrap break-words leading-relaxed">
            {currentStatus.content}
          </p>
        </div>
      </div>

      {/* Translation bar */}
      {user && currentStatus.language !== user.preferredLanguage && (
        <div className="px-4 py-3 bg-black/40 backdrop-blur-sm">
          <p className="text-white/80 text-sm text-center">
            Translated from {currentStatus.language}
          </p>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
        <button
          onClick={goToPrevious}
          disabled={activeStatusIndex === 0}
          className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleReply}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Reply"
        >
          <Reply className="w-6 h-6" />
        </button>

        <button
          onClick={advanceToNext}
          disabled={activeStatusIndex === statuses.length - 1}
          className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
