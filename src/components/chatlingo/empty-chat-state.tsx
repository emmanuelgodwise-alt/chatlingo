'use client'

import { useChatLingoStore } from '@/lib/store'
import { StatusBar } from '@/components/chatlingo/status-bar'
import { Globe, Lock, MessageCircle, Phone, PhoneOff, Video, Plus } from 'lucide-react'

export function EmptyChatState({ showWelcome }: { showWelcome: boolean }) {
  if (showWelcome) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center max-w-md">
          {/* ChatLingo Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0F4C5C] mb-5 shadow-lg">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-light text-[#0A0A0A] mb-2">
            Welcome to ChatLingo
          </h2>
          <p className="text-sm text-[#525252] mb-8 leading-relaxed max-w-sm mx-auto">
            Send and receive messages without worrying about language barriers.
            ChatLingo automatically translates your conversations in real-time.
          </p>

          {/* Encryption Notice */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Lock className="w-4 h-4 text-[#525252]" />
            <span className="text-xs text-[#525252]">
              Your personal messages are end-to-end auto-translated
            </span>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#A3E635] flex items-center justify-center shrink-0">
                <span className="text-[#0A0A0A] text-sm font-medium">1</span>
              </div>
              <div>
                <p className="text-sm text-[#0A0A0A] font-medium">Select a Contact</p>
                <p className="text-xs text-[#A3A3A3]">
                  Click on a contact from the left panel to start
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#A3E635] flex items-center justify-center shrink-0">
                <span className="text-[#0A0A0A] text-sm font-medium">2</span>
              </div>
              <div>
                <p className="text-sm text-[#0A0A0A] font-medium">Start Chatting</p>
                <p className="text-xs text-[#A3A3A3]">
                  Messages are auto-translated in real-time!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="text-center">
        <img src="/chatlingo-icon.png" alt="ChatLingo" className="w-16 h-16 rounded-full mb-4" />
        <h3 className="text-xl font-light text-[#0A0A0A] mb-2">ChatLingo for Web</h3>
        <p className="text-sm text-[#525252] max-w-xs mx-auto">
          Send and receive messages without worrying about language barriers.
          Select a contact from the left panel to start messaging.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-[#A3A3A3]" />
          <span className="text-xs text-[#A3A3A3]">
            End-to-end encrypted with auto-translation
          </span>
        </div>
      </div>
    </div>
  )
}

// Status tab content with StatusBar and create button
export function EmptyStatusTab() {
  const { setShowCreateStatus } = useChatLingoStore()

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between wa-shadow-header shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#A3E635] flex items-center justify-center">
            <span className="text-[10px] text-[#0A0A0A] font-bold">!</span>
          </div>
          <h2 className="text-white font-semibold text-base">Status</h2>
        </div>
        <button
          onClick={() => setShowCreateStatus(true)}
          className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Create Status"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Status Bar (horizontal scrolling stories) */}
      <StatusBar />

      {/* Empty state area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E5E5E5] mb-4">
            <MessageCircle className="w-8 h-8 text-[#525252]" />
          </div>
          <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">No status updates</h3>
          <p className="text-sm text-[#525252] mb-6 leading-relaxed">
            Tap <span className="font-medium text-[#0F4C5C]">+ My Status</span> to create your first status update.
            Status updates disappear after 24 hours.
          </p>
          <button
            onClick={() => setShowCreateStatus(true)}
            className="px-6 py-2.5 bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] text-sm font-medium rounded-full transition-colors shadow-sm"
          >
            Create Status
          </button>
          <div className="flex items-center justify-center gap-2 text-[#A3A3A3] mt-6">
            <Lock className="w-3 h-3" />
            <span className="text-xs">Your status updates are end-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Calls tab content
export function EmptyCallsTab() {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center gap-2 wa-shadow-header shrink-0">
        <Phone className="w-5 h-5 text-white" />
        <h2 className="text-white font-semibold text-base">Calls</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E5E5E5] mb-4">
            <PhoneOff className="w-8 h-8 text-[#525252]" />
          </div>
          <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">No recent calls</h3>
          <p className="text-sm text-[#525252] mb-6 leading-relaxed">
            Start a voice or video call from any conversation by tapping
            the <Phone className="w-4 h-4 inline mx-1" /> or <Video className="w-4 h-4 inline mx-1" /> icon
            in the chat header.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-[#A3E635] flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <span className="text-xs text-[#525252]">Voice</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-[#0F4C5C] flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-[#525252]">Video</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
