'use client'

import { Globe, MessageCircle, Sparkles } from 'lucide-react'

export function EmptyChatState({ showWelcome }: { showWelcome: boolean }) {
  if (showWelcome) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-xl">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to ChatLingo
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Your gateway to connecting with people across the world. Add contacts and start
            chatting — your messages will be automatically translated into their language.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm">1</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Add Contacts</p>
                <p className="text-xs text-gray-500">
                  Click the + button to find and add people
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm">2</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Set Languages</p>
                <p className="text-xs text-gray-500">
                  Choose your language and your contact&apos;s language
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm">3</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Start Chatting</p>
                <p className="text-xs text-gray-500">
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
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-1">Select a conversation</h3>
        <p className="text-sm text-gray-400">
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    </div>
  )
}
