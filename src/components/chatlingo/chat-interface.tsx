'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { ChatArea } from '@/components/chatlingo/chat-area'
import { AddContactDialog } from '@/components/chatlingo/add-contact-dialog'
import { LanguageSettingsDialog } from '@/components/chatlingo/language-settings-dialog'
import { EmptyChatState, EmptyStatusTab, EmptyCallsTab } from '@/components/chatlingo/empty-chat-state'
import { CallScreen } from '@/components/chatlingo/call-screen'
import { StatusViewer } from '@/components/chatlingo/status-viewer'
import { CreateStatusDialog } from '@/components/chatlingo/create-status-dialog'
import { CreateGroupDialog } from '@/components/chatlingo/create-group-dialog'
import { CreateChannelDialog } from '@/components/chatlingo/create-channel-dialog'
import { CreateRoomDialog } from '@/components/chatlingo/create-room-dialog'
import { ChannelsTab } from '@/components/chatlingo/channels-tab'
import { ExploreTab } from '@/components/chatlingo/explore-tab'
import { RoomsTab } from '@/components/chatlingo/rooms-tab'
import { RoomScreen } from '@/components/chatlingo/room-screen'
import { LearnTab } from '@/components/chatlingo/learn-tab'
import { LessonScreen } from '@/components/chatlingo/lesson-screen'
import { LearnSetupDialog } from '@/components/chatlingo/learn-setup-dialog'
import { LearnPairDialog } from '@/components/chatlingo/learn-pair-dialog'
import { LeaderboardDialog } from '@/components/chatlingo/leaderboard-dialog'
import { StatusBar } from '@/components/chatlingo/status-bar'
import { ContactItem } from '@/components/chatlingo/contact-item'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag } from '@/lib/languages'
import { Search, Plus, ArrowLeft, Globe, MessageCircle, MoreVertical, X, UserPlus, UsersRound, Hash, Radio, Megaphone, BookOpen } from 'lucide-react'
import type { Socket } from 'socket.io-client'

