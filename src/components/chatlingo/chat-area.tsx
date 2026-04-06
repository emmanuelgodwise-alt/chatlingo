'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Send,
  Globe,
  ArrowLeft,
  Languages,
} from 'lucide-react'
import { getLanguageFlag, getLanguageLabel } from '@/lib/languages'
import { formatDistanceToNow } from 'date-fns'

interface SocketType {
  on: (event: string, callback: (...args: unknown[]) => void) => unknown
  emit: (event: string, data: unknown) => void
  off: (event: string, callback?: (...args: unknown[]) => void) => unknown
}

interface MessageType {
  id: string
  conversationId: string
  senderId: string
  content: string
  translatedContent?: string | null
  senderLanguage: string
  receiverLanguage: string
  createdAt: string
  sender?: {
    id: string
    name: string
    avatar?: string | null
  }
}

export function ChatArea({ socket }: { socket: SocketType | null }) {
  const {
    token,
    user,
    activeConversation,
    messages,
    setMessages,
    addMessage,
    setShowLanguageSettings,
    setActiveConversation,
  } = useChatLingoStore()

  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load messages when conversation changes
  useEffect(() => {
    if (!token || !activeConversation) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `/api/conversations/${activeConversation.id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } catch {
        // ignore
      }
    }

    loadMessages()
    inputRef.current?.focus()
  }, [token, activeConversation, setMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Listen for typing indicators
  useEffect(() => {
    if (!socket || !activeConversation) return

    const handleTyping = (data: unknown) => {
      const { userId } = data as { userId: string }
      if (userId !== user?.id) {
        setIsTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000)
      }
    }

    const handleStopTyping = (data: unknown) => {
      const { userId } = data as { userId: string }
      if (userId !== user?.id) {
        setIsTyping(false)
      }
    }

    const handleLanguagesUpdated = () => {
      // Refresh conversation data
      if (token) {
        fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            const { setConversations, setActiveConversation: setConv } =
              useChatLingoStore.getState()
            setConversations(data.conversations)
            if (activeConversation) {
              const updated = data.conversations.find(
                (c: { id: string }) => c.id === activeConversation.id
              )
              if (updated) setConv(updated)
            }
          })
          .catch(() => {})
      }
    }

    socket.on('user-typing', handleTyping)
    socket.on('user-stop-typing', handleStopTyping)
    socket.on('languages-updated', handleLanguagesUpdated)

    return () => {
      socket.off('user-typing', handleTyping)
      socket.off('user-stop-typing', handleStopTyping)
      socket.off('languages-updated', handleLanguagesUpdated)
    }
  }, [socket, activeConversation, token, user])

  // Mark messages as read
  useEffect(() => {
    if (!socket || !activeConversation || !user) return

    const unreadMessages = messages.filter(
      (m) => m.senderId !== user.id && !m.read
    )
    if (unreadMessages.length > 0) {
      socket.emit('read-messages', {
        conversationId: activeConversation.id,
        userId: user.id,
      })
    }
  }, [socket, activeConversation, messages, user])

  const handleTypingInput = useCallback(() => {
    if (!socket || !activeConversation || !user) return
    socket.emit('typing', {
      conversationId: activeConversation.id,
      userId: user.id,
    })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', {
        conversationId: activeConversation.id,
        userId: user.id,
      })
    }, 1500)
  }, [socket, activeConversation, user])

  const handleSend = async () => {
    if (!inputValue.trim() || !socket || !activeConversation || !user) return

    const messageContent = inputValue.trim()
    setInputValue('')
    setSending(true)

    // Emit stop-typing
    socket.emit('stop-typing', {
      conversationId: activeConversation.id,
      userId: user.id,
    })

    try {
      socket.emit('send-message', {
        conversationId: activeConversation.id,
        senderId: user.id,
        content: messageContent,
        senderLanguage: activeConversation.myLanguage,
        receiverLanguage: activeConversation.theirLanguage,
      })
    } catch {
      // Fallback: save via REST API
      try {
        const res = await fetch(
          `/api/conversations/${activeConversation.id}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: messageContent }),
          }
        )
        if (res.ok) {
          const data = await res.json()
          addMessage({
            ...data.message,
            sender: { id: user.id, name: user.name, avatar: user.avatar },
          })
        }
      } catch {
        // ignore
      }
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!activeConversation) return null

  const { otherUser, myLanguage, theirLanguage } = activeConversation

  const otherUserInitials = otherUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-500"
          onClick={() => setActiveConversation(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {otherUserInitials}
            </AvatarFallback>
          </Avatar>
          {otherUser.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{otherUser.name}</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{otherUser.online ? '🟢 Online' : '⚫ Offline'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-400">
              {getLanguageFlag(theirLanguage)} {getLanguageLabel(theirLanguage)}
            </span>
          </div>
        </div>

        {/* Language Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
          <Languages className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs text-emerald-700">
            {getLanguageFlag(myLanguage)} → {getLanguageFlag(theirLanguage)}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowLanguageSettings(true)}
          className="text-gray-400 hover:text-emerald-600"
          title="Language settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3 max-w-3xl mx-auto">
          {/* Translation Notice */}
          <div className="flex justify-center">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 max-w-sm text-center">
              <p className="text-xs text-blue-600">
                🌐 Messages are auto-translated:{' '}
                <strong>{getLanguageFlag(myLanguage)} {myLanguage}</strong> ↔{' '}
                <strong>{getLanguageFlag(theirLanguage)} {theirLanguage}</strong>
              </p>
              <button
                onClick={() => setShowLanguageSettings(true)}
                className="text-xs text-blue-500 hover:text-blue-700 mt-0.5"
              >
                Change settings
              </button>
            </div>
          </div>

          {messages.map((message) => {
            const isMine = message.senderId === user?.id

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${
                    isMine ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Name (for other person) */}
                  {!isMine && (
                    <p className="text-xs text-gray-400 mb-1 ml-1">
                      {message.sender?.name || 'Unknown'}
                    </p>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    {/* Original message */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Translation indicator */}
                    {message.translatedContent && (
                      <div
                        className={`mt-2 pt-2 border-t ${
                          isMine
                            ? 'border-emerald-500/30'
                            : 'border-gray-200'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1 mb-1 ${
                            isMine ? 'text-emerald-200' : 'text-gray-400'
                          }`}
                        >
                          <Globe className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-wide font-medium">
                            {isMine
                              ? `Translated to ${getLanguageFlag(message.receiverLanguage)} ${message.receiverLanguage}`
                              : `Translated from ${getLanguageFlag(message.senderLanguage)} ${message.senderLanguage}`}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            isMine ? 'text-emerald-100' : 'text-gray-500'
                          } whitespace-pre-wrap break-words`}
                        >
                          {message.translatedContent}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className="text-[10px] text-gray-400 mt-1 mx-1">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                handleTypingInput()
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Type in ${myLanguage}...`}
              className="h-11 pr-12 bg-gray-50 border-gray-200 rounded-xl"
              disabled={sending}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-xs">{getLanguageFlag(myLanguage)}</span>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="h-11 w-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
