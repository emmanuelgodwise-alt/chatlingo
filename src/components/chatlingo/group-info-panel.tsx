'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag, getLanguageLabel } from '@/lib/languages'
import { X, Users, Crown, Shield, UserPlus, Globe, LogOut } from 'lucide-react'

export function GroupInfoPanel() {
  const {
    token,
    user,
    activeConversation,
    setActiveConversation,
  } = useChatLingoStore()

  const [members, setMembers] = useState<Array<{
    id: string
    name: string
    avatar?: string | null
    preferredLanguage: string
    role: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<{
    name: string
    description?: string
    ownerId: string
  } | null>(null)

  useEffect(() => {
    if (!token || !activeConversation) return
    setLoading(true)

    const loadGroup = async () => {
      try {
        // Get group info from conversation
        const res = await fetch(`/api/groups/${activeConversation.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setGroup(data.group || { name: activeConversation.otherUser.name, ownerId: '' })
          setMembers(data.members || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    loadGroup()
  }, [token, activeConversation])

  const handleAddParticipant = () => {
    // Could open a dialog to add participants
    const store = useChatLingoStore.getState()
    store.setShowCreateGroup(true)
  }

  if (!activeConversation) return null

  const isAdmin = group?.ownerId === user?.id

  return (
    <div className="w-full md:w-80 lg:w-[360px] bg-white border-l border-[#E2D9CF] flex flex-col h-full wa-slide-panel">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => setActiveConversation(null)}
          className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-white font-semibold text-base">Group Info</h3>
        <div className="w-7" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-8 text-center">
            <span className="w-6 h-6 border-2 border-[#C45B28]/30 border-t-[#C45B28] rounded-full animate-spin inline-block" />
          </div>
        ) : (
          <div>
            {/* Group Avatar & Name */}
            <div className="flex flex-col items-center py-6 px-4">
              <div className="w-20 h-20 rounded-full bg-[#C45B28] flex items-center justify-center mb-3">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#1C1917]">
                {group?.name || activeConversation.otherUser.name}
              </h2>
              {group?.description && (
                <p className="text-sm text-[#78716C] text-center mt-1">{group.description}</p>
              )}
              <p className="text-xs text-[#9CA3AF] mt-2">Group · {members.length} members</p>
            </div>

            {/* Language Pair */}
            <div className="mx-4 p-3 bg-[#F5F0EA] rounded-lg mb-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{getLanguageFlag(activeConversation.myLanguage)}</span>
                <Globe className="w-4 h-4 text-[#C45B28]" />
                <span className="text-sm text-[#78716C]">
                  {getLanguageLabel(activeConversation.myLanguage)}
                </span>
                <span className="text-[#9CA3AF]">↔</span>
                <span className="text-sm text-[#78716C]">
                  {getLanguageLabel(activeConversation.theirLanguage)}
                </span>
                <span className="text-lg">{getLanguageFlag(activeConversation.theirLanguage)}</span>
              </div>
            </div>

            {/* Add Participant */}
            <div className="px-4 mb-4">
              <button
                onClick={handleAddParticipant}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F0EA] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#C45B28] flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-[#0F4C5C] font-medium">Add participant</span>
              </button>
            </div>

            {/* Members List */}
            <div className="px-4">
              <p className="text-xs text-[#78716C] font-medium uppercase mb-2 px-2">
                {members.length} members
              </p>
              {members.map((member) => {
                const initials = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                const isOwner = member.id === group?.ownerId
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#F5F0EA] transition-colors"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-[#E2D9CF] text-[#1C1917] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-[#1C1917] truncate">
                          {member.name}
                          {member.id === user?.id && (
                            <span className="text-[#78716C] font-normal"> (You)</span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-[#78716C]">
                        {getLanguageFlag(member.preferredLanguage)} {member.preferredLanguage}
                      </p>
                    </div>
                    {isOwner && (
                      <div className="w-5 h-5 bg-[#C45B28] rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
