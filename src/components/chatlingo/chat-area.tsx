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
  Play,
  Pause,
  Trash2,
  UsersRound,
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
    startCall,
    isInCall,
  } = useChatLingoStore()

  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Voice message state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const micPressRef = useRef(false)

  // Voice message playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)

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

  // Voice recording: start on press
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })

        if (!socket || !activeConversation || !user) return

        // Send voice message
        socket.emit('send-message', {
          conversationId: activeConversation.id,
          senderId: user.id,
          content: `🎤 Voice message`,
          senderLanguage: activeConversation.myLanguage,
          receiverLanguage: activeConversation.theirLanguage,
          messageType: 'voice',
          audioData: audioBlob,
        })

        setAudioChunks([])
      }

      recorder.start()
      setMediaRecorder(recorder)
      setAudioChunks([])
      setIsRecording(true)
      setRecordingTime(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch {
      // Microphone access denied
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    setMediaRecorder(null)
  }

  // Mic button handlers
  const handleMicDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    micPressRef.current = true
    startRecording()
  }

  const handleMicUp = () => {
    if (micPressRef.current) {
      micPressRef.current = false
      stopRecording()
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Voice playback
  const handlePlayVoice = (messageId: string, audioUrl?: string) => {
    if (playingMessageId === messageId) {
      audioEl?.pause()
      setPlayingMessageId(null)
      return
    }
    if (audioEl) audioEl.pause()
    if (audioUrl) {
      const newAudio = new Audio(audioUrl)
      newAudio.play()
      setAudioEl(newAudio)
      setPlayingMessageId(messageId)
      newAudio.onended = () => setPlayingMessageId(null)
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

  const isFirstFromSender = (index: number) => {
    if (index === 0) return true
    return messages[index - 1]?.senderId !== messages[index]?.senderId
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-2 sm:px-4 py-2 flex items-center gap-2 wa-shadow-header shrink-0">
        <button
          className="md:hidden p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          onClick={() => setActiveConversation(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative cursor-pointer">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#134E5E] text-white text-sm font-semibold">
              {otherUserInitials}
            </AvatarFallback>
          </Avatar>
          {otherUser.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#A3E635] border-2 border-[#0F4C5C] rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="text-white text-base font-medium truncate">{otherUser.name}</h3>
            <button onClick={() => useChatLingoStore.getState().setShowGroupInfo(true)} className="p-1 hover:bg-white/10 rounded-full transition-colors" title="Group Info">
              <UsersRound className="w-4 h-4 text-white/70" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {isTyping ? (
              <span className="text-xs text-white/80">typing...</span>
            ) : otherUser.online ? (
              <span className="text-xs text-white/80">online</span>
            ) : (
              <span className="text-xs text-white/60">last seen recently</span>
            )}
            <span className="text-white/40 text-xs ml-1">
              {getLanguageFlag(myLanguage)} ↔ {getLanguageFlag(theirLanguage)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              if (!activeConversation || !user) return
              startCall({
                type: 'video',
                partner: {
                  id: activeConversation.otherUser.id,
                  name: activeConversation.otherUser.name,
                  avatar: activeConversation.otherUser.avatar,
                },
                conversationId: activeConversation.id,
                myLanguage: activeConversation.myLanguage,
                theirLanguage: activeConversation.theirLanguage,
              })
            }}
            disabled={isInCall}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors hidden sm:block disabled:opacity-50"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (!activeConversation || !user) return
              startCall({
                type: 'voice',
                partner: {
                  id: activeConversation.otherUser.id,
                  name: activeConversation.otherUser.name,
                  avatar: activeConversation.otherUser.avatar,
                },
                conversationId: activeConversation.id,
                myLanguage: activeConversation.myLanguage,
                theirLanguage: activeConversation.theirLanguage,
              })
            }}
            disabled={isInCall}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors hidden sm:block disabled:opacity-50"
            title="Voice call"
          >
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
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-[#E5E5E5]">
                  <button
                    onClick={() => { setShowLanguageSettings(true); setShowHeaderMenu(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
                  >
                    <Globe className="w-4 h-4 text-[#525252]" />
                    Language settings
                  </button>
                  <button
                    onClick={() => setShowHeaderMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
                  >
                    <Search className="w-4 h-4 text-[#525252]" />
                    Search
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin wa-chat-bg px-4 sm:px-8 py-3"
        style={{ paddingBottom: isTyping ? '80px' : '8px' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Encryption Notice */}
          <div className="flex justify-center mb-4 mt-2">
            <div className="bg-[#ECFCCB]/80 backdrop-blur-sm rounded-lg px-4 py-2 max-w-sm text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Lock className="w-3 h-3 text-[#525252]" />
                <span className="text-[11px] text-[#525252] font-medium">
                  Messages are auto-translated
                </span>
              </div>
              <p className="text-[11px] text-[#A3A3A3]">
                {getLanguageFlag(myLanguage)} {getLanguageLabel(myLanguage)} ↔ {getLanguageFlag(theirLanguage)} {getLanguageLabel(theirLanguage)}
              </p>
            </div>
          </div>

          {/* Messages */}
          {messages.map((message, index) => {
            const isMine = message.senderId === user?.id
            const isFirst = isFirstFromSender(index)
            const hasOriginal = showOriginal[message.id]
            const isVoiceMessage = message.content.startsWith('🎤 Voice message')

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
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${
                    isVoiceMessage ? 'max-w-[85%] sm:max-w-[70%]' : 'max-w-[85%] sm:max-w-[65%]'
                  }`}
                >
                  {!isMine && isFirst && (
                    <p className="text-[12px] text-[#A3E635] font-medium mb-0.5 ml-3">
                      {message.sender?.name || 'Unknown'}
                    </p>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative px-2.5 pt-1.5 pb-1 shadow-sm ${
                      isMine
                        ? `bg-[#ECFCCB] ${isFirst ? 'wa-bubble-tail-right rounded-tr-none' : 'rounded-tr-md'} rounded-tl-lg rounded-bl-lg rounded-br-lg`
                        : `bg-white ${isFirst ? 'wa-bubble-tail-left rounded-tl-none' : 'rounded-tl-md'} rounded-tr-lg rounded-bl-lg rounded-br-lg`
                    }`}
                    style={{ minWidth: isVoiceMessage ? '200px' : '80px' }}
                  >
                    {isVoiceMessage ? (
                      /* Voice Message UI */
                      <div className="flex items-center gap-2 py-1 min-w-[180px]">
                        <button
                          onClick={() => handlePlayVoice(message.id)}
                          className="w-8 h-8 rounded-full bg-[#0F4C5C] flex items-center justify-center shrink-0"
                        >
                          {playingMessageId === message.id ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="wa-voice-waveform">
                            {[...Array(10)].map((_, i) => (
                              <div key={i} className="bar" />
                            ))}
                          </div>
                        </div>
                        <span className="text-[11px] text-[#525252] shrink-0">0:12</span>
                      </div>
                    ) : (
                      /* Text Message */
                      <p className="text-[14.2px] text-[#0A0A0A] whitespace-pre-wrap break-words leading-[19px] pr-12">
                        {displayText}
                      </p>
                    )}

                    {/* Original text (tap to reveal) */}
                    {!isMine && hasTranslation && hasOriginal && (
                      <div className="mt-1.5 pt-1.5 border-t border-[#E5E5E5]">
                        <p className="text-[12px] text-[#A3A3A3] italic whitespace-pre-wrap break-words leading-[16px]">
                          {originalText}
                        </p>
                      </div>
                    )}

                    {!isMine && hasTranslation && !hasOriginal && (
                      <button
                        onClick={() => toggleOriginal(message.id)}
                        className="flex items-center gap-1 mt-1 text-[#A3E635] hover:text-[#134E5E] transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="text-[11px]">View original</span>
                      </button>
                    )}

                    {/* Time + ticks */}
                    <div className="flex items-center gap-0.5 justify-end -mt-1">
                      <span className={`text-[11px] ${isMine ? 'text-black/45' : 'text-[#525252]'}`}>
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isMine && (
                        <CheckCheck className="w-4 h-4 text-[#A3E635]" />
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

      {/* Recording UI */}
      {isRecording && (
        <div className="bg-[#F1F5F9] px-4 py-3 flex items-center gap-3 border-t border-[#E5E5E5] shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500 wa-recording-pulse" />
          <span className="text-sm font-medium text-[#0A0A0A]">{formatRecordingTime(recordingTime)}</span>
          <div className="flex-1" />
          <button
            onClick={stopRecording}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      {!isRecording && (
        <div className="bg-[#F1F5F9] px-2 sm:px-4 py-2 flex items-center gap-1 sm:gap-2 shrink-0">
          <button className="p-2 text-[#525252] hover:text-[#0A0A0A] rounded-full hover:bg-[#E5E5E5] transition-colors shrink-0">
            <Smile className="w-6 h-6" />
          </button>
          <button className="p-2 text-[#525252] hover:text-[#0A0A0A] rounded-full hover:bg-[#E5E5E5] transition-colors shrink-0">
            <Paperclip className="w-5 h-5 rotate-45" />
          </button>
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
              className="w-full h-11 px-4 bg-white rounded-full border-none text-[15px] text-[#0A0A0A] placeholder:text-[#525252] focus:outline-none focus:ring-0 shadow-sm"
              disabled={sending}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] text-xs pointer-events-none">
              {getLanguageFlag(myLanguage)}
            </span>
          </div>
          {inputValue.trim() ? (
            <button
              onClick={handleSend}
              disabled={sending}
              className="p-2.5 bg-[#0F4C5C] hover:bg-[#134E5E] text-white rounded-full transition-colors shrink-0 shadow-sm"
            >
              <SendHorizonal className="w-5 h-5" />
            </button>
          ) : (
            <button
              onMouseDown={handleMicDown}
              onMouseUp={handleMicUp}
              onMouseLeave={handleMicUp}
              onTouchStart={handleMicDown}
              onTouchEnd={handleMicUp}
              className="p-2.5 text-[#525252] hover:text-[#0A0A0A] rounded-full hover:bg-[#E5E5E5] transition-colors shrink-0 select-none"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
