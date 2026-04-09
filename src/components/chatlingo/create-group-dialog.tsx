'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { getLanguageFlag } from '@/lib/languages'
import { X, Search, Users, Check } from 'lucide-react'

export function CreateGroupDialog() {
  const { token, contacts, setShowCreateGroup, setConversations, setActiveConversation } = useChatLingoStore()
  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [allContacts, setAllContacts] = useState(contacts)

  const loadContacts = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAllContacts(data.contacts || [])
      }
    } catch {
      // ignore
    }
  }, [token])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  const filteredContacts = allContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleContact = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length === 0 || !token) return
    setCreating(true)
    setError('')

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName.trim(),
          memberIds: selectedIds,
        }),
      })
      if (res.ok) {
        const convRes = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (convRes.ok) {
          const data = await convRes.json()
          setConversations(data.conversations)
          const newGroup = data.conversations.find(
            (c: { isGroup: boolean; name: string }) =>
              c.isGroup && c.name === groupName.trim()
          )
          if (newGroup) setActiveConversation(newGroup)
        }
        setShowCreateGroup(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create group')
      }
    } catch {
      setError('Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50" onClick={() => setShowCreateGroup(false)}>
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#0F4C5C] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowCreateGroup(false)}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <Users className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold text-base">New Group</h3>
        </div>

        <div className="p-4 space-y-3">
          {/* Group Name */}
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            maxLength={50}
            className="w-full px-3 py-2 bg-[#F1F5F9] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-[#84CC16] border-none"
          />

          {/* Selected Contacts */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedIds.map((id) => {
                const contact = allContacts.find((c) => c.id === id)
                if (!contact) return null
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#ECFCCB] text-[#0F4C5C] rounded-full text-xs font-medium"
                  >
                    {contact.name}
                    <button
                      onClick={() => toggleContact(id)}
                      className="ml-0.5 hover:text-[#D32F2F] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-[#F1F5F9] border-none rounded-lg text-sm placeholder:text-[#525252] focus-visible:ring-0 focus-visible:bg-white focus-visible:border-[#E2E8F0]"
            />
          </div>

          {/* Contact List */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {filteredContacts.length === 0 ? (
              <p className="text-center text-sm text-[#525252] py-4">No contacts found</p>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedIds.includes(contact.id)
                const initials = contact.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <button
                    key={contact.id}
                    onClick={() => toggleContact(contact.id)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                      isSelected ? 'bg-[#ECFCCB]' : 'hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="bg-[#E2E8F0] text-[#0A0A0A] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{contact.name}</p>
                      <p className="text-xs text-[#525252]">
                        {getLanguageFlag(contact.preferredLanguage)} {contact.preferredLanguage}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-[#84CC16] rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length === 0 || creating}
            className="px-6 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 shadow-sm"
          >
            {creating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
