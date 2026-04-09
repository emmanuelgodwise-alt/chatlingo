'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { getLanguageFlag, getLanguageLabel } from '@/lib/languages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  PhoneOff,
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  Globe,
  Loader2,
} from 'lucide-react'

// ============================================
// Format call duration as MM:SS
// ============================================
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ============================================
// Main Call Screen Component
// ============================================
export function CallScreen() {
  const {
    callStatus,
    callType,
    callPartner,
    callMyLanguage,
    callTheirLanguage,
    callSubtitles,
    callMuted,
    callSpeakerOn,
    callVideoEnabled,
    callDuration,
    callTranslationPending,
    setCallMuted,
    setCallSpeakerOn,
    setCallVideoEnabled,
  } = useChatLingoStore()

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Attach video streams when available
  useEffect(() => {
    const attachStreams = async () => {
      const { getCurrentLocalStream, getRemoteStream } = await import('@/lib/webrtc')
      const localStream = getCurrentLocalStream()
      const remoteStream = getRemoteStream()

      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream
      }
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    }

    if (callStatus === 'connected') {
      // Small delay to allow streams to be set up
      const timer = setTimeout(attachStreams, 500)
      return () => clearTimeout(timer)
    }
  }, [callStatus])

  // Also watch for stream changes periodically during connected call
  useEffect(() => {
    if (callStatus !== 'connected') return

    const attachStreams = async () => {
      const { getCurrentLocalStream, getRemoteStream } = await import('@/lib/webrtc')
      const localStream = getCurrentLocalStream()
      const remoteStream = getRemoteStream()

      if (localVideoRef.current && localStream && !localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject = localStream
      }
      if (remoteVideoRef.current && remoteStream && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    }

    const interval = setInterval(attachStreams, 1000)
    return () => clearInterval(interval)
  }, [callStatus])

  const handleToggleMute = useCallback(async () => {
    const { toggleLocalAudio } = await import('@/lib/webrtc')
    const newMuted = !callMuted
    setCallMuted(newMuted)
    toggleLocalAudio(!newMuted)

    // Pause/resume speech recognition
    if (newMuted) {
      const { stopRecognition } = await import('@/lib/speech')
      stopRecognition()
    }
  }, [callMuted, setCallMuted])

  const handleToggleSpeaker = useCallback(() => {
    setCallSpeakerOn(!callSpeakerOn)
  }, [callSpeakerOn, setCallSpeakerOn])

  const handleToggleVideo = useCallback(async () => {
    const { toggleLocalVideo } = await import('@/lib/webrtc')
    const newEnabled = !callVideoEnabled
    setCallVideoEnabled(newEnabled)
    toggleLocalVideo(newEnabled)
  }, [callVideoEnabled, setCallVideoEnabled])

  if (!callPartner) return null

  const initials = callPartner.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isVideo = callType === 'video'

  // Render based on call status
  if (callStatus === 'incoming') {
    return <IncomingCallScreen initials={initials} isVideo={isVideo} />
  }

  if (callStatus === 'ringing') {
    return <RingingScreen initials={initials} isVideo={isVideo} />
  }

  if (callStatus === 'connected') {
    return (
      <ConnectedCallScreen
        initials={initials}
        isVideo={isVideo}
        callDuration={callDuration}
        callSubtitles={callSubtitles}
        callMuted={callMuted}
        callSpeakerOn={callSpeakerOn}
        callVideoEnabled={callVideoEnabled}
        callTranslationPending={callTranslationPending}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onToggleMute={handleToggleMute}
        onToggleSpeaker={handleToggleSpeaker}
        onToggleVideo={handleToggleVideo}
      />
    )
  }

  return null
}

