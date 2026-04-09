'use client'

import { useState } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { X, Radio, Globe } from 'lucide-react'
import { getLanguageFlag, LANGUAGES } from '@/lib/languages'

export function CreateRoomDialog() {
  const { token, setShowCreateRoom, setActiveRoom, setIsInRoom, setRoomRole } = useChatLingoStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('English')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim() || !token) return
    setCreating(true)
    setError('')

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          language,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const room = data.room
        setActiveRoom({
          ...room,
          isLive: true,
          participants: [],
        })
        setRoomRole('speaker')
        setIsInRoom(true)
        setShowCreateRoom(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create room')
      }
    } catch {
      setError('Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50" onClick={() => setShowCreateRoom(false)}>
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowCreateRoom(false)}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold text-base">Start Room</h3>
          </div>
          <div className="w-7" />
        </div>

        <div className="p-4 space-y-4">
          {/* Room Name */}
          <div>
            <label className="text-xs text-[#525252] font-medium mb-1 block">Room Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., French Conversation Practice"
              maxLength={50}
              className="w-full px-3 py-2.5 bg-[#F1F5F9] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-[#84CC16] border-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#525252] font-medium mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will people talk about?"
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2.5 bg-[#F1F5F9] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-[#84CC16] border-none resize-none"
            />
          </div>

          {/* Language */}
          <div>
            <label className="text-xs text-[#525252] font-medium mb-1 block">Room Language</label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F1F5F9] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#84CC16] border-none appearance-none cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252] pointer-events-none" />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="px-6 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            {creating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              <>
                <Radio className="w-4 h-4" />
                Start Room
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
