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
import { Globe, ArrowRightLeft, Settings } from 'lucide-react'
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
      // Update via WebSocket for real-time sync
      // Also update via REST API as fallback
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            Language Settings
          </DialogTitle>
          <DialogDescription>
            Configure translation languages for your conversation with{' '}
            <strong>{activeConversation.otherUser.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* My Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              Your messages will be in
            </Label>
            <Select value={myLanguage} onValueChange={setMyLanguage}>
              <SelectTrigger className="h-11">
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
            <p className="text-xs text-gray-400">
              Messages you send will be translated from{' '}
              <strong>{getLanguageFlag(myLanguage)} {myLanguage}</strong>
            </p>
          </div>

          {/* Translation Direction Indicator */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3">
              <span className="text-lg">{getLanguageFlag(myLanguage)}</span>
              <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
              <span className="text-lg">{getLanguageFlag(theirLanguage)}</span>
            </div>
          </div>

          {/* Their Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              Their messages will be in
            </Label>
            <Select value={theirLanguage} onValueChange={setTheirLanguage}>
              <SelectTrigger className="h-11">
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
            <p className="text-xs text-gray-400">
              Messages they send will be translated into{' '}
              <strong>{getLanguageFlag(theirLanguage)} {theirLanguage}</strong>
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-700">
              <strong>How it works:</strong> When you type in {myLanguage}, your messages are
              automatically translated to {theirLanguage} for {activeConversation.otherUser.name}.
              Their messages in {theirLanguage} are translated to {myLanguage} for you.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowLanguageSettings(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || myLanguage === theirLanguage}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
