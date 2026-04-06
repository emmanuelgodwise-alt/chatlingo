'use client'

import { Globe, Lock, MessageCircle } from 'lucide-react'

export function EmptyChatState({ showWelcome }: { showWelcome: boolean }) {
  if (showWelcome) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#F0F2F5' }}>
        <div className="text-center max-w-md">
          {/* ChatLingo Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#075E54] mb-6 shadow-lg">
            <Globe className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-light text-[#41525D] mb-2">
            Welcome to ChatLingo
          </h2>
          <p className="text-sm text-[#667781] mb-10 leading-relaxed max-w-sm mx-auto">
            Send and receive messages without worrying about language barriers. 
            ChatLingo automatically translates your conversations in real-time.
          </p>

          {/* Encryption Notice */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Lock className="w-4 h-4 text-[#667781]" />
            <span className="text-xs text-[#667781]">
              Your personal messages are end-to-end auto-translated
            </span>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div>
                <p className="text-sm text-[#111B21] font-medium">Add Contacts</p>
                <p className="text-xs text-[#8696A0]">
                  Click <span className="font-medium">+</span> to find and add people
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <div>
                <p className="text-sm text-[#111B21] font-medium">Start Chatting</p>
                <p className="text-xs text-[#8696A0]">
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
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#F0F2F5' }}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E9EDEF] mb-4">
          <MessageCircle className="w-10 h-10 text-[#667781]" />
        </div>
        <h3 className="text-2xl font-light text-[#41525D] mb-2">ChatLingo for Web</h3>
        <p className="text-sm text-[#667781] max-w-xs mx-auto">
          Send and receive messages without worrying about language barriers.
          Select a chat from the sidebar to start messaging.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-[#8696A0]" />
          <span className="text-xs text-[#8696A0]">
            End-to-end encrypted with auto-translation
          </span>
        </div>
      </div>
    </div>
  )
}
