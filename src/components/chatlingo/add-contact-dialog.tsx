'use client'

import { useChatLingoStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LANGUAGES, getLanguageFlag } from '@/lib/languages'
import { Search, UserPlus, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AddContactDialog() {
  const { token, setShowAddContact } = useChatLingoStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      name: string
      email: string
      phone?: string | null
      preferredLanguage: string
      avatar?: string | null
      online: boolean
    }>
  >([])
  const [searching, setSearching] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `/api/users?q=${encodeURIComponent(searchQuery.trim())}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.users || [])
        }
      } catch {
        // ignore
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, token])

  const handleAddContact = async (userId: string) => {
    if (!token) return
    setAddingId(userId)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contactUserId: userId }),
      })

      if (res.ok) {
        setAddedIds((prev) => new Set([...prev, userId]))
      }
    } catch {
      // ignore
    } finally {
      setAddingId(null)
    }
  }

  return (
    <Dialog open onOpenChange={() => setShowAddContact(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Add Contact
          </DialogTitle>
          <DialogDescription>
            Search for people by name or email to start chatting across languages.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="max-h-64">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <span className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => {
                const initials = user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                const isAdded = addedIds.has(user.id)
                const isAdding = addingId === user.id

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {getLanguageFlag(user.preferredLanguage)} {user.preferredLanguage}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isAdded ? 'secondary' : 'default'}
                      className={
                        isAdded
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }
                      disabled={isAdded || isAdding}
                      onClick={() => handleAddContact(user.id)}
                    >
                      {isAdded ? 'Added' : isAdding ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No users found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}

          {!searching && searchQuery.length < 2 && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">Type at least 2 characters to search</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddContact(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
