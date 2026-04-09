'use client'

import { useEffect, useState } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag, getLanguageLabel } from '@/lib/languages'
import {
  X,
  Mic,
  MicOff,
  LogOut,
  Hand,
  Wifi,
  Globe,
  Users,
} from 'lucide-react'

export function RoomScreen() {
  const {
    token,
    user,
    activeRoom,
    roomRole,
    isMicOn,
    setIsMicOn,
    isHandRaised,
    setIsHandRaised,
    roomSubtitles,
    isInRoom,
    setIsInRoom,
    setActiveRoom,
    setRoomRole,
  } = useChatLingoStore()

  const [isConnecting, setIsConnecting] = useState(true)

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => setIsConnecting(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleLeave = async () => {
    if (token && activeRoom) {
      try {
        await fetch(`/api/rooms/${activeRoom.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // ignore
      }
    }
    setIsInRoom(false)
    setActiveRoom(null)
    setRoomRole(null)
    setIsMicOn(true)
    setIsHandRaised(false)
  }

  const handleToggleMic = () => {
    setIsMicOn(!isMicOn)
  }

  const handleToggleHand = () => {
    setIsHandRaised(!isHandRaised)
  }

  const handleRequestToSpeak = () => {
    setIsHandRaised(true)
    // In production, emit to server
  }

  if (!activeRoom) return null

  return (
    <div className="fixed inset-0 z-[100] bg-[#1F2C34] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {activeRoom.isLive && (
              <span className="flex items-center gap-1 text-xs text-red-400 font-medium bg-red-400/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full wa-live-dot" />
                LIVE
              </span>
            )}
          </div>
          <div>
            <h2 className="text-white text-base font-semibold">{activeRoom.name}</h2>
            <p className="text-white/50 text-xs">
              {activeRoom.participants?.length || 1} participants · {getLanguageFlag(activeRoom.language)} {activeRoom.language}
            </p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Language pair indicator */}
      <div className="mx-4 mb-3 px-3 py-1.5 bg-white/5 rounded-lg flex items-center justify-center gap-2">
        <Globe className="w-3.5 h-3.5 text-[#84CC16]" />
        <span className="text-xs text-white/60">
          {getLanguageFlag(user?.preferredLanguage || 'English')} {getLanguageLabel(user?.preferredLanguage || 'English')}
          <span className="mx-2 text-white/30">↔</span>
          {getLanguageFlag(activeRoom.language)} {getLanguageLabel(activeRoom.language)}
        </span>
      </div>

      {/* Connecting overlay */}
      {isConnecting && (
        <div className="absolute inset-0 z-50 bg-[#1F2C34]/90 flex items-center justify-center">
          <div className="text-center">
            <span className="w-8 h-8 border-2 border-[#84CC16]/30 border-t-[#84CC16] rounded-full animate-spin inline-block mb-3" />
            <p className="text-white/60 text-sm">Joining room...</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Speakers section */}
        <div className="px-4 py-4">
          <p className="text-xs text-white/40 uppercase font-medium mb-3">
            Speakers · {activeRoom.speakerCount}
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Current user as speaker */}
            {roomRole === 'speaker' && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#84CC16]/20 border-2 border-[#84CC16] flex items-center justify-center wa-speaking-ring">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-[#134E5E] text-white text-lg font-semibold">
                        {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {!isMicOn && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#1F2C34]">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-white text-xs font-medium">
                  {user?.name?.split(' ')[0]} (You)
                </span>
                {isMicOn && (
                  <div className="flex items-center gap-1">
                    <div className="wa-voice-waveform" style={{ height: '16px' }}>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="bar" style={{ width: '2px', height: '8px' }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#84CC16]">Speaking</span>
                  </div>
                )}
              </div>
            )}

            {/* Other speakers (mock for now) */}
            {Array.from({ length: Math.max(0, activeRoom.speakerCount - (roomRole === 'speaker' ? 1 : 0)) }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 rounded-full bg-[#0F4C5C]/40 border-2 border-white/10 flex items-center justify-center">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-[#374045] text-white/80 text-lg">
                      S{i + 1}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-white/60 text-xs">Speaker {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Listener count */}
        <div className="px-4 py-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/40" />
            <span className="text-xs text-white/40">
              {activeRoom.listenerCount} listening
            </span>
            {isHandRaised && roomRole === 'listener' && (
              <span className="ml-auto text-xs text-yellow-400 flex items-center gap-1">
                <Hand className="w-3 h-3" />
                Hand raised
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Live translated subtitles */}
        <div className="mx-4 mb-4 max-h-32 overflow-y-auto scrollbar-thin space-y-2">
          {roomSubtitles.map((subtitle, idx) => (
            <div
              key={idx}
              className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2.5 animate-slideUp"
            >
              <p className="text-xs text-white/50 mb-0.5">{subtitle.speakerName}</p>
              <p className="text-sm text-white/80">{subtitle.translated}</p>
              {subtitle.original !== subtitle.translated && (
                <p className="text-xs text-white/30 mt-0.5 italic">{subtitle.original}</p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom controls */}
        <div className="px-4 py-4 border-t border-white/5 flex items-center justify-center gap-3 shrink-0">
          {roomRole === 'speaker' ? (
            <>
              <button
                onClick={handleToggleMic}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isMicOn
                    ? 'bg-[#84CC16] hover:bg-[#65A30D]'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
              </button>
              <button
                onClick={handleToggleHand}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isHandRaised
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Hand className={`w-6 h-6 ${isHandRaised ? 'text-white' : 'text-white/80'}`} />
              </button>
              <button
                onClick={handleLeave}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-6 h-6 text-white rotate-180" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRequestToSpeak}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm transition-colors ${
                  isHandRaised
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-[#84CC16] hover:bg-[#65A30D] text-white'
                }`}
              >
                <Hand className="w-4 h-4" />
                {isHandRaised ? 'Hand Raised' : 'Request to Speak'}
              </button>
              <button
                onClick={handleLeave}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-6 h-6 text-white rotate-180" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
