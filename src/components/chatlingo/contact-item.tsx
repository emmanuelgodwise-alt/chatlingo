'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag } from '@/lib/languages'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string | null
  preferredLanguage: string
  avatar?: string | null
  online: boolean
}

const BORDER_COLORS = [
  'border-l-emerald-400',
  'border-l-sky-400',
  'border-l-violet-400',
  'border-l-amber-400',
  'border-l-rose-400',
  'border-l-teal-400',
  'border-l-orange-400',
  'border-l-cyan-400',
  'border-l-fuchsia-400',
  'border-l-lime-400',
  'border-l-pink-400',
  'border-l-yellow-400',
]

const BG_COLORS = [
  'bg-emerald-50',
  'bg-sky-50',
  'bg-violet-50',
  'bg-amber-50',
  'bg-rose-50',
  'bg-teal-50',
  'bg-orange-50',
  'bg-cyan-50',
  'bg-fuchsia-50',
  'bg-lime-50',
  'bg-pink-50',
  'bg-yellow-50',
]

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-lime-500',
  'bg-pink-500',
  'bg-yellow-500',
]

function getHashColor(name: string, palette: string[]): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

export function ContactItem({
  contact,
  onClick,
  isActive,
}: {
  contact: Contact
  onClick: () => void
  isActive?: boolean
}) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const borderColor = getHashColor(contact.name, BORDER_COLORS)
  const bgColor = getHashColor(contact.name, BG_COLORS)
  const avatarColor = getHashColor(contact.name, AVATAR_COLORS)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 text-left group border-l-[3px] border-l-transparent hover:border-l-transparent mb-0.5 ${
        isActive
          ? 'bg-[#ECFCCB] border-l-[#84CC16] shadow-sm'
          : `hover:bg-[#F8FAFC] ${borderColor}`
      }`}
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
          contact.online ? 'bg-[#84CC16]' : 'bg-[#A3A3A3]'
        }`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] leading-tight font-semibold text-[#0A0A0A] truncate">{contact.name}</span>
          <span className="text-base shrink-0">{getLanguageFlag(contact.preferredLanguage)}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px] text-[#525252] truncate">{contact.preferredLanguage}</span>
          {contact.online ? (
            <span className="text-[10px] text-[#84CC16] font-medium shrink-0">online</span>
          ) : (
            <span className="text-[10px] text-[#A3A3A3] font-medium shrink-0">offline</span>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="w-2 h-8 bg-[#84CC16] rounded-full shrink-0 opacity-60" />
      )}
    </button>
  )
}

// Compact variant for sidebar
export function ContactItemCompact({
  contact,
  onClick,
  isActive,
}: {
  contact: Contact
  onClick: () => void
  isActive?: boolean
}) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-100 text-left border ${
        isActive
          ? 'bg-[#ECFCCB] border-[#84CC16]/30'
          : 'hover:bg-[#F1F5F9] border-transparent'
      }`}
    >
      <div className="relative shrink-0">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-[#E2E8F0] text-[#0A0A0A] text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
          contact.online ? 'bg-[#84CC16]' : 'bg-[#A3A3A3]'
        }`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#0A0A0A] truncate leading-tight">{contact.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px]">{getLanguageFlag(contact.preferredLanguage)}</span>
          <span className="text-[11px] text-[#525252] truncate">{contact.preferredLanguage}</span>
        </div>
      </div>
    </button>
  )
}
