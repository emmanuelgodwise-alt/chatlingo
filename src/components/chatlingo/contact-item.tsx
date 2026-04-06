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

export function ContactItem({
  contact,
  onClick,
}: {
  contact: Contact
  onClick: () => void
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
      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#F0F2F5] transition-colors text-left"
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <Avatar className="w-[49px] h-[49px]">
          <AvatarFallback className="bg-[#DFE5E7] text-[#111B21] text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {contact.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 border-b border-[#E9EDEF] pb-3">
        <div className="flex items-center gap-1">
          <h3 className="text-base text-[#111B21] truncate">{contact.name}</h3>
          <span className="text-[11px] opacity-60">{getLanguageFlag(contact.preferredLanguage)}</span>
        </div>
        <p className="text-sm text-[#667781] truncate mt-0.5">{contact.preferredLanguage}</p>
      </div>
    </button>
  )
}
