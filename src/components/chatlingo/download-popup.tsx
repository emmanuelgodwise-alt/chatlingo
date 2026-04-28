'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone, Download, Globe } from 'lucide-react'

export function DownloadPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show once per device — check localStorage
    const dismissed = localStorage.getItem('chatlingo_download_dismissed')
    if (dismissed) return

    // Show after a short delay so the chat interface loads first
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('chatlingo_download_dismissed', 'true')
  }

  const handleDownload = () => {
    // Try to trigger the browser's native "Add to Home Screen" prompt
    // If not available, open the site so they can do it manually
    if (typeof window !== 'undefined') {
      // For iOS/Android, guide them to install via browser menu
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      if (isIOS) {
        alert(
          'To install ChatLingo on your iPhone:\n\n' +
          '1. Tap the Share button (square with up arrow) at the bottom of Safari\n' +
          '2. Scroll down and tap "Add to Home Screen"\n' +
          '3. Tap "Add"\n\n' +
          'ChatLingo will appear on your home screen like a native app!'
        )
      } else if (isAndroid) {
        alert(
          'To install ChatLingo on your Android:\n\n' +
          '1. Tap the three dots menu (top-right of Chrome)\n' +
          '2. Tap "Add to Home screen" or "Install app"\n' +
          '3. Tap "Install"\n\n' +
          'ChatLingo will appear on your home screen like a native app!'
        )
      } else {
        // Desktop — just highlight the install option
        alert(
          'To install ChatLingo on your device:\n\n' +
          'On Chrome: Click the install icon in the address bar, or go to Menu > "Install ChatLingo"\n' +
          'On Edge: Click the install icon in the address bar, or go to Menu > "Apps" > "Install this site as an app"\n\n' +
          'ChatLingo will run as a standalone app on your device!'
        )
      }
    }
    handleDismiss()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Popup Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scaleIn">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-[#525252]" />
        </button>

        {/* Header - Teal gradient */}
        <div className="bg-gradient-to-br from-[#0F4C5C] to-[#134E5E] px-6 pt-8 pb-6 text-center">
          {/* Phone mockup */}
          <div className="mx-auto w-16 h-24 bg-[#1A5C6E] rounded-2xl border-2 border-[#A3E635]/50 flex flex-col items-center justify-center mb-4 shadow-lg">
            <img src="/chatlingo-logo.png" alt="ChatLingo" className="w-10 h-auto" />
            <div className="mt-1 w-8 h-1 bg-[#A3E635]/40 rounded-full" />
          </div>
          <h2 className="text-xl font-bold text-white">Get ChatLingo on Your Phone</h2>
          <p className="text-white/70 text-sm mt-1">
            Chat, translate & learn languages — anywhere
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ECFCCB] flex items-center justify-center shrink-0">
                <Smartphone className="w-4.5 h-4.5 text-[#0F4C5C]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Native App Experience</p>
                <p className="text-xs text-[#737373]">Full screen, fast, no browser bar</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ECFCCB] flex items-center justify-center shrink-0">
                <Download className="w-4.5 h-4.5 text-[#0F4C5C]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Works Offline</p>
                <p className="text-xs text-[#737373]">Access chats even without internet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ECFCCB] flex items-center justify-center shrink-0">
                <Globe className="w-4.5 h-4.5 text-[#0F4C5C]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Real-Time Translation</p>
                <p className="text-xs text-[#737373]">Break language barriers instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2.5">
          <button
            onClick={handleDownload}
            className="w-full h-12 bg-[#A3E635] hover:bg-[#84CC16] text-[#0A0A0A] font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Install ChatLingo
          </button>
          <button
            onClick={handleDismiss}
            className="w-full h-10 text-[#737373] hover:text-[#0A0A0A] text-sm font-medium transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
