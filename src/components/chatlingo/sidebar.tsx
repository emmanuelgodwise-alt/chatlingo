'use client'

import { useChatLingoStore } from '@/lib/store'
import { ConversationItem } from '@/components/chatlingo/conversation-item'
import { StatusBar } from '@/components/chatlingo/status-bar'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag } from '@/lib/languages'
import {
  Search,
  LogOut,
  MessageCircle,
  MoreVertical,
  UserPlus,
  UsersRound,
  Hash,
  Radio,
  Megaphone,
  X,
  BookOpen,
  Plus,
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
    setShowCreateRoom,
    setShowBroadcast,
    setActiveTab: setGlobalTab,
    setShowLanguageSettings,
  } = useChatLingoStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFABMenu, setShowFABMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const filteredConversations = conversations.filter((c) =>
    c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Listen for real-time online status
  useEffect(() => {
    if (!socket) return

    const handleUserOnline = () => {}
    const handleUserOffline = () => {}

    socket.on('user-online', handleUserOnline)
    socket.on('user-offline', handleUserOffline)

    return () => {
      socket.off('user-online', handleUserOnline)
      socket.off('user-offline', handleUserOffline)
    }
  }, [socket])

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
    <div className="w-full md:w-80 lg:w-[420px] bg-white border-r border-[#E5E5E5] flex flex-col h-full relative">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-2.5 flex items-center justify-between wa-shadow-header shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#134E5E] text-white text-sm font-semibold">
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
            <Plus className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="More options"
            onClick={() => setShowFABMenu(!showFABMenu)}
          >
            {showFABMenu ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search Bar - actually filters conversations */}
      <div className="px-3 py-2 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-[#F1F5F9] border-none rounded-lg text-sm placeholder:text-[#A3A3A3] focus-visible:ring-0 focus-visible:bg-white focus-visible:border-[#E5E5E5]"
          />
        </div>
      </div>

      {/* Status Bar (below search) */}
      <StatusBar />

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" />
            <p className="text-sm text-[#525252]">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-[#A3A3A3] mt-1">
              {searchQuery ? 'Try a different search' : 'Tap + to find and add people'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
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

      {/* FAB Menu Overlay */}
      {showFABMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowFABMenu(false)} />
      )}
      {showFABMenu && (
        <div className="absolute bottom-24 right-5 bg-white rounded-xl shadow-lg py-2 z-50 w-52 border border-[#E5E5E5] animate-fadeIn">
          <button
            onClick={() => { setShowAddContact(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F4C5C] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            New Contact
          </button>
          <button
            onClick={() => { setShowCreateGroup(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#A3E635] flex items-center justify-center">
              <UsersRound className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            New Group
          </button>
          <button
            onClick={() => { setShowCreateChannel(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#134E5E] flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            New Channel
          </button>
          <button
            onClick={() => { setShowCreateRoom(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#A3E635] flex items-center justify-center">
              <Radio className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            Start Room
          </button>
          <button
            onClick={() => { setShowBroadcast(true); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#A3E635] flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            Broadcast
          </button>
          <button
            onClick={() => { setGlobalTab('learn'); setShowFABMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F4C5C] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            Onboarding
          </button>
        </div>
      )}

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
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full px-3 py-2 flex items-center gap-3 bg-white border-t border-[#E5E5E5] shrink-0 hover:bg-[#F1F5F9] transition-colors cursor-pointer text-left"
        >
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-[#E5E5E5] text-[#0A0A0A] text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0A0A0A] truncate">{user?.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#525252]">{getLanguageFlag(user?.preferredLanguage || 'English')}</span>
              <span className="text-xs text-[#A3A3A3] truncate">{user?.preferredLanguage}</span>
            </div>
          </div>
        </button>
        {/* User dropdown menu */}
        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl shadow-lg py-1 z-50 border border-[#E5E5E5] animate-fadeIn">
              <button
                onClick={() => { setShowLanguageSettings(true); setShowUserMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0F4C5C] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                Profile & Settings
              </button>
              <button
                onClick={() => { logout(); setShowUserMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
