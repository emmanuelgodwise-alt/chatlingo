'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag } from '@/lib/languages'
import { format, isToday, isYesterday } from 'date-fns'

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar?: string | null
    online: boolean
    preferredLanguage: string
  }
  myLanguage: string
  theirLanguage: string
  lastMessage?: string | null
  lastMessageAt?: string | null
  unreadCount: number
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}) {
  const { otherUser, lastMessage, lastMessageAt, unreadCount, theirLanguage } = conversation

  const initials = otherUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'dd/MM/yy')
  }

  const timeStr = lastMessageAt ? formatTime(lastMessageAt) : ''

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-[#F0F2F5] transition-colors text-left ${
        isActive ? 'bg-[#F0F2F5]' : ''
      }`}
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <Avatar className="w-[49px] h-[49px]">
          <AvatarFallback
            className={`text-sm font-semibold bg-[#DFE5E7] text-[#111B21]`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {otherUser.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 border-b border-[#E9EDEF] pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <h3
              className={`text-base truncate ${
                unreadCount > 0 ? 'text-[#111B21] font-bold' : 'text-[#111B21]'
              }`}
            >
              {otherUser.name}
            </h3>
            {/* Subtle language flag */}
            <span className="text-[11px] opacity-60 shrink-0">{getLanguageFlag(theirLanguage)}</span>
          </div>
          <span className={`text-xs shrink-0 ml-2 ${
            unreadCount > 0 ? 'text-[#25D366]' : 'text-[#667781]'
          }`}>
            {timeStr}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className={`text-sm truncate pr-2 ${
            unreadCount > 0 ? 'text-[#111B21]' : 'text-[#667781]'
          }`}>
            {lastMessage || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="wa-unread-badge shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
