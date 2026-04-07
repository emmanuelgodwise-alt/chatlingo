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
          <div className="bg-[#075E54] px-6 py-5 rounded-t-xl flex items-start justify-between">
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
            <div className="w-16 h-16 rounded-full bg-[#F0F2F5] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#667781]" />
            </div>
            <h3 className="text-base font-medium text-[#111B21] mb-2">
              Learning profile required
            </h3>
            <p className="text-sm text-[#667781]">
              Set up your learning profile first before adding a language exchange
              partner.
            </p>
          </div>

          <div className="px-6 pb-5 pt-2 border-t border-[#E9EDEF] flex justify-end">
            <button
              onClick={() => setShowLearnPairDialog(false)}
              className="text-sm text-[#667781] hover:text-[#111B21] transition-colors"
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
        <div className="bg-[#075E54] px-6 py-5 rounded-t-xl flex items-start justify-between">
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
            <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#DFE5E7] flex items-center justify-center text-sm font-semibold text-[#111B21]">
                    {selectedContact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-[#111B21]">
                    You
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#075E54] font-medium px-3 py-1 bg-white rounded-full">
                  <span>{getLanguageFlag(selectedContact.preferredLanguage)}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{getLanguageFlag(learningProfile.nativeLanguage)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#DFE5E7] flex items-center justify-center text-sm font-semibold text-[#111B21]">
                    {selectedContact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-[#111B21] truncate max-w-16">
                    {selectedContact.name.split(' ')[0]}
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-[#075E54]">
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
                className="w-full bg-[#075E54] hover:bg-[#128C7E] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
              <span className="w-5 h-5 border-2 border-[#25D366]/30 border-t-[#25D366] rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#667781]">No contacts yet</p>
              <p className="text-xs text-[#8696A0] mt-1">
                Add contacts first to find a learning partner
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-[#8696A0] font-medium px-2 py-1 uppercase tracking-wider">
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
                        ? 'bg-[#25D366]/10 border border-[#25D366]/20'
                        : 'hover:bg-[#F0F2F5] border border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-[#DFE5E7] flex items-center justify-center text-sm font-semibold text-[#111B21]">
                        {initials}
                      </div>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium truncate ${
                            isSelected ? 'text-[#075E54]' : 'text-[#111B21]'
                          }`}
                        >
                          {contact.name}
                        </p>
                        {isSelected && (
                          <span className="text-[#25D366] text-xs">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3 h-3 text-[#667781]" />
                        <span className="text-xs text-[#667781]">
                          {getLanguageFlag(contact.preferredLanguage)}{' '}
                          {contact.preferredLanguage}
                        </span>
                        {!contact.online && (
                          <span className="text-xs text-[#8696A0]">
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
                            ? 'border-[#25D366] bg-[#25D366]'
                            : 'border-[#E9EDEF]'
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
        <div className="px-6 pb-5 pt-2 border-t border-[#E9EDEF] flex justify-end">
          <button
            onClick={() => setShowLearnPairDialog(false)}
            className="text-sm text-[#667781] hover:text-[#111B21] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
