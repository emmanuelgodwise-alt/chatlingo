'use client'

import { useEffect, useState, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { getLanguageFlag } from '@/lib/languages'
import {
  Search,
  Plus,
  Radio,
  Mic,
  Users,
  Headphones,
  Wifi,
  WifiOff,
} from 'lucide-react'

export function RoomsTab() {
  const {
    token,
    setShowCreateRoom,
    setActiveRoom,
    setIsInRoom,
    setRoomRole,
  } = useChatLingoStore()

  const [rooms, setRooms] = useState<Array<{
    id: string
    name: string
    description?: string
    language: string
    speakerCount: number
    listenerCount: number
    isLive: boolean
    owner: { id: string; name: string; avatar?: string | null }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadRooms = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setRooms(data.rooms || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const handleJoinRoom = async (roomId: string, role: 'speaker' | 'listener') => {
    if (!token) return
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        const room = rooms.find((r) => r.id === roomId)
        if (room) {
          setActiveRoom({
            ...room,
            isLive: true,
            participants: [],
          })
          setRoomRole(role)
          setIsInRoom(true)
        }
      }
    } catch {
      // ignore
    }
  }

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F1F5F9]">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between wa-shadow-header shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-white" />
          <h2 className="text-white font-semibold text-base">Live Rooms</h2>
        </div>
        <button
          onClick={() => setShowCreateRoom(true)}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white border-b border-[#E5E5E5] shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-[#F1F5F9] border-none rounded-lg text-sm placeholder:text-[#525252] focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {loading ? (
          <div className="p-8 text-center">
            <span className="w-6 h-6 border-2 border-[#A3E635]/30 border-t-[#A3E635] rounded-full animate-spin inline-block" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-8">
            <Radio className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" />
            <p className="text-sm text-[#525252]">No live rooms</p>
            <p className="text-xs text-[#A3A3A3] mt-1">Create a room to start talking!</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const ownerInitials = room.owner.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            return (
              <div
                key={room.id}
                className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#0F4C5C] flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#0A0A0A] truncate">{room.name}</h3>
                      {room.isLive && (
                        <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full wa-live-dot" />
                          LIVE
                        </span>
                      )}
                    </div>
                    {room.description && (
                      <p className="text-xs text-[#525252] truncate">{room.description}</p>
                    )}
                    <p className="text-xs text-[#A3A3A3] mt-0.5">
                      {getLanguageFlag(room.language)} {room.language}
                    </p>
                  </div>
                </div>

                {/* Participants count */}
                <div className="flex items-center gap-4 mb-3 text-xs text-[#525252]">
                  <div className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" />
                    <span>{room.speakerCount} speakers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{room.listenerCount} listeners</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="bg-[#E5E5E5] text-[8px]">
                        {ownerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{room.owner.name}</span>
                  </div>
                </div>

                {/* Join buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJoinRoom(room.id, 'listener')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F1F5F9] hover:bg-[#E5E5E5] text-[#0A0A0A] text-xs font-medium rounded-full transition-colors"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    Listen
                  </button>
                  <button
                    onClick={() => handleJoinRoom(room.id, 'speaker')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] text-xs font-medium rounded-full transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Speak
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
