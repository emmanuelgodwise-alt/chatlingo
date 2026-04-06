'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Sidebar } from '@/components/chatlingo/sidebar'
import { ChatArea } from '@/components/chatlingo/chat-area'
import { AddContactDialog } from '@/components/chatlingo/add-contact-dialog'
import { LanguageSettingsDialog } from '@/components/chatlingo/language-settings-dialog'
import { EmptyChatState } from '@/components/chatlingo/empty-chat-state'
import { CallScreen } from '@/components/chatlingo/call-screen'
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
  } = useChatLingoStore()

  const socketRef = useRef<Socket | null>(null)
  const socketRefForChildren = socketRef
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const webRTCInitializedRef = useRef(false)
  const recognitionActiveRef = useRef(false)

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

      // ============================================
      // Call event listeners
      // ============================================

      // Incoming call
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
        // Store caller ID globally for answering
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

      // Call answered
      socketInstance.on('call-answered', async (data: unknown) => {
        const answerData = data as {
          callerId: string
          calleeId: string
          conversationId: string
          answer: RTCSessionDescriptionInit
        }
        // Set remote description with the answer
        try {
          const { setRemoteDescription } = await import('@/lib/webrtc')
          await setRemoteDescription(answerData.answer)
          setCallStatus('connected')
        } catch (error) {
          console.error('Failed to set remote description:', error)
          endCall()
        }
      })

      // Call rejected
      socketInstance.on('call-rejected', (data: unknown) => {
        const rejectData = data as { calleeId: string; reason?: string }
        console.log(`Call rejected: ${rejectData.reason || 'by user'}`)
        endCall()
      })

      // Call ended by other party
      socketInstance.on('call-ended', () => {
        endCall()
      })

      // ICE candidate from remote peer
      socketInstance.on('ice-candidate', async (data: unknown) => {
        const iceData = data as { candidate: RTCIceCandidateInit; from: string }
        try {
          const { addIceCandidate } = await import('@/lib/webrtc')
          await addIceCandidate(iceData.candidate)
        } catch (error) {
          console.error('Failed to add ICE candidate:', error)
        }
      })

      // Translated text from remote peer
      socketInstance.on('call-translated', async (data: unknown) => {
        const translatedData = data as {
          original: string
          translated: string
          fromLanguage: string
          toLanguage: string
          senderId: string
        }
        addCallSubtitle(translatedData.original, translatedData)

        // Speak the translated text
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

      // Store socket globally for use in CallScreen
      ;(window as unknown as Record<string, unknown>).__chatlingo_socket = socketInstance

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

  // ============================================
  // WebRTC + Speech Recognition lifecycle for calls
  // ============================================
  const cleanupCall = useCallback(async () => {
    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }

    // Stop speech recognition
    recognitionActiveRef.current = false
    try {
      const { stopRecognition } = await import('@/lib/speech')
      stopRecognition()
    } catch { /* ignore */ }

    // Stop speech synthesis
    try {
      const { stopSpeaking } = await import('@/lib/speech')
      stopSpeaking()
    } catch { /* ignore */ }

    // Close WebRTC
    try {
      const { closePeerConnection } = await import('@/lib/webrtc')
      closePeerConnection()
    } catch { /* ignore */ }

    webRTCInitializedRef.current = false
  }, [])

  // Initialize call when status changes to 'ringing' (outgoing call)
  useEffect(() => {
    if (callStatus === 'ringing' && !webRTCInitializedRef.current && user && callPartner) {
      webRTCInitializedRef.current = true
      const isVideo = callType === 'video'

      const initOutgoingCall = async () => {
        try {
          const {
            getLocalStream,
            createPeerConnection,
            createOffer,
          } = await import('@/lib/webrtc')

          // Get local media
          await getLocalStream(isVideo)

          // Create peer connection
          const pc = createPeerConnection({
            onIceCandidate: (candidate) => {
              socketRef.current?.emit('ice-candidate', {
                candidate,
                targetUserId: callPartner!.id,
                userId: user!.id,
              })
            },
            onRemoteStream: () => {
              // Remote stream received
            },
            onIceConnectionStateChange: (state) => {
              console.log('ICE connection state:', state)
              if (state === 'disconnected' || state === 'failed') {
                endCall()
              }
            },
            onTrack: () => {
              // Track received
            },
          })

          // Create and send offer
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

  // Initialize call when status changes to 'connected' (answerer)
  useEffect(() => {
    if (callStatus === 'connected' && !webRTCInitializedRef.current && user && callPartner) {
      // This is the callee side — WebRTC was already set up when answering
      // If not, we need to handle it
      webRTCInitializedRef.current = true
    }
  }, [callStatus, user, callPartner])

  // Handle accept call (callee WebRTC setup) - triggered by answerCall
  useEffect(() => {
    if (callStatus !== 'connected' || webRTCInitializedRef.current) return
    // Already handled above
  }, [callStatus])

  // Start call duration timer and speech recognition when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      // Start duration timer
      let duration = 0
      callTimerRef.current = setInterval(() => {
        duration++
        setCallDuration(duration)
      }, 1000)

      // Start speech recognition for own voice
      const startRecognition = async () => {
        try {
          const { startRecognition: startRec, isSpeechRecognitionSupported } = await import('@/lib/speech')
          if (!isSpeechRecognitionSupported()) {
            console.warn('Speech recognition not supported')
            return
          }

          recognitionActiveRef.current = true

          // Use socket to send translations
          startRecognition(callMyLanguage, (text, isFinal) => {
            if (!isFinal || !recognitionActiveRef.current) return
            if (!socketRef.current || !user || !callPartner) return

            setCallTranslationPending(true)

            // Send to server for translation
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

      // Small delay to ensure everything is set up
      setTimeout(startRecognition, 1500)

      return () => {
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current)
          callTimerRef.current = null
        }
      }
    } else {
      // Clean up when call ends
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

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className={`hidden md:flex`}>
        <Sidebar socket={socketRefForChildren.current} />
      </div>

      {/* Mobile sidebar (shown when no active conversation) */}
      {!activeConversation && (
        <div className="md:hidden w-full">
          <Sidebar socket={socketRefForChildren.current} />
        </div>
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!activeConversation ? 'hidden md:flex' : ''}`}>
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

      {/* Call Screen Overlay */}
      {isInCall && <CallScreen />}

      {/* Mobile Bottom Navigation */}
      <div className="wa-bottom-nav md:hidden">
        <button className="wa-bottom-nav-item inactive">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          <span className="text-[11px]">Camera</span>
        </button>
        <button className="wa-bottom-nav-item active">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19.07 4.93C17.22 3 14.66 1.88 12 1.88S6.78 3 4.93 4.93C3 6.78 1.88 9.34 1.88 12S3 17.22 4.93 19.07C6.78 21 9.34 22.12 12 22.12S17.22 21 19.07 19.07C21 17.22 22.12 14.66 22.12 12S21 6.78 19.07 4.93zM12 20.12c-2.24 0-4.3-.86-5.83-2.27L12 12l5.83 5.85C16.3 19.26 14.24 20.12 12 20.12z"/>
          </svg>
          <span className="text-[11px]">Chats</span>
        </button>
        <button className="wa-bottom-nav-item inactive">
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
        <button className="wa-bottom-nav-item inactive">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span className="text-[11px]">Calls</span>
        </button>
      </div>
    </div>
  )
}
