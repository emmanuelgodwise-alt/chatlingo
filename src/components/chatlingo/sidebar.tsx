'use client'

import { useChatLingoStore } from '@/lib/store'
import { ContactItem } from '@/components/chatlingo/contact-item'
import { ConversationItem } from '@/components/chatlingo/conversation-item'
import { StatusBar } from '@/components/chatlingo/status-bar'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag } from '@/lib/languages'
import {
  Search,
  LogOut,
  MessageCircle,
  Users,
  MoreVertical,
  UserPlus,
  UsersRound,
  Hash,
  Radio,
  Megaphone,
  X,
  BookOpen,
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

interface SocketType {
  on: (event: string, callback: (...args: unknown[]) => void) => unknown
  emit: (event: string, data: unknown) => void
  off: (event: string, callback?: (...args: unknown[]) => void) => unknown
}

export function Sidebar({ socket }: { socket: SocketType | null }) {
  const {
    user,
    token,
    conversations,
    setShowAddContact,
    logout,
    setActiveConversation,
    setShowCreateGroup,
    setShowCreateChannel,
    setShowBroadcast,
    setActiveTab: setGlobalTab,
  } = useChatLingoStore()

  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFABMenu, setShowFABMenu] = useState(false)
  const [contacts, setContacts] = useState<
    Array<{
      id: string
      name: string
      email: string
      phone?: string | null
      preferredLanguage: string
      avatar?: string | null
      online: boolean
    }>
  >([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  const loadContacts = useCallback(async () => {
    if (!token || activeTab !== 'contacts') return
    setLoadingContacts(true)
    try {
      const res = await fetch(
        `/api/contacts${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
      }
    } catch {
      // ignore
    } finally {
      setLoadingContacts(false)
    }
  }, [token, activeTab, searchQuery])

  // Listen for real-time online status
  useEffect(() => {
    if (!socket) return

    const handleUserOnline = () => loadContacts()
    const handleUserOffline = () => loadContacts()

    socket.on('user-online', handleUserOnline)
    socket.on('user-offline', handleUserOffline)

    return () => {
      socket.off('user-online', handleUserOnline)
      socket.off('user-offline', handleUserOffline)
    }
  }, [socket, loadContacts])

  useEffect(() => {
    if (activeTab === 'contacts') {
      loadContacts()
    }
  }, [activeTab, loadContacts])

  const handleStartConversation = async (contactId: string, contactLanguage: string) => {
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
          participant2Lang: contactLanguage,
        }),
      })

      if (res.ok) {
        setActiveTab('chats')
        const convRes = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (convRes.ok) {
          const data = await convRes.json()
          const { setConversations, setActiveConversation } = useChatLingoStore.getState()
          setConversations(data.conversations)
          const conv = data.conversations.find(
            (c: { otherUser: { id: string } }) => c.otherUser.id === contactId
          )
          if (conv) {
            setActiveConversation(conv)
          }
        }
      }
    } catch {
      // ignore
    }
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="w-full md:w-80 lg:w-[420px] bg-white border-r border-[#E9EDEF] flex flex-col h-full relative">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] px-4 py-2.5 flex items-center justify-between wa-shadow-header shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#128C7E] text-white text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-white font-semibold text-base">ChatLingo</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="New chat"
            onClick={() => setShowAddContact(true)}
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-[#E9EDEF] shrink-0">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'chats'
              ? 'text-[#075E54]'
              : 'text-[#667781] hover:text-[#075E54]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chats
          {unreadTotal > 0 && (
            <span className="ml-1 wa-unread-badge text-[10px] min-w-[18px] h-[18px] px-1">
              {unreadTotal}
            </span>
          )}
          {activeTab === 'chats' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[3px] bg-[#075E54] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'contacts'
              ? 'text-[#075E54]'
              : 'text-[#667781] hover:text-[#075E54]'
          }`}
        >
          <Users className="w-4 h-4" />
          Contacts
          {activeTab === 'contacts' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[3px] bg-[#075E54] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667781]" />
          <Input
            placeholder={
              activeTab === 'chats' ? 'Search or start new chat' : 'Search contacts...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-[#F0F2F5] border-none rounded-lg text-sm placeholder:text-[#667781] focus-visible:ring-0 focus-visible:bg-white focus-visible:border-[#E9EDEF]"
          />
        </div>
      </div>

      {/* Status Bar (below search on chats tab) */}
      {activeTab === 'chats' && <StatusBar />}

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'chats' ? (
          <div>
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-[#E9EDEF] mx-auto mb-3" />
                <p className="text-sm text-[#667781]">No conversations yet</p>
                <p className="text-xs text-[#8696A0] mt-1">
                  Add a contact to start chatting
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={
                    useChatLingoStore.getState().activeConversation?.id === conv.id
                  }
                  onClick={() => setActiveConversation(conv)}
                />
              ))
            )}
          </div>
        ) : (
          <div>
            {loadingContacts ? (
              <div className="p-8 text-center">
                <span className="w-5 h-5 border-2 border-[#25D366]/30 border-t-[#25D366] rounded-full animate-spin inline-block" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-[#E9EDEF] mx-auto mb-3" />
                <p className="text-sm text-[#667781]">No contacts yet</p>
                <p className="text-xs text-[#8696A0] mt-1">
                  Add contacts to start chatting
                </p>
              </div>
            ) : (
              contacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  onClick={() =>
                    handleStartConversation(contact.id, contact.preferredLanguage)
                  }
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* FAB with menu */}
      {showFABMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowFABMenu(false)} />
      )}
      {showFABMenu && (
        <div className="absolute bottom-24 right-5 bg-white rounded-xl shadow-lg py-2 z-50 w-52 border border-[#E9EDEF] animate-fadeIn">
          <button
            onClick={() => { setShowAddContact(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            New Contact
          </button>
          <button
            onClick={() => { setShowCreateGroup(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
              <UsersRound className="w-4 h-4 text-white" />
            </div>
            New Group
          </button>
          <button
            onClick={() => { setShowCreateChannel(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            New Channel
          </button>
          <button
            onClick={() => { setShowBroadcast(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#53BDEB] flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            Broadcast List
          </button>
          <button
            onClick={() => { setGlobalTab('learn'); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            Language Exchange
          </button>
        </div>
      )}

      {/* FAB - New Chat / Actions */}
      <button
        className="wa-fab md:hidden"
        onClick={() => setShowFABMenu(!showFABMenu)}
        title="Actions"
      >
        {showFABMenu ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Desktop FAB */}
      <button
        className="hidden md:flex wa-fab"
        onClick={() => setShowFABMenu(!showFABMenu)}
        title="Actions"
        style={{ position: 'absolute', bottom: '70px', right: '20px' }}
      >
        {showFABMenu ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Current User Bar (bottom) */}
      <div className="px-3 py-2 flex items-center gap-3 bg-white border-t border-[#E9EDEF] shrink-0">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-[#DFE5E7] text-[#111B21] text-xs font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111B21] truncate">{user?.name}</p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#667781]">{getLanguageFlag(user?.preferredLanguage || 'English')}</span>
            <span className="text-xs text-[#8696A0] truncate">{user?.preferredLanguage}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 text-[#667781] hover:text-red-500 rounded-full hover:bg-[#F0F2F5] transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
