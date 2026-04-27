'use client'

import { useState, useEffect } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { X, Send } from 'lucide-react'

export function CreateBroadcastDialog() {
  const { token, showBroadcast, setShowBroadcast } = useChatLingoStore()
  const [lists, setLists] = useState<Array<{ id: string; name: string }>>([])
  const [selectedList, setSelectedList] = useState<string>('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const loadLists = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/broadcast', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLists(data.lists || [])
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => { if (showBroadcast) loadLists() }, [showBroadcast])

  const handleSend = async () => {
    if (!token || !selectedList || !message.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/broadcast/${selectedList}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: message }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          setShowBroadcast(false)
          setMessage('')
          setSelectedList('')
          setSuccess(false)
        }, 1500)
      }
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  if (!showBroadcast) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Broadcast Message</h3>
          <button onClick={() => setShowBroadcast(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">Message sent!</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Broadcast List</label>
              <select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C]"
              >
                <option value="">Select a list...</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message..."
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C]"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!selectedList || !message.trim() || sending}
              className="w-full py-3 bg-[#A3E635] hover:bg-[#bef264] disabled:bg-gray-200 disabled:text-gray-400 text-[#0A0A0A] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