export function ChatInterface() {
  const {
    token,
    user,
    activeConversation,
    activeTab,
    setActiveTab,
    showAddContact,
    showLanguageSettings,
    conversations,
    setConversations,
    addMessage,
    isInCall,
    callStatus,
    callType,
    callPartner,
    callConversationId,
    callMyLanguage,
    callTheirLanguage,
    receiveCall,
    answerCall,
    endCall,
    setCallStatus,
    addCallSubtitle,
    setCallDuration,
    setCallTranslationPending,
    showStatusViewer,
    showCreateStatus,
    showCreateGroup,
    showCreateChannel,
    showCreateRoom,
    showBroadcast,
    isInRoom,
    showLearnSetup,
    showLearnPairDialog,
    showLeaderboard,
    lessonInProgress,
  } = useChatLingoStore()

  // Contacts state (for the left sidebar)
  const [contacts, setContacts] = useState<Array<{
    id: string
    name: string
    email: string
    phone?: string | null
    preferredLanguage: string
    avatar?: string | null
    online: boolean
  }>>([])
  const [contactSearch, setContactSearch] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const socketRefForChildren = socketRef
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const webRTCInitializedRef = useRef(false)
  const recognitionActiveRef = useRef(false)

  // Load contacts on mount
  const loadContacts = useCallback(async () => {
    if (!token) return
    setLoadingContacts(true)
    try {
      const res = await fetch('/api/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
      }
    } catch {
      // ignore
    } finally {
      setLoadingContacts(false)
    }
  }, [token])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Start conversation with a contact
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
        const convRes = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (convRes.ok) {
          const data = await convRes.json()
          setConversations(data.conversations)
          const conv = data.conversations.find(
            (c: { otherUser: { id: string } }) => c.otherUser.id === contactId
          )
          if (conv) {
            const { setActiveConversation } = useChatLingoStore.getState()
            setActiveConversation(conv)
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // FAB Menu state
  const [showFABMenu, setShowFABMenu] = useState(false)

  // Filter contacts by search (name or language)
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.preferredLanguage.toLowerCase().includes(contactSearch.toLowerCase())
  )

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

      // Call event listeners
      socketInstance.on('incoming-call', (data: unknown) => {
        const callData = data as {
          callerId: string
          calleeId: string
          conversationId: string
          callType: 'voice' | 'video'
          callerName: string
          callerLanguage: string
          calleeLanguage: string
          offer: RTCSessionDescriptionInit
        }
        ;(window as unknown as Record<string, unknown>).__chatlingo_callerId = callData.callerId
        receiveCall({
          type: callData.callType,
          partner: {
            id: callData.callerId,
            name: callData.callerName,
          },
          conversationId: callData.conversationId,
          callerId: callData.callerId,
          myLanguage: callData.calleeLanguage,
          theirLanguage: callData.callerLanguage,
        })
      })

      socketInstance.on('call-answered', async (data: unknown) => {
        const answerData = data as {
          callerId: string
          calleeId: string
          conversationId: string
          answer: RTCSessionDescriptionInit
        }
        try {
          const { setRemoteDescription } = await import('@/lib/webrtc')
          await setRemoteDescription(answerData.answer)
          setCallStatus('connected')
        } catch (error) {
          console.error('Failed to set remote description:', error)
          endCall()
        }
      })

      socketInstance.on('call-rejected', (data: unknown) => {
        const rejectData = data as { calleeId: string; reason?: string }
        console.log(`Call rejected: ${rejectData.reason || 'by user'}`)
        endCall()
      })

      socketInstance.on('call-ended', () => {
        endCall()
      })

      socketInstance.on('ice-candidate', async (data: unknown) => {
        const iceData = data as { candidate: RTCIceCandidateInit; from: string }
        try {
          const { addIceCandidate } = await import('@/lib/webrtc')
          await addIceCandidate(iceData.candidate)
        } catch (error) {
          console.error('Failed to add ICE candidate:', error)
        }
      })

      socketInstance.on('call-translated', async (data: unknown) => {
        const translatedData = data as {
          original: string
          translated: string
          fromLanguage: string
          toLanguage: string
          senderId: string
        }
        addCallSubtitle(translatedData.original, translatedData)

        try {
          const { speak, isSpeechSynthesisSupported } = await import('@/lib/speech')
          if (isSpeechSynthesisSupported()) {
            speak(translatedData.translated, translatedData.toLanguage)
          }
        } catch (error) {
          console.error('TTS error:', error)
        }
      })

      socketRef.current = socketInstance

      ;(window as unknown as Record<string, unknown>).__chatlingo_socket = socketInstance

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
      ;(window as unknown as Record<string, unknown>).__chatlingo_socket = null
    }
  }, [token, user, addMessage, setConversations, receiveCall, setCallStatus, endCall, addCallSubtitle])

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

  // WebRTC + Speech Recognition lifecycle for calls
  const cleanupCall = useCallback(async () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }

    recognitionActiveRef.current = false
    try {
      const { stopRecognition } = await import('@/lib/speech')
      stopRecognition()
    } catch { /* ignore */ }

    try {
      const { stopSpeaking } = await import('@/lib/speech')
      stopSpeaking()
    } catch { /* ignore */ }

    try {
      const { closePeerConnection } = await import('@/lib/webrtc')
      closePeerConnection()
    } catch { /* ignore */ }

    webRTCInitializedRef.current = false
  }, [])

  // Initialize call when status changes to 'ringing'
  useEffect(() => {
    if (callStatus === 'ringing' && !webRTCInitializedRef.current && user && callPartner) {
      webRTCInitializedRef.current = true
      const isVideo = callType === 'video'

      const initOutgoingCall = async () => {
        try {
          const {
            requestLocalStream,
            createPeerConnection,
            createOffer,
          } = await import('@/lib/webrtc')

          await requestLocalStream(isVideo)

          const pc = createPeerConnection({
            onIceCandidate: (candidate) => {
              socketRef.current?.emit('ice-candidate', {
                candidate,
                targetUserId: callPartner!.id,
                userId: user!.id,
              })
            },
            onRemoteStream: () => {},
            onIceConnectionStateChange: (state) => {
              console.log('ICE connection state:', state)
              if (state === 'disconnected' || state === 'failed') {
                endCall()
              }
            },
            onTrack: () => {},
          })

          const offer = await createOffer()

          socketRef.current?.emit('call-offer', {
            callerId: user!.id,
            calleeId: callPartner!.id,
            conversationId: callConversationId,
            callType: isVideo ? 'video' : 'voice',
            callerName: user!.name,
            callerLanguage: callMyLanguage,
            calleeLanguage: callTheirLanguage,
            offer,
          })
        } catch (error) {
          console.error('Failed to initialize outgoing call:', error)
          endCall()
        }
      }

      initOutgoingCall()
    }
  }, [callStatus, user, callPartner, callType, callConversationId, callMyLanguage, callTheirLanguage, endCall])

  useEffect(() => {
    if (callStatus === 'connected' && !webRTCInitializedRef.current && user && callPartner) {
      webRTCInitializedRef.current = true
    }
  }, [callStatus, user, callPartner])

  // Start call duration timer and speech recognition when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      let duration = 0
      callTimerRef.current = setInterval(() => {
        duration++
        setCallDuration(duration)
      }, 1000)

      const startRecognition = async () => {
        try {
          const { startRecognition: startRec, isSpeechRecognitionSupported } = await import('@/lib/speech')
          if (!isSpeechRecognitionSupported()) return

          recognitionActiveRef.current = true

          startRec(callMyLanguage, (text, isFinal) => {
            if (!isFinal || !recognitionActiveRef.current) return
            if (!socketRef.current || !user || !callPartner) return

            setCallTranslationPending(true)

            socketRef.current.emit('call-translation', {
              text,
              sourceLanguage: callMyLanguage,
              targetLanguage: callTheirLanguage,
              conversationId: callConversationId,
              senderId: user.id,
              targetUserId: callPartner.id,
            })
          })
        } catch (error) {
          console.error('Failed to start speech recognition:', error)
        }
      }

      setTimeout(startRecognition, 1500)

      return () => {
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current)
          callTimerRef.current = null
        }
      }
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
        callTimerRef.current = null
      }
    }
  }, [callStatus, callMyLanguage, callTheirLanguage, callConversationId, user, callPartner, setCallDuration, setCallTranslationPending])

  // Clean up when call ends
  useEffect(() => {
    if (!isInCall) {
      cleanupCall()
    }
  }, [isInCall, cleanupCall])

  // Determine what to show in the main content area
  const renderMainContent = () => {
    if (activeTab === 'status') {
      return <EmptyStatusTab />
    }
    if (activeTab === 'calls') {
      return <EmptyCallsTab />
    }
    if (activeTab === 'channels') {
      return <ChannelsTab />
    }
    if (activeTab === 'explore') {
      return <ExploreTab />
    }
    if (activeTab === 'learn') {
      return <LearnTab />
    }
    return null
  }

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <div className="h-screen flex bg-white">
      {/* ============ CONTACTS SIDEBAR (LEFT) ============ */}
      {/* On desktop: always visible as a narrow panel */}
      {/* On mobile: visible when no conversation is active */}
      <div className={`
        ${activeTab === 'chats' ? '' : 'hidden'}
        ${!activeConversation && activeTab === 'chats' ? 'w-full' : 'hidden md:flex'}
        ${!activeConversation && activeTab !== 'chats' ? 'hidden' : 'hidden md:block'}
        w-[300px] shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col h-full
      `}>
        {/* Contacts Header */}
        <div className="bg-[#0F4C5C] px-3 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#84CC16] flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-white font-semibold text-sm">Contacts</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddContact(true)}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Add Contact"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFABMenu(!showFABMenu)}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="More options"
            >
              {showFABMenu ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* FAB Menu Overlay */}
        {showFABMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowFABMenu(false)} />
        )}
        {showFABMenu && (
          <div className="absolute top-12 right-2 bg-white rounded-xl shadow-lg py-2 z-50 w-52 border border-[#E2E8F0] animate-fadeIn">
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
              onClick={() => { useChatLingoStore.getState().setShowCreateGroup(true); setShowFABMenu(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#84CC16] flex items-center justify-center">
                <UsersRound className="w-4 h-4 text-white" />
              </div>
              New Group
            </button>
            <button
              onClick={() => { useChatLingoStore.getState().setShowCreateChannel(true); setShowFABMenu(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#134E5E] flex items-center justify-center">
                <Hash className="w-4 h-4 text-white" />
              </div>
              New Channel
            </button>
            <button
              onClick={() => { useChatLingoStore.getState().setShowCreateRoom(true); setShowFABMenu(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#84CC16] flex items-center justify-center">
                <Radio className="w-4 h-4 text-white" />
              </div>
              Start Room
            </button>
            <button
              onClick={() => { useChatLingoStore.getState().setShowBroadcast(true); setShowFABMenu(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#84CC16] flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              Broadcast
            </button>
            <button
              onClick={() => { setActiveTab('learn'); setShowFABMenu(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#F1F5F9] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F4C5C] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              Language Exchange
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-2.5 py-2 bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
            <Input
              placeholder="Search contacts..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="pl-8 h-8 bg-[#F1F5F9] border-none rounded-lg text-xs placeholder:text-[#A3A3A3] focus-visible:ring-1 focus-visible:ring-[#84CC16]/20"
            />
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
          {loadingContacts ? (
            <div className="p-8 text-center">
              <span className="w-5 h-5 border-2 border-[#84CC16]/30 border-t-[#84CC16] rounded-full animate-spin inline-block" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-[#525252]">
                {contactSearch ? 'No contacts found' : 'No contacts yet'}
              </p>
              <p className="text-xs text-[#A3A3A3] mt-1">
                {contactSearch ? 'Try a different search' : 'Add contacts to start chatting'}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isActive={activeConversation?.otherUser?.id === contact.id}
                onClick={() => handleStartConversation(contact.id, contact.preferredLanguage)}
              />
            ))
          )}
        </div>

        {/* User bar at bottom */}
        <div className="px-2.5 py-2 flex items-center gap-2 bg-white border-t border-[#E2E8F0] shrink-0">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-[#ECFCCB] text-[#0F4C5C] text-[10px] font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#0A0A0A] truncate">{user?.name}</p>
            <span className="text-[10px] text-[#A3A3A3]">
              {getLanguageFlag(user?.preferredLanguage || 'English')} {user?.preferredLanguage}
            </span>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT AREA ============ */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* On mobile: show contacts when no conversation active */}
        {activeTab === 'chats' && !activeConversation && (
          <div className="md:hidden w-full">
            <ContactsMobileView
              contacts={filteredContacts}
              loading={loadingContacts}
              onContactClick={(contact) => handleStartConversation(contact.id, contact.preferredLanguage)}
              onAddContact={() => setShowAddContact(true)}
              user={user}
              userInitials={userInitials}
            />
          </div>
        )}

        {/* Desktop: always show content, mobile: show when chat is active or non-chats tab */}
        <div className={`flex-1 flex flex-col min-w-0 ${
          activeTab === 'chats' && !activeConversation ? 'hidden md:flex' : ''
        } ${activeTab !== 'chats' ? 'hidden md:flex' : ''}`}>
          {activeTab === 'chats' && activeConversation ? (
            <ChatArea socket={socketRefForChildren.current} />
          ) : activeTab === 'chats' ? (
            <EmptyChatState showWelcome={conversations.length === 0} />
          ) : (
            renderMainContent()
          )}
        </div>

        {/* Mobile: back button overlay on chat */}
        {activeTab === 'chats' && activeConversation && (
          <button
            onClick={() => {
              const { setActiveConversation } = useChatLingoStore.getState()
              setActiveConversation(null)
            }}
            className="md:hidden absolute top-3 left-3 z-10 p-2 bg-[#0F4C5C]/90 backdrop-blur-sm text-white rounded-full hover:bg-[#0F4C5C] transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}


      </div>

      {/* ============ DIALOGS ============ */}
      {showAddContact && <AddContactDialog />}
      {showLanguageSettings && <LanguageSettingsDialog />}
      {showCreateStatus && <CreateStatusDialog />}
      {showCreateGroup && <CreateGroupDialog />}
      {showCreateChannel && <CreateChannelDialog />}
      {showCreateRoom && <CreateRoomDialog />}
      {showLearnSetup && <LearnSetupDialog />}
      {showLearnPairDialog && <LearnPairDialog />}
      {showLeaderboard && <LeaderboardDialog />}

      {/* Status Viewer Overlay */}
      {showStatusViewer && <StatusViewer />}

      {/* Call Screen Overlay */}
      {isInCall && <CallScreen />}

      {/* Room Screen Overlay */}
      {isInRoom && <RoomScreen />}

      {/* Lesson Screen Overlay */}
      {lessonInProgress && <LessonScreen />}

      {/* Mobile Bottom Navigation */}
      <div className="wa-bottom-nav md:hidden">
        <button
          onClick={() => setActiveTab('learn')}
          className={`wa-bottom-nav-item ${activeTab === 'learn' ? 'active' : 'inactive'}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span className="text-[11px]">Learn</span>
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`wa-bottom-nav-item ${activeTab === 'chats' ? 'active' : 'inactive'}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19.07 4.93C17.22 3 14.66 1.88 12 1.88S6.78 3 4.93 4.93C3 6.78 1.88 9.34 1.88 12S3 17.22 4.93 19.07C21 17.22 22.12 14.66 22.12 12S21 6.78 19.07 4.93zM12 20.12c-2.24 0-4.3-.86-5.83-2.27L12 12l5.83 5.85C16.3 19.26 14.24 20.12 12 20.12z"/>
          </svg>
          <span className="text-[11px]">Chats</span>
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`wa-bottom-nav-item ${activeTab === 'status' ? 'active' : 'inactive'}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <line x1="12" y1="3" x2="12" y2="5"/>
            <line x1="12" y1="19" x2="12" y2="21"/>
            <line x1="3" y1="12" x2="5" y2="12"/>
            <line x1="19" y1="12" x2="21" y2="12"/>
          </svg>
          <span className="text-[11px]">Status</span>
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`wa-bottom-nav-item ${activeTab === 'calls' ? 'active' : 'inactive'}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.11 0.45 772a2 2 0 0 1 22 16.92z"/>
          </svg>
          <span className="text-[11px]">Calls</span>
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`wa-bottom-nav-item ${activeTab === 'explore' ? 'active' : 'inactive'}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10A15.3 15.3 0 0 1 4 10 0 15.3 0 0 1 4-10"/>
          </svg>
          <span className="text-[11px]">Explore</span>
        </button>
      </div>
    </div>
  )
}

// Mobile contacts full-screen view
function ContactsMobileView({
  contacts,
  loading,
  onContactClick,
  onAddContact,
  user,
  userInitials,
}: {
  contacts: Array<{
    id: string
    name: string
    email: string
    phone?: string | null
    preferredLanguage: string
    avatar?: string | null
    online: boolean
  }>
  loading: boolean
  onContactClick: (contact: { id: string; preferredLanguage: string }) => void
  onAddContact: () => void
  user: { id: string; name: string; preferredLanguage: string; avatar?: string | null } | null
  userInitials: string
}) {
  const [search, setSearch] = useState('')

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#134E5E] text-white text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-white font-semibold text-base">ChatLingo</h2>
            <p className="text-white/60 text-xs">{contacts.length} contacts</p>
          </div>
        </div>
        <button
          onClick={onAddContact}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Add Contact"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white shrink-0 border-b border-[#E2E8F0]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-[#F1F5F9] border-none rounded-xl text-sm placeholder:text-[#A3A3A3] focus-visible:ring-1 focus-visible:ring-[#84CC16]/20"
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1">
        {loading ? (
          <div className="p-8 text-center">
            <span className="w-6 h-6 border-2 border-[#84CC16]/30 border-t-[#84CC16] rounded-full animate-spin inline-block" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" />
            <p className="text-sm text-[#525252]">
              {search ? 'No contacts found' : 'No contacts yet'}
            </p>
            <p className="text-xs text-[#A3A3A3] mt-1">
              {search ? 'Try a different search' : 'Add contacts to start chatting'}
            </p>
          </div>
        ) : (
          filtered.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              onClick={() => onContactClick({ id: contact.id, preferredLanguage: contact.preferredLanguage })}
            />
          ))
        )}
      </div>
    </div>
  )
}
