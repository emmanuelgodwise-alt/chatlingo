'use client'

import { useEffect, useState, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { getLanguageFlag, getLanguageLabel } from '@/lib/languages'
import {
  Search,
  Users,
  Hash,
  Radio,
  Heart,
  Globe,
  MessageCircle,
  Sparkles,
  UserPlus,
  LogIn,
  UserCheck,
  Crown,
  Mic,
} from 'lucide-react'

type ExploreCategory = 'people' | 'groups' | 'channels' | 'rooms' | 'partners'

export function ExploreTab() {
  const { token, user, setActiveConversation, setConversations } = useChatLingoStore()

  const [activeCategory, setActiveCategory] = useState<ExploreCategory>('people')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<Record<ExploreCategory, Array<Record<string, unknown>>>>({
    people: [],
    groups: [],
    channels: [],
    rooms: [],
    partners: [],
  })

  const categories: { id: ExploreCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'people', label: 'People', icon: <Users className="w-4 h-4" /> },
    { id: 'groups', label: 'Groups', icon: <Users className="w-4 h-4" /> },
    { id: 'channels', label: 'Channels', icon: <Hash className="w-4 h-4" /> },
    { id: 'rooms', label: 'Rooms', icon: <Radio className="w-4 h-4" /> },
    { id: 'partners', label: 'Partners', icon: <Heart className="w-4 h-4" /> },
  ]

  const loadExplore = useCallback(async (category?: ExploreCategory) => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      const type = category || activeCategory
      params.set('type', type)

      if (type === 'partners') {
        // Special endpoint for language partners
        const res = await fetch('/api/explore/match', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setResults((prev) => ({ ...prev, partners: data.matches || [] }))
        }
      } else {
        const res = await fetch(`/api/explore?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setResults((prev) => ({ ...prev, [type]: data.results || [] }))
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, searchQuery, activeCategory])

  useEffect(() => {
    loadExplore()
  }, [loadExplore])

  const handleConnect = async (contactId: string, lang: string) => {
    if (!token) return
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participant2Id: contactId,
          participant2Lang: lang,
        }),
      })
      if (res.ok) {
        const convRes = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (convRes.ok) {
          const data = await convRes.json()
          setConversations(data.conversations)
          const conv = data.conversations.find(
            (c: { otherUser: { id: string } }) => c.otherUser.id === contactId
          )
          if (conv) setActiveConversation(conv)
        }
        useChatLingoStore.getState().setActiveTab('chats')
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F0EA]">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center gap-2 wa-shadow-header shrink-0">
        <Sparkles className="w-5 h-5 text-white" />
        <h2 className="text-white font-semibold text-base">Explore</h2>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white shrink-0 border-b border-[#E2D9CF]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
          <Input
            placeholder="Search people, groups, channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-[#F5F0EA] border-none rounded-lg text-sm placeholder:text-[#78716C] focus-visible:ring-0"
            onKeyDown={(e) => e.key === 'Enter' && loadExplore()}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {/* Word of the Day */}
        <WordOfTheDayInline token={token} />

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); loadExplore(cat.id) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#0F4C5C] text-white'
                  : 'bg-white text-[#78716C] hover:bg-[#E2D9CF]'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="w-6 h-6 border-2 border-[#C45B28]/30 border-t-[#C45B28] rounded-full animate-spin inline-block" />
          </div>
        ) : results[activeCategory].length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-10 h-10 text-[#E2D9CF] mx-auto mb-2" />
            <p className="text-sm text-[#78716C]">No results found</p>
          </div>
        ) : activeCategory === 'people' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(results.people as Array<Record<string, string>>).map((person) => {
              const initials = (person.name || '').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div key={person.id} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-[#E2D9CF]">
                  <Avatar className="w-12 h-12 shrink-0">
                    <AvatarFallback className="bg-[#E2D9CF] text-[#1C1917] text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1917] truncate">{person.name}</p>
                    <p className="text-xs text-[#78716C]">
                      {getLanguageFlag(person.preferredLanguage || '')} {person.preferredLanguage}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConnect(person.id, person.preferredLanguage || 'English')}
                    className="text-[#0F4C5C] text-xs font-medium px-3 py-1.5 bg-[#E7FCE3] rounded-full hover:bg-[#E8DDD3] transition-colors shrink-0"
                  >
                    Connect
                  </button>
                </div>
              )
            })}
          </div>
        ) : activeCategory === 'groups' ? (
          <div className="space-y-2">
            {(results.groups as Array<Record<string, unknown>>).map((group) => (
              <div key={group.id as string} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-[#E2D9CF]">
                <div className="w-12 h-12 rounded-full bg-[#C45B28] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1917] truncate">{group.name as string}</p>
                  <p className="text-xs text-[#78716C]">
                    {(group as Record<string, string | number>).memberCount || 0} members
                    {(group as Record<string, string>).language && (
                      <span className="ml-2">
                        {getLanguageFlag((group as Record<string, string>).language || '')}
                        {(group as Record<string, string>).language}
                      </span>
                    )}
                  </p>
                </div>
                <button className="text-[#0F4C5C] text-xs font-medium px-3 py-1.5 bg-[#E7FCE3] rounded-full hover:bg-[#E8DDD3] transition-colors shrink-0">
                  Join
                </button>
              </div>
            ))}
          </div>
        ) : activeCategory === 'channels' ? (
          <div className="space-y-2">
            {(results.channels as Array<Record<string, string>>).map((channel) => (
              <div key={channel.id} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-[#E2D9CF]">
                <div className="w-12 h-12 rounded-full bg-[#0F4C5C] flex items-center justify-center shrink-0">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1917] truncate">{channel.name}</p>
                  <p className="text-xs text-[#78716C] truncate">{channel.description || ''}</p>
                </div>
                <button className="text-[#0F4C5C] text-xs font-medium px-3 py-1.5 bg-[#E7FCE3] rounded-full hover:bg-[#E8DDD3] transition-colors shrink-0">
                  Follow
                </button>
              </div>
            ))}
          </div>
        ) : activeCategory === 'partners' ? (
          <div className="space-y-2">
            {(results.partners as Array<Record<string, string | number>>).map((partner) => (
              <div key={partner.id as string} className="bg-white rounded-xl p-4 border border-[#E2D9CF]">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-12 h-12 shrink-0">
                    <AvatarFallback className="bg-[#E7FCE3] text-[#0F4C5C] text-sm font-semibold">
                      {(partner.name as string || '').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1917]">{partner.name as string}</p>
                    <p className="text-xs text-[#78716C]">
                      {getLanguageFlag((partner.preferredLanguage || '') as string)}
                      {(partner.preferredLanguage || '') as string}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#C45B28]">{partner.score || 0}%</p>
                    <p className="text-[10px] text-[#9CA3AF]">match</p>
                  </div>
                </div>
                <p className="text-xs text-[#78716C] mb-2">
                  {(partner.reason || '') as string}
                </p>
                <button
                  onClick={() => handleConnect(partner.id as string, (partner.preferredLanguage || 'English') as string)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C45B28] hover:bg-[#A04920] text-white text-xs font-medium rounded-full transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Say Hello
                </button>
              </div>
            ))}
          </div>
        ) : activeCategory === 'rooms' ? (
          <div className="space-y-2">
            {(results.rooms as Array<Record<string, string | number>>).map((room) => (
              <div key={room.id as string} className="bg-white rounded-xl p-4 flex items-center gap-3 border border-[#E2D9CF]">
                <div className="w-12 h-12 rounded-full bg-[#0F4C5C] flex items-center justify-center shrink-0 relative">
                  <Radio className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full wa-live-dot border border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1917] truncate">{room.name as string}</p>
                  <p className="text-xs text-[#78716C]">
                    <Mic className="w-3 h-3 inline mr-0.5" />{(room.speakerCount || 0) as number} speakers · {(room.listenerCount || 0) as number} listening
                  </p>
                </div>
                <button className="text-[#0F4C5C] text-xs font-medium px-3 py-1.5 bg-[#E7FCE3] rounded-full hover:bg-[#E8DDD3] transition-colors shrink-0">
                  Join
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* Inline mini Word of the Day for explore tab */
function WordOfTheDayInline({ token }: { token: string | null }) {
  const [wordData, setWordData] = useState<{
    phrase: string
    language: string
    translations: Array<{ language: string; translation: string }>
    culturalNote: string
  } | null>(null)

  useEffect(() => {
    if (!token) return
    fetch('/api/explore/word-of-day', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setWordData(data.word || null))
      .catch(() => {})
  }, [token])

  if (!wordData) return null

  return (
    <div className="bg-white rounded-xl border border-[#E2D9CF] overflow-hidden shadow-sm">
      <div className="bg-[#E7FCE3] px-4 py-2 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#0F4C5C]" />
        <span className="text-[#0F4C5C] text-xs font-semibold">Word of the Day</span>
        <span className="text-[#0F4C5C]/60 text-xs ml-1">
          {getLanguageFlag(wordData.language)} {wordData.language}
        </span>
      </div>
      <div className="p-3">
        <p className="text-base font-bold text-[#1C1917] mb-1">{wordData.phrase}</p>
        <div className="flex flex-wrap gap-2">
          {wordData.translations.slice(0, 3).map((t, idx) => (
            <span key={idx} className="text-xs text-[#78716C]">
              {getLanguageFlag(t.language)} {t.translation}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
