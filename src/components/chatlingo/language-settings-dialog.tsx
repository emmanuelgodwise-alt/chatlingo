'use client'

import { useChatLingoStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES, getLanguageFlag } from '@/lib/languages'
import { Globe, ArrowRightLeft, Languages } from 'lucide-react'
import { useState, useEffect } from 'react'

export function LanguageSettingsDialog() {
  const { token, activeConversation, setShowLanguageSettings } = useChatLingoStore()
  const [myLanguage, setMyLanguage] = useState('')
  const [theirLanguage, setTheirLanguage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeConversation) {
      setMyLanguage(activeConversation.myLanguage)
      setTheirLanguage(activeConversation.theirLanguage)
    }
  }, [activeConversation])

  const handleSave = async () => {
    if (!token || !activeConversation) return
    setSaving(true)

    try {
      await fetch(
        `/api/conversations/${activeConversation.id}/languages`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ myLanguage, theirLanguage }),
        }
      )

      setShowLanguageSettings(false)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (!activeConversation) return null

  return (
    <Dialog open onOpenChange={() => setShowLanguageSettings(false)}>
      <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden">
        {/* WhatsApp Green Header */}
        <div className="bg-[#075E54] px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-xl">
              <Languages className="w-5 h-5" />
              Language Settings
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Configure translation for your conversation with{' '}
              <strong className="text-white">{activeConversation.otherUser.name}</strong>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Your Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#111B21] flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#075E54]" />
              Your messages appear in
            </Label>
            <Select value={myLanguage} onValueChange={setMyLanguage}>
              <SelectTrigger className="h-11 rounded-lg border-[#E9EDEF] bg-[#F0F2F5] focus:border-[#25D366] focus:ring-[#25D366]/20">
                <SelectValue placeholder="Select your language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#8696A0]">
              <span className="text-base mr-0.5">{getLanguageFlag(myLanguage)}</span>
              <strong>{myLanguage}</strong> — Messages you send will be translated from this language
            </p>
          </div>

          {/* Language Pair Direction */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4 bg-[#F0F2F5] rounded-xl px-6 py-4">
              <div className="text-center">
                <span className="text-2xl block mb-1">{getLanguageFlag(myLanguage)}</span>
                <span className="text-xs text-[#667781]">You</span>
              </div>
              <ArrowRightLeft className="w-6 h-6 text-[#075E54]" />
              <div className="text-center">
                <span className="text-2xl block mb-1">{getLanguageFlag(theirLanguage)}</span>
                <span className="text-xs text-[#667781]">Them</span>
              </div>
            </div>
          </div>

          {/* Their Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#111B21] flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#075E54]" />
              Their messages appear in
            </Label>
            <Select value={theirLanguage} onValueChange={setTheirLanguage}>
              <SelectTrigger className="h-11 rounded-lg border-[#E9EDEF] bg-[#F0F2F5] focus:border-[#25D366] focus:ring-[#25D366]/20">
                <SelectValue placeholder="Select their language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#8696A0]">
              <span className="text-base mr-0.5">{getLanguageFlag(theirLanguage)}</span>
              <strong>{theirLanguage}</strong> — Their messages will be translated into this language for you
            </p>
          </div>

          {/* How it works */}
          <div className="bg-[#F0F2F5] rounded-lg p-4 border border-[#E9EDEF]">
            <p className="text-xs text-[#667781] leading-relaxed">
              <strong className="text-[#111B21]">How it works:</strong> When you type in{' '}
              <strong>{myLanguage}</strong>, your messages are automatically translated to{' '}
              <strong>{theirLanguage}</strong> for {activeConversation.otherUser.name}.
              Their messages in {theirLanguage} are translated to {myLanguage} for you.
              Translation is invisible — you only see your own language.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 pb-5 pt-2 border-t border-[#E9EDEF] flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowLanguageSettings(false)}
            className="flex-1 text-[#667781] border-[#E9EDEF] hover:bg-[#F0F2F5]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#25D366] hover:bg-[#22C55E] text-white border-none"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
