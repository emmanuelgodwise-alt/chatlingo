'use client'

import { getLanguageFlag } from '@/lib/languages'

// Color palette for contact card gradients
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #E0F7FA, #B2EBF2)', // light cyan
  'linear-gradient(135deg, #E8F5E9, #C8E6C9)', // light green
  'linear-gradient(135deg, #FFF3E0, #FFE0B2)', // light orange
  'linear-gradient(135deg, #F3E5F5, #E1BEE7)', // light purple
  'linear-gradient(135deg, #FCE4EC, #F8BBD0)', // light pink
  'linear-gradient(135deg, #E0F2F1, #B2DFDB)', // light teal
  'linear-gradient(135deg, #FFF8E1, #FFECB3)', // light amber
  'linear-gradient(135deg, #E8EAF6, #C5CAE9)', // light indigo
  'linear-gradient(135deg, #EFEBE9, #D7CCC8)', // light brown
  'linear-gradient(135deg, #F1F8E9, #DCEDC8)', // light lime
]

// Active state gradient overlay
const ACTIVE_GRADIENTS = [
  'linear-gradient(135deg, #B2EBF2, #80DEEA)', // cyan active
  'linear-gradient(135deg, #C8E6C9, #A5D6A7)', // green active
  'linear-gradient(135deg, #FFE0B2, #FFCC80)', // orange active
  'linear-gradient(135deg, #E1BEE7, #CE93D8)', // purple active
  'linear-gradient(135deg, #F8BBD0, #F48FB1)', // pink active
  'linear-gradient(135deg, #B2DFDB, #80CBC4)', // teal active
  'linear-gradient(135deg, #FFECB3, #FFD54F)', // amber active
  'linear-gradient(135deg, #C5CAE9, #9FA8DA)', // indigo active
  'linear-gradient(135deg, #D7CCC8, #BCAAA4)', // brown active
  'linear-gradient(135deg, #DCEDC8, #C5E1A5)', // lime active
]

// Avatar colors for the circle
const AVATAR_BG_COLORS = [
  'bg-cyan-400',
  'bg-emerald-400',
  'bg-orange-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-teal-400',
  'bg-amber-400',
  'bg-indigo-400',
  'bg-stone-400',
  'bg-lime-400',
]

const AVATAR_TEXT_COLORS = [
  'text-cyan-900',
  'text-emerald-900',
  'text-orange-900',
  'text-purple-900',
  'text-pink-900',
  'text-teal-900',
  'text-amber-900',
  'text-indigo-900',
  'text-stone-900',
  'text-lime-900',
]

function getHashIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % CARD_GRADIENTS.length
}

interface ConversationContact {
  id: string
  name: string
  email: string
  phone?: string | null
  preferredLanguage: string
  avatar?: string | null
  online: boolean
}

interface ContactItemProps {
  contact: ConversationContact
  onClick: () => void
  isActive?: boolean
  lastMessage?: string | null
  unreadCount?: number
}

export function ContactItem({
  contact,
  onClick,
  isActive,
  lastMessage,
  unreadCount,
}: ContactItemProps) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colorIndex = getHashIndex(contact.name)
  const flag = getLanguageFlag(contact.preferredLanguage)

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl p-2.5 transition-all duration-200 text-left group mb-1.5 ${
        isActive
          ? 'shadow-md ring-1 ring-black/10 scale-[1.02]'
          : 'shadow-sm hover:shadow-md hover:scale-[1.01]'
      }`}
      style={{
        background: isActive ? ACTIVE_GRADIENTS[colorIndex] : CARD_GRADIENTS[colorIndex],
      }}
    >
      <div className="flex items-start gap-2.5">
        {/* Flag emoji + Avatar area */}
        <div className="relative shrink-0">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${AVATAR_BG_COLORS[colorIndex]}`}>
            <span className="text-[10px] font-bold uppercase text-white leading-none">
              {initials}
            </span>
          </div>
          {/* Online indicator */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[2.5px] ${
              isActive ? 'border-white/90' : 'border-white'
            } ${
              contact.online
                ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]'
                : 'bg-gray-300'
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-gray-800 truncate leading-tight">
                {contact.name}
              </span>
              <span className="text-base shrink-0 leading-none">{flag}</span>
            </div>
            {/* Unread badge */}
            {unreadCount && unreadCount > 0 ? (
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#0F4C5C] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            ) : null}
          </div>

          {/* Language label */}
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[11px] text-gray-500 leading-tight">
              {contact.preferredLanguage}
            </span>
            {contact.online ? (
              <span className="text-[10px] text-green-600 font-medium">• online</span>
            ) : null}
          </div>

          {/* Last message preview */}
          {lastMessage ? (
            <p className="text-[11px] text-gray-500 truncate mt-1 leading-tight">
              {lastMessage}
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 truncate mt-1 italic leading-tight">
              No messages yet
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

// Compact variant for narrow sidebar (optional, can be used on very small screens)
export function ContactItemCompact({
  contact,
  onClick,
  isActive,
  lastMessage,
  unreadCount,
}: ContactItemProps) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colorIndex = getHashIndex(contact.name)
  const flag = getLanguageFlag(contact.preferredLanguage)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 text-left ${
        isActive ? 'bg-[#ECFCCB] shadow-sm' : 'hover:bg-gray-50'
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${AVATAR_BG_COLORS[colorIndex]}`}>
          <span className="text-[9px] font-bold uppercase text-white leading-none">
            {initials}
          </span>
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
            contact.online ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-[12px] font-medium text-gray-800 truncate leading-tight">
            {contact.name}
          </p>
          <span className="text-sm shrink-0">{flag}</span>
        </div>
        {lastMessage ? (
          <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-tight">
            {lastMessage}
          </p>
        ) : null}
      </div>

      {unreadCount && unreadCount > 0 ? (
        <span className="shrink-0 w-4 h-4 rounded-full bg-[#0F4C5C] text-white text-[9px] font-bold flex items-center justify-center">
          {unreadCount}
        </span>
      ) : null}
    </button>
  )
}
