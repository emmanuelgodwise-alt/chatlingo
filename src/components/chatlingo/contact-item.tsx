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
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
    >
      <div className="relative">
        <Avatar className="w-11 h-11">
          <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {contact.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs">{getLanguageFlag(contact.preferredLanguage)}</span>
          <p className="text-xs text-gray-400 truncate">{contact.preferredLanguage}</p>
        </div>
      </div>
    </button>
  )
}
