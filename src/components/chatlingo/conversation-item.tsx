'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getLanguageFlag } from '@/lib/languages'
import { formatDistanceToNow } from 'date-fns'

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

  const timeAgo = lastMessageAt
    ? formatDistanceToNow(new Date(lastMessageAt), { addSuffix: false })
    : ''

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${
        isActive ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
      }`}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarFallback
            className={`text-sm font-semibold ${
              isActive
                ? 'bg-emerald-200 text-emerald-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {otherUser.online && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3
            className={`text-sm font-semibold truncate ${
              isActive ? 'text-emerald-900' : 'text-gray-900'
            }`}
          >
            {otherUser.name}
          </h3>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{timeAgo}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-500 truncate pr-2">
            {lastMessage || 'No messages yet'}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs">{getLanguageFlag(theirLanguage)}</span>
            {unreadCount > 0 && (
              <Badge className="bg-emerald-500 text-white text-[10px] h-5 min-w-5 flex items-center justify-center px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
