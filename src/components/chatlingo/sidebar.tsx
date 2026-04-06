'use client'

import { useChatLingoStore } from '@/lib/store'
import { ContactItem } from '@/components/chatlingo/contact-item'
import { ConversationItem } from '@/components/chatlingo/conversation-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Search,
  LogOut,
  Globe,
  Users,
  MessageCircle,
} from 'lucide-react'
import { useState } from 'react'

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
  } = useChatLingoStore()

  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats')
  const [searchQuery, setSearchQuery] = useState('')
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
        // Switch to chats tab and refresh conversations
        setActiveTab('chats')
        const convRes = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (convRes.ok) {
          const data = await convRes.json()
          const { setConversations, setActiveConversation } = useChatLingoStore.getState()
          setConversations(data.conversations)
          // Find the conversation with this contact
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

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">ChatLingo</h2>
              <p className="text-xs text-gray-400">Translate as you chat</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-gray-400 hover:text-red-500"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'chats'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chats
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'contacts'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Contacts
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={
              activeTab === 'chats' ? 'Search conversations...' : 'Search contacts...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {activeTab === 'chats' ? (
          <div>
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">
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
              <div className="p-6 text-center">
                <span className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin inline-block" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No contacts yet</p>
                <p className="text-xs text-gray-400 mt-1">
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
      </ScrollArea>

      <Separator />

      {/* Current User Info */}
      <div className="p-3 flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.preferredLanguage}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAddContact(true)}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          title="Add contact"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