// ============================================
// Ringing (Outgoing) Screen
// ============================================
function RingingScreen({ initials, isVideo }: { initials: string; isVideo: boolean }) {
  const { callPartner, callMyLanguage, callTheirLanguage } = useChatLingoStore()

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0F4C5C] to-[#0D4D47] flex flex-col items-center justify-center animate-fadeIn">
      {/* Spinning avatar pulse */}
      <div className="relative mb-8">
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute -inset-3 rounded-full bg-white/5 animate-pulse" style={{ animationDuration: '3s' }} />
        {/* Avatar */}
        <div className="relative w-32 h-32 rounded-full bg-[#134E5E] flex items-center justify-center">
          <Avatar className="w-28 h-28">
            <AvatarFallback className="bg-[#134E5E] text-white text-3xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Contact name */}
      <h2 className="text-white text-2xl font-medium mb-2">{callPartner?.name}</h2>

      {/* Status text */}
      <div className="flex items-center gap-2 mb-6">
        <Loader2 className="w-4 h-4 text-white/70 animate-spin" />
        <span className="text-white/70 text-base">
          {isVideo ? 'Video calling...' : 'Calling...'}
        </span>
      </div>

      {/* Language pair */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-16">
        <span className="text-lg">{getLanguageFlag(callMyLanguage)}</span>
        <span className="text-white/60 text-sm">↔</span>
        <span className="text-lg">{getLanguageFlag(callTheirLanguage)}</span>
        <span className="text-white/50 text-xs ml-1">
          {getLanguageLabel(callMyLanguage)} ↔ {getLanguageLabel(callTheirLanguage)}
        </span>
      </div>

      {/* End call button */}
      <div className="absolute bottom-12">
        <button
          onClick={() => {
            const store = useChatLingoStore.getState()
            store.endCall()
            // Notify peer via socket
            if (store.user && store.callConversationId) {
              const socket = (window as unknown as Record<string, unknown>).__chatlingo_socket as unknown as { emit: (e: string, d: unknown) => void } | null
              if (socket) {
                socket.emit('call-end', {
                  userId: store.user.id,
                  targetUserId: store.callPartner?.id,
                  conversationId: store.callConversationId,
                })
              }
            }
          }}
          className="w-16 h-16 rounded-full bg-[#D32F2F] hover:bg-[#B71C1C] flex items-center justify-center shadow-lg transition-colors"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// Incoming Call Screen
// ============================================
function IncomingCallScreen({ initials, isVideo }: { initials: string; isVideo: boolean }) {
  const {
    callPartner,
    callMyLanguage,
    callTheirLanguage,
    answerCall,
    rejectCall,
    user,
    callPartner: partner,
    callConversationId,
  } = useChatLingoStore()

  const handleAccept = () => {
    answerCall()
    // Notify via socket
    const socket = (window as unknown as Record<string, unknown>).__chatlingo_socket as unknown as { emit: (e: string, d: unknown) => void } | null
    if (socket && user && partner) {
      socket.emit('call-answer', {
        callerId: (window as unknown as Record<string, unknown>).__chatlingo_callerId,
        calleeId: user.id,
        conversationId: callConversationId,
      })
    }
  }

  const handleDecline = () => {
    const socket = (window as unknown as Record<string, unknown>).__chatlingo_socket as unknown as { emit: (e: string, d: unknown) => void } | null
    if (socket && user && partner) {
      socket.emit('call-reject', {
        callerId: (window as unknown as Record<string, unknown>).__chatlingo_callerId,
        calleeId: user.id,
      })
    }
    rejectCall()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0F4C5C] to-[#0D4D47] flex flex-col items-center justify-center animate-fadeIn">
      {/* Pulsing ring animation */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="absolute -inset-8 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2.5s' }} />
        <div className="relative w-32 h-32 rounded-full bg-[#134E5E] flex items-center justify-center">
          <Avatar className="w-28 h-28">
            <AvatarFallback className="bg-[#134E5E] text-white text-3xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Contact name */}
      <h2 className="text-white text-2xl font-medium mb-2">{callPartner?.name}</h2>

      {/* Incoming call text */}
      <p className="text-white/80 text-base mb-1">
        Incoming {isVideo ? 'Video' : 'Voice'} Call
      </p>
      <p className="text-white/50 text-sm mb-6">
        ChatLingo will translate your conversation
      </p>

      {/* Language pair */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-20">
        <span className="text-lg">{getLanguageFlag(callMyLanguage)}</span>
        <span className="text-white/60 text-sm">↔</span>
        <span className="text-lg">{getLanguageFlag(callTheirLanguage)}</span>
        <span className="text-white/50 text-xs ml-1">
          {getLanguageLabel(callMyLanguage)} ↔ {getLanguageLabel(callTheirLanguage)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-16 flex items-center gap-16">
        {/* Decline */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-[#D32F2F] hover:bg-[#B71C1C] flex items-center justify-center shadow-lg transition-colors"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <span className="text-white/70 text-sm">Decline</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleAccept}
            className="w-16 h-16 rounded-full bg-[#A3E635] hover:bg-[#65A30D] flex items-center justify-center shadow-lg transition-colors"
          >
            <Phone className="w-7 h-7 text-[#0A0A0A]" />
          </button>
          <span className="text-white/70 text-sm">Accept</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Connected Call Screen
// ============================================
interface ConnectedCallScreenProps {
  initials: string
  isVideo: boolean
  callDuration: number
  callSubtitles: Array<{ original: string; translated: string; timestamp: Date }>
  callMuted: boolean
  callSpeakerOn: boolean
  callVideoEnabled: boolean
  callTranslationPending: boolean
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  onToggleMute: () => void
  onToggleSpeaker: () => void
  onToggleVideo: () => void
}

function ConnectedCallScreen({
  initials,
  isVideo,
  callDuration,
  callSubtitles,
  callMuted,
  callSpeakerOn,
  callVideoEnabled,
  callTranslationPending,
  localVideoRef,
  remoteVideoRef,
  onToggleMute,
  onToggleSpeaker,
  onToggleVideo,
}: ConnectedCallScreenProps) {
  const { callPartner, callMyLanguage, callTheirLanguage, endCall, user, callConversationId } =
    useChatLingoStore()

  const latestSubtitle = callSubtitles[callSubtitles.length - 1]

  const handleEndCall = () => {
    const socket = (window as unknown as Record<string, unknown>).__chatlingo_socket as unknown as { emit: (e: string, d: unknown) => void } | null
    if (socket && user && callPartner) {
      socket.emit('call-end', {
        userId: user.id,
        targetUserId: callPartner.id,
        conversationId: callConversationId,
      })
    }
    endCall()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0F4C5C] to-[#0D4D47] flex flex-col animate-fadeIn">
      {/* Video call - remote video background */}
      {isVideo && (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay for controls */}
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}

      {/* Header info */}
      <div className="relative z-10 pt-16 pb-4 flex flex-col items-center">
        {/* Voice call - show avatar */}
        {!isVideo && (
          <div className="w-28 h-28 rounded-full bg-[#134E5E] flex items-center justify-center mb-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-[#134E5E] text-white text-3xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Name */}
        <h2 className="text-white text-2xl font-medium mb-1">{callPartner?.name}</h2>

        {/* Call duration */}
        <p className="text-white/70 text-base">{formatDuration(callDuration)}</p>

        {/* Translation badge */}
        <div className="mt-3 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
          {callTranslationPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#A3E635] animate-spin" />
              <span className="text-white/60 text-xs">Translating...</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 text-[#A3E635]" />
              <span className="text-white/60 text-xs">
                {getLanguageLabel(callMyLanguage)} → {getLanguageLabel(callTheirLanguage)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live subtitles bar */}
      {latestSubtitle && (
        <div className="relative z-10 mx-4 mb-4 animate-slideUp">
          <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 max-w-lg mx-auto">
            {/* Original text */}
            <p className="text-white/40 text-xs mb-1 truncate">
              {latestSubtitle.original}
            </p>
            {/* Translated text */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#A3E635] shrink-0" />
              <p className="text-white text-sm font-medium truncate">
                {latestSubtitle.translated}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Call controls */}
      <div className="relative z-10 pb-8 pt-4">
        <div className="flex items-center justify-center gap-6">
          {/* Mute */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                callMuted
                  ? 'bg-white text-[#0F4C5C]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {callMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <span className="text-white/60 text-[11px]">
              {callMuted ? 'Unmute' : 'Mute'}
            </span>
          </div>

          {/* Speaker (voice call only) */}
          {!isVideo && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={onToggleSpeaker}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  callSpeakerOn
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white text-[#0F4C5C]'
                }`}
              >
                {callSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <span className="text-white/60 text-[11px]">
                {callSpeakerOn ? 'Speaker' : 'Off'}
              </span>
            </div>
          )}

          {/* Video toggle (video call only) */}
          {isVideo && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={onToggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  callVideoEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white text-[#0F4C5C]'
                }`}
              >
                {callVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <span className="text-white/60 text-[11px]">
                {callVideoEnabled ? 'Video' : 'Off'}
              </span>
            </div>
          )}

          {/* End Call */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-[#D32F2F] hover:bg-[#B71C1C] flex items-center justify-center shadow-lg transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            <span className="text-white/60 text-[11px]">End</span>
          </div>
        </div>
      </div>

      {/* Video call - local video PIP */}
      {isVideo && (
        <div className="absolute top-20 right-4 z-20 w-28 h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!callVideoEnabled && (
            <div className="absolute inset-0 bg-[#134E5E] flex items-center justify-center">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-[#134E5E] text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
