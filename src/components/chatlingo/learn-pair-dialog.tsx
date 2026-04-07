'use client'

import { useChatLingoStore } from '@/lib/store'
import { getLanguageFlag } from '@/lib/languages'
import { X, Globe, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ContactData {
  id: string
  name: string
  email: string
  phone?: string | null
  preferredLanguage: string
  avatar?: string | null
  online: boolean
}

export function LearnPairDialog() {
  const {
    token,
    learningProfile,
    setShowLearnPairDialog,
    setLearningPairs,
  } = useChatLingoStore()

  const [contacts, setContacts] = useState<ContactData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch('/api/contacts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.contacts || [])
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => setLoading(false))
  }, [token])

  const handlePair = async () => {
    if (!selectedContact || !token) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/learn/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ partnerId: selectedContact.id }),
      })
      if (res.ok) {
        // Refresh pairs
        const profileRes = await fetch('/api/learn/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setLearningPairs(profileData.pairs || [])
        }
        setShowLearnPairDialog(false)
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  // No learning profile
  if (!learningProfile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          {/* Green Header */}
          <div className="bg-[#0F4C5C] px-6 py-5 rounded-t-xl flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-white text-xl font-semibold">
                <span className="text-2xl">🤝</span>
                Add Learning Partner
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Connect with a friend who speaks the language you&apos;re learning
              </p>
            </div>
            <button
              onClick={() => setShowLearnPairDialog(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* No Profile State */}
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F0EA] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#78716C]" />
            </div>
            <h3 className="text-base font-medium text-[#1C1917] mb-2">
              Learning profile required
            </h3>
            <p className="text-sm text-[#78716C]">
              Set up your learning profile first before adding a language exchange
              partner.
            </p>
          </div>

          <div className="px-6 pb-5 pt-2 border-t border-[#E2D9CF] flex justify-end">
            <button
              onClick={() => setShowLearnPairDialog(false)}
              className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Green Header */}
        <div className="bg-[#0F4C5C] px-6 py-5 rounded-t-xl flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-white text-xl font-semibold">
              <span className="text-2xl">🤝</span>
              Add Learning Partner
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Connect with a friend who speaks the language you&apos;re learning
            </p>
          </div>
          <button
            onClick={() => setShowLearnPairDialog(false)}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Selected Contact Exchange Preview */}
          {selectedContact && (
            <div className="bg-[#C45B28]/10 border border-[#C45B28]/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#E2D9CF] flex items-center justify-center text-sm font-semibold text-[#1C1917]">
                    {selectedContact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-[#1C1917]">
                    You
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#0F4C5C] font-medium px-3 py-1 bg-white rounded-full">
                  <span>{getLanguageFlag(selectedContact.preferredLanguage)}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{getLanguageFlag(learningProfile.nativeLanguage)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#E2D9CF] flex items-center justify-center text-sm font-semibold text-[#1C1917]">
                    {selectedContact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-[#1C1917] truncate max-w-16">
                    {selectedContact.name.split(' ')[0]}
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-[#0F4C5C]">
                You learn{' '}
                <span className="font-medium">
                  {getLanguageFlag(selectedContact.preferredLanguage)}{' '}
                  {selectedContact.preferredLanguage}
                </span>
                , they learn{' '}
                <span className="font-medium">
                  {getLanguageFlag(learningProfile.nativeLanguage)}{' '}
                  {learningProfile.nativeLanguage}
                </span>
              </p>
              <button
                onClick={handlePair}
                disabled={submitting}
                className="w-full bg-[#0F4C5C] hover:bg-[#1A6B7A] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pairing...
                  </>
                ) : (
                  `Pair with ${selectedContact.name.split(' ')[0]}`
                )}
              </button>
            </div>
          )}

          {/* Contact List */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="w-5 h-5 border-2 border-[#C45B28]/30 border-t-[#C45B28] rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#78716C]">No contacts yet</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Add contacts first to find a learning partner
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-[#9CA3AF] font-medium px-2 py-1 uppercase tracking-wider">
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
              </p>
              {contacts.map((contact) => {
                const initials = contact.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                const isSelected = selectedContact?.id === contact.id

                return (
                  <button
                    key={contact.id}
                    onClick={() =>
                      setSelectedContact(
                        isSelected ? null : contact
                      )
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-[#C45B28]/10 border border-[#C45B28]/20'
                        : 'hover:bg-[#F5F0EA] border border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-[#E2D9CF] flex items-center justify-center text-sm font-semibold text-[#1C1917]">
                        {initials}
                      </div>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#C45B28] rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium truncate ${
                            isSelected ? 'text-[#0F4C5C]' : 'text-[#1C1917]'
                          }`}
                        >
                          {contact.name}
                        </p>
                        {isSelected && (
                          <span className="text-[#C45B28] text-xs">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3 h-3 text-[#78716C]" />
                        <span className="text-xs text-[#78716C]">
                          {getLanguageFlag(contact.preferredLanguage)}{' '}
                          {contact.preferredLanguage}
                        </span>
                        {!contact.online && (
                          <span className="text-xs text-[#9CA3AF]">
                            · offline
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="shrink-0">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#C45B28] bg-[#C45B28]'
                            : 'border-[#E2D9CF]'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-2 h-2 text-white"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2 border-t border-[#E2D9CF] flex justify-end">
          <button
            onClick={() => setShowLearnPairDialog(false)}
            className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
