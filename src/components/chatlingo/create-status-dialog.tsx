'use client'

import { useState } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { X, Check } from 'lucide-react'

const GRADIENT_OPTIONS = [
  { id: 'emerald', colors: ['#075E54', '#25D366', '#128C7E'], label: 'Green' },
  { id: 'blue', colors: ['#1E3A5F', '#3B82F6', '#1E40AF'], label: 'Blue' },
  { id: 'red', colors: ['#7F1D1D', '#EF4444', '#B91C1C'], label: 'Red' },
  { id: 'purple', colors: ['#4C1D95', '#8B5CF6', '#6D28D9'], label: 'Purple' },
  { id: 'orange', colors: ['#78350F', '#F97316', '#C2410C'], label: 'Orange' },
  { id: 'pink', colors: ['#831843', '#EC4899', '#BE185D'], label: 'Pink' },
]

export function CreateStatusDialog() {
  const { token, setShowCreateStatus, setStatuses, statuses } = useChatLingoStore()
  const [content, setContent] = useState('')
  const [selectedGradient, setSelectedGradient] = useState('emerald')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim() || !token) return
    setPosting(true)
    setError('')

    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          bgGradient: selectedGradient,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setStatuses([data.status, ...statuses])
        setShowCreateStatus(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to post status')
      }
    } catch {
      setError('Failed to post status')
    } finally {
      setPosting(false)
    }
  }

  const activeGradient = GRADIENT_OPTIONS.find((g) => g.id === selectedGradient)
  const previewBg = activeGradient
    ? `linear-gradient(135deg, ${activeGradient.colors[0]} 0%, ${activeGradient.colors[1]} 50%, ${activeGradient.colors[2]} 100%)`
    : '#075E54'

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl animate-fadeIn">
        {/* Header */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowCreateStatus(false)}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-white font-semibold text-base">Create Status</h3>
          <div className="w-7" />
        </div>

        {/* Preview */}
        <div
          className="mx-4 mt-4 rounded-xl h-40 flex items-center justify-center px-6"
          style={{ background: previewBg }}
        >
          <p className="text-white text-lg text-center whitespace-pre-wrap break-words">
            {content.trim() || 'Your status preview...'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a status..."
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 bg-[#F0F2F5] rounded-lg text-sm text-[#111B21] placeholder:text-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25D366] border-none resize-none"
          />

          {/* Gradient Picker */}
          <div>
            <p className="text-xs text-[#667781] mb-2">Background</p>
            <div className="flex gap-2">
              {GRADIENT_OPTIONS.map((gradient) => (
                <button
                  key={gradient.id}
                  onClick={() => setSelectedGradient(gradient.id)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedGradient === gradient.id
                      ? 'ring-2 ring-[#075E54] ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 50%, ${gradient.colors[2]} 100%)`,
                  }}
                  title={gradient.label}
                />
              ))}
            </div>
          </div>

          {/* Duration Notice */}
          <p className="text-[11px] text-[#8696A0] text-center">
            ⏱ Disappears in 24 hours
          </p>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || posting}
            className="px-6 py-2 bg-[#25D366] hover:bg-[#22C55E] text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 shadow-sm"
          >
            {posting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
