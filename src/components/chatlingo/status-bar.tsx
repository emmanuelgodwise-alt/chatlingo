'use client'

import { useEffect, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Pencil } from 'lucide-react'

export function StatusBar() {
  const {
    token,
    user,
    statuses,
    setStatuses,
    setShowStatusViewer,
    setActiveStatusIndex,
    setShowCreateStatus,
  } = useChatLingoStore()

  const loadStatuses = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStatuses(data.statuses || [])
      }
    } catch {
      // ignore
    }
  }, [token, setStatuses])

  useEffect(() => {
    loadStatuses()
  }, [loadStatuses])

  // Group statuses by owner
  const statusByOwner = statuses.reduce<Record<string, typeof statuses>>((acc, s) => {
    if (!acc[s.owner.id]) acc[s.owner.id] = []
    acc[s.owner.id].push(s)
    return acc
  }, {})

  // Get unique owners (sorted: unseen first)
  const owners = Object.entries(statusByOwner)
    .sort(([, a], [, b]) => {
      const aSeen = a.every((s) => s.viewed)
      const bSeen = b.every((s) => s.viewed)
      if (aSeen === bSeen) return 0
      return aSeen ? 1 : -1
    })
    .map(([ownerId, ownerStatuses]) => ({
      id: ownerId,
      name: ownerStatuses[0].owner.name,
      avatar: ownerStatuses[0].owner.avatar,
      allViewed: ownerStatuses.every((s) => s.viewed),
    }))

  const handleViewStatus = (ownerId: string) => {
    const ownerStatuses = statusByOwner[ownerId]
    if (!ownerStatuses || ownerStatuses.length === 0) return

    // Find the first unseen status index in the flat list
    const firstUnseenGlobalIdx = statuses.findIndex(
      (s) => s.owner.id === ownerId && !s.viewed
    )
    const globalIdx = firstUnseenGlobalIdx >= 0 ? firstUnseenGlobalIdx : statuses.findIndex(
      (s) => s.owner.id === ownerId
    )

    setActiveStatusIndex(globalIdx)
    setShowStatusViewer(true)
  }

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <div className="px-3 py-2 bg-white border-b border-[#E5E5E5]">
      <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-1">
        {/* My Status */}
        <button
          onClick={() => setShowCreateStatus(true)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-[#E5E5E5] text-[#0A0A0A] text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#A3E635] rounded-full flex items-center justify-center border-2 border-white">
              <Plus className="w-3 h-3 text-[#0A0A0A]" />
            </div>
          </div>
          <span className="text-[11px] text-[#525252] w-[56px] text-center truncate">My Status</span>
        </button>

        {/* Contact statuses */}
        {owners.map((owner) => (
          <button
            key={owner.id}
            onClick={() => handleViewStatus(owner.id)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="relative">
              <div className={`w-[52px] h-[52px] rounded-full p-[3px] ${
                owner.allViewed
                  ? 'bg-[#C5C5C5]'
                  : 'bg-gradient-to-tr from-[#A3E635] via-[#134E5E] to-[#0F4C5C]'
              }`}>
                <Avatar className="w-full h-full border-2 border-white">
                  <AvatarFallback className="bg-[#E5E5E5] text-[#0A0A0A] text-sm font-semibold">
                    {owner.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-[11px] text-[#0A0A0A] w-[56px] text-center truncate">{owner.name}</span>
          </button>
        ))}

        {/* Add Status button */}
        <button
          onClick={() => setShowCreateStatus(true)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center">
            <Pencil className="w-5 h-5 text-[#525252]" />
          </div>
          <span className="text-[11px] text-[#525252]">Add</span>
        </button>
      </div>
    </div>
  )
}
