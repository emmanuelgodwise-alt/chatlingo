'use client'

import { useEffect, useRef } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Sidebar } from '@/components/chatlingo/sidebar'
import { ChatArea } from '@/components/chatlingo/chat-area'
import { AddContactDialog } from '@/components/chatlingo/add-contact-dialog'
import { LanguageSettingsDialog } from '@/components/chatlingo/language-settings-dialog'
import { EmptyChatState } from '@/components/chatlingo/empty-chat-state'
import type { Socket } from 'socket.io-client'

export function ChatInterface() {
  const {
    token,
    user,
    activeConversation,
    showAddContact,
    showLanguageSettings,
    conversations,
    setConversations,
    addMessage,
  } = useChatLingoStore()

  const socketRef = useRef<Socket | null>(null)
  const socketRefForChildren = socketRef

  // Load conversations on mount
  useEffect(() => {
    if (!token) return

    let cancelled = false

    const loadConversations = async () => {
      try {
        const res = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok && !cancelled) {
          const data = await res.json()
          setConversations(data.conversations)
        }
      } catch (err) {
        console.error('Failed to load conversations:', err)
      }
    }

    loadConversations()

    return () => {
      cancelled = true
    }
  }, [token, setConversations])

  // Connect WebSocket
  useEffect(() => {
    if (!token || !user) return

    let cancelled = false
    let mounted = true

    const initSocket = async () => {
      const { io } = await import('socket.io-client')

      if (cancelled || !mounted) return

      const socketInstance = io('/?XTransformPort=3003', {
        transports: ['websocket', 'polling'],
      })

      socketInstance.on('connect', () => {
        console.log('Connected to ChatLingo WebSocket')
        socketInstance.emit('authenticate', { userId: user.id })
      })

      socketInstance.on('new-message', (message: unknown) => {
        addMessage(message as Parameters<typeof addMessage>[0])

        if (token) {
          fetch('/api/conversations', {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              if (!cancelled) setConversations(data.conversations)
            })
            .catch(() => {})
        }
      })

      const refreshConversations = () => {
        if (token) {
          fetch('/api/conversations', {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              if (!cancelled) setConversations(data.conversations)
            })
            .catch(() => {})
        }
      }

      socketInstance.on('user-online', refreshConversations)
      socketInstance.on('user-offline', refreshConversations)

      socketRef.current = socketInstance

      // Trigger a re-render by updating conversations (socket is now ready)
      refreshConversations()
    }

    initSocket()

    return () => {
      mounted = false
      cancelled = true
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [token, user, addMessage, setConversations])

  // Join conversation room when active conversation changes
  useEffect(() => {
    if (!socketRef.current || !activeConversation) return
    socketRef.current.emit('join-conversation', {
      conversationId: activeConversation.id,
    })
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-conversation', {
          conversationId: activeConversation.id,
        })
      }
    }
  }, [activeConversation])

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar socket={socketRefForChildren.current} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <ChatArea socket={socketRefForChildren.current} />
        ) : conversations.length === 0 ? (
          <EmptyChatState showWelcome />
        ) : (
          <EmptyChatState showWelcome={false} />
        )}
      </div>

      {/* Dialogs */}
      {showAddContact && <AddContactDialog />}
      {showLanguageSettings && <LanguageSettingsDialog />}
    </div>
  )
}
