'use client'

import { useState } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { X, Hash } from 'lucide-react'

export function CreateChannelDialog() {
  const { token, setShowCreateChannel } = useChatLingoStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim() || !token) return
    setCreating(true)
    setError('')

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          isPublic,
        }),
      })
      if (res.ok) {
        setShowCreateChannel(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create channel')
      }
    } catch {
      setError('Failed to create channel')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl animate-fadeIn">
        {/* Header */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowCreateChannel(false)}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold text-base">Create Channel</h3>
          </div>
          <div className="w-7" />
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-[#667781] font-medium mb-1 block">Channel Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., French Learners"
              maxLength={50}
              className="w-full px-3 py-2.5 bg-[#F0F2F5] rounded-lg text-sm text-[#111B21] placeholder:text-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25D366] border-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#667781] font-medium mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2.5 bg-[#F0F2F5] rounded-lg text-sm text-[#111B21] placeholder:text-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25D366] border-none resize-none"
            />
          </div>

          {/* Public/Private Toggle */}
          <div>
            <label className="text-xs text-[#667781] font-medium mb-2 block">Visibility</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPublic(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPublic
                    ? 'bg-[#E7FCE3] text-[#075E54] border-2 border-[#25D366]'
                    : 'bg-[#F0F2F5] text-[#667781] border-2 border-transparent hover:border-[#E9EDEF]'
                }`}
              >
                🌍 Public
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !isPublic
                    ? 'bg-[#E7FCE3] text-[#075E54] border-2 border-[#25D366]'
                    : 'bg-[#F0F2F5] text-[#667781] border-2 border-transparent hover:border-[#E9EDEF]'
                }`}
              >
                🔒 Private
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="px-6 py-2 bg-[#25D366] hover:bg-[#22C55E] text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 shadow-sm"
          >
            {creating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
