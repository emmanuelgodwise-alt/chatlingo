'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag, getLanguageLabel } from '@/lib/languages'
import { format, isToday, isYesterday } from 'date-fns'
import {
  ArrowLeft,
  MoreVertical,
  Search,
  Mic,
  SendHorizonal,
  Smile,
  Paperclip,
  Video,
  Phone,
  Globe,
  ChevronDown,
  CheckCheck,
  Check,
  Lock,
} from 'lucide-react'

interface SocketType {
  on: (event: string, callback: (...args: unknown[]) => void) => unknown
  emit: (event: string, data: unknown) => void
  off: (event: string, callback?: (...args: unknown[]) => void) => unknown
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
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
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
  }, [messages, isTyping])

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

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'dd/MM/yyyy')
  }

  const toggleOriginal = (messageId: string) => {
    setShowOriginal((prev) => ({ ...prev, [messageId]: !prev[messageId] }))
  }

  if (!activeConversation) return null

  const { otherUser, myLanguage, theirLanguage } = activeConversation

  const otherUserInitials = otherUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Determine if this is the first message from this sender in a group (for tail)
  const isFirstFromSender = (index: number) => {
    if (index === 0) return true
    return messages[index - 1]?.senderId !== messages[index]?.senderId
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* ===== WhatsApp Chat Header ===== */}
      <div className="bg-[#075E54] px-2 sm:px-4 py-2 flex items-center gap-2 wa-shadow-header shrink-0">
        <button
          className="md:hidden p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          onClick={() => setActiveConversation(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative cursor-pointer">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#128C7E] text-white text-sm font-semibold">
              {otherUserInitials}
            </AvatarFallback>
          </Avatar>
          {otherUser.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border-2 border-[#075E54] rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white text-base font-medium truncate">{otherUser.name}</h3>
          <div className="flex items-center gap-1.5">
            {isTyping ? (
              <span className="text-xs text-white/80">typing...</span>
            ) : otherUser.online ? (
              <span className="text-xs text-white/80">online</span>
            ) : (
              <span className="text-xs text-white/60">last seen recently</span>
            )}
            {/* Subtle language indicator */}
            <span className="text-white/40 text-xs ml-1">
              {getLanguageFlag(myLanguage)} ↔ {getLanguageFlag(theirLanguage)}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-0.5">
          <button className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors hidden sm:block" title="Video call">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors hidden sm:block" title="Voice call">
            <Phone className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="More"
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showHeaderMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowHeaderMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-[#E9EDEF]">
                  <button
                    onClick={() => { setShowLanguageSettings(true); setShowHeaderMenu(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
                  >
                    <Globe className="w-4 h-4 text-[#667781]" />
                    Language settings
                  </button>
                  <button
                    onClick={() => setShowHeaderMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
                  >
                    <Search className="w-4 h-4 text-[#667781]" />
                    Search
                  </button>
                  <button
                    onClick={() => setShowHeaderMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111B21] hover:bg-[#F0F2F5] transition-colors"
                  >
                    <Search className="w-4 h-4 text-[#667781]" />
                    Contact info
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== Chat Messages Area with WhatsApp Wallpaper ===== */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin wa-chat-bg px-4 sm:px-8 py-3"
        style={{ paddingBottom: isTyping ? '80px' : '8px' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Encryption Notice */}
          <div className="flex justify-center mb-4 mt-2">
            <div className="bg-[#FFEEBA]/80 backdrop-blur-sm rounded-lg px-4 py-2 max-w-sm text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Lock className="w-3 h-3 text-[#667781]" />
                <span className="text-[11px] text-[#667781] font-medium">
                  Messages are auto-translated
                </span>
              </div>
              <p className="text-[11px] text-[#8696A0]">
                {getLanguageFlag(myLanguage)} {getLanguageLabel(myLanguage)} ↔ {getLanguageFlag(theirLanguage)} {getLanguageLabel(theirLanguage)}
              </p>
            </div>
          </div>

          {/* Messages */}
          {messages.map((message, index) => {
            const isMine = message.senderId === user?.id
            const isFirst = isFirstFromSender(index)
            const hasOriginal = showOriginal[message.id]

            // Determine what to display:
            // - For sent messages: show original text (what user typed)
            // - For received messages: show translatedContent if exists, else original
            const displayText = isMine
              ? message.content
              : (message.translatedContent || message.content)
            const originalText = isMine
              ? message.translatedContent
              : message.content
            const hasTranslation = isMine
              ? !!message.translatedContent
              : (!!message.translatedContent && message.translatedContent !== message.content)

            return (
              <div
                key={message.id}
                className={`flex mb-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-[65%] ${
                    isMine ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender name for group chats */}
                  {!isMine && isFirst && (
                    <p className="text-[12px] text-[#53BDEB] font-medium mb-0.5 ml-3">
                      {message.sender?.name || 'Unknown'}
                    </p>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative px-2.5 pt-1.5 pb-1 shadow-sm ${
                      isMine
                        ? `bg-[#D9FDD3] ${isFirst ? 'wa-bubble-tail-right rounded-tr-none' : 'rounded-tr-md'} rounded-tl-lg rounded-bl-lg rounded-br-lg`
                        : `bg-white ${isFirst ? 'wa-bubble-tail-left rounded-tl-none' : 'rounded-tl-md'} rounded-tr-lg rounded-bl-lg rounded-br-lg`
                    }`}
                    style={{ minWidth: '80px' }}
                  >
                    {/* Message content */}
                    <p className="text-[14.2px] text-[#111B21] whitespace-pre-wrap break-words leading-[19px] pr-12">
                      {displayText}
                    </p>

                    {/* Original text (tap to reveal) - only for received messages with translation */}
                    {!isMine && hasTranslation && hasOriginal && (
                      <div className="mt-1.5 pt-1.5 border-t border-[#E9EDEF]">
                        <p className="text-[12px] text-[#8696A0] italic whitespace-pre-wrap break-words leading-[16px]">
                          {originalText}
                        </p>
                      </div>
                    )}

                    {/* Tap to reveal button - only for received messages with translation */}
                    {!isMine && hasTranslation && !hasOriginal && (
                      <button
                        onClick={() => toggleOriginal(message.id)}
                        className="flex items-center gap-1 mt-1 text-[#53BDEB] hover:text-[#128C7E] transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="text-[11px]">View original</span>
                      </button>
                    )}

                    {/* Time + ticks - bottom right of bubble */}
                    <div className={`flex items-center gap-0.5 justify-end -mt-1 ${!isMine && hasTranslation && hasOriginal ? 'mt-0' : ''}`}>
                      <span className={`text-[11px] ${isMine ? 'text-black/45' : 'text-[#667781]'}`}>
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isMine && (
                        <CheckCheck className="w-4 h-4 text-[#53BDEB]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-2">
              <div className="bg-white wa-bubble-tail-left rounded-tl-none rounded-tr-lg rounded-bl-lg rounded-br-lg px-3 py-2.5 shadow-sm">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== WhatsApp Input Bar ===== */}
      <div className="bg-[#F0F2F5] px-2 sm:px-4 py-2 flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Emoji */}
        <button className="p-2 text-[#667781] hover:text-[#111B21] rounded-full hover:bg-[#E9EDEF] transition-colors shrink-0">
          <Smile className="w-6 h-6" />
        </button>

        {/* Attach */}
        <button className="p-2 text-[#667781] hover:text-[#111B21] rounded-full hover:bg-[#E9EDEF] transition-colors shrink-0">
          <Paperclip className="w-5 h-5 rotate-45" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              handleTypingInput()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="w-full h-11 px-4 bg-white rounded-full border-none text-[15px] text-[#111B21] placeholder:text-[#667781] focus:outline-none focus:ring-0 shadow-sm"
            disabled={sending}
          />
          {/* Subtle language flag watermark */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696A0] text-xs pointer-events-none">
            {getLanguageFlag(myLanguage)}
          </span>
        </div>

        {/* Send / Mic */}
        {inputValue.trim() ? (
          <button
            onClick={handleSend}
            disabled={sending}
            className="p-2.5 bg-[#075E54] hover:bg-[#064E46] text-white rounded-full transition-colors shrink-0 shadow-sm"
          >
            <SendHorizonal className="w-5 h-5" />
          </button>
        ) : (
          <button className="p-2.5 text-[#667781] hover:text-[#111B21] rounded-full hover:bg-[#E9EDEF] transition-colors shrink-0">
            <Mic className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}
