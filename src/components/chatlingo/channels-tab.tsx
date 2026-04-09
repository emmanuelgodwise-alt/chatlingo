'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChatLingoStore } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { getLanguageFlag } from '@/lib/languages'
import {
  Search,
  Plus,
  Heart,
  Users,
  MessageCircle,
  Hash,
  Globe,
  TrendingUp,
} from 'lucide-react'

interface Channel {
  id: string
  name: string
  description?: string
  isPublic: boolean
  language?: string
  memberCount: number
  owner: { id: string; name: string; avatar?: string | null }
  isJoined: boolean
}

interface ChannelPost {
  id: string
  content: string
  translatedContent?: string
  author: { id: string; name: string; avatar?: string | null }
  likes: number
  liked: boolean
  createdAt: string
}

export function ChannelsTab() {
  const { token, user, setShowCreateChannel } = useChatLingoStore()

  const [channels, setChannels] = useState<Channel[]>([])
  const [discoverChannels, setDiscoverChannels] = useState<Channel[]>([])
  const [posts, setPosts] = useState<Record<string, ChannelPost[]>>({})
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'joined' | 'discover'>('joined')

  const loadChannels = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/channels', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setChannels(data.channels || [])
        setDiscoverChannels(data.discover || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadPosts = useCallback(async (channelId: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/channels/${channelId}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => ({ ...prev, [channelId]: data.posts || [] }))
      }
    } catch {
      // ignore
    }
  }, [token])

  const discoverChannels_search = useCallback(async () => {
    if (!token) return
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      const res = await fetch(`/api/channels/discover?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setDiscoverChannels(data.channels || [])
      }
    } catch {
      // ignore
    }
  }, [token, searchQuery])

  useEffect(() => {
    loadChannels()
  }, [loadChannels])

  useEffect(() => {
    if (activeSection === 'discover') {
      discoverChannels_search()
    }
  }, [activeSection, discoverChannels_search])

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId)
    if (!posts[channelId]) {
      loadPosts(channelId)
    }
  }

  const handleJoinChannel = async (channelId: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/channels/${channelId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        loadChannels()
      }
    } catch {
      // ignore
    }
  }

  const handleLikePost = async (channelId: string, postId: string) => {
    // Optimistic update
    setPosts((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || []).map((p) =>
        p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      ),
    }))
  }

  const allChannels = activeSection === 'joined' ? channels : discoverChannels

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between wa-shadow-header shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-white" />
          <h2 className="text-white font-semibold text-base">Channels</h2>
        </div>
        <button
          onClick={() => setShowCreateChannel(true)}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] shrink-0">
        <button
          onClick={() => setActiveSection('joined')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeSection === 'joined'
              ? 'text-[#0F4C5C]'
              : 'text-[#525252] hover:text-[#0F4C5C]'
          }`}
        >
          My Channels
          {activeSection === 'joined' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[3px] bg-[#0F4C5C] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveSection('discover')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeSection === 'discover'
              ? 'text-[#0F4C5C]'
              : 'text-[#525252] hover:text-[#0F4C5C]'
          }`}
        >
          Discover
          {activeSection === 'discover' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[3px] bg-[#0F4C5C] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Search */}
      {activeSection === 'discover' && (
        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-[#F1F5F9] border-none rounded-lg text-sm placeholder:text-[#525252] focus-visible:ring-0"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-8 text-center">
            <span className="w-6 h-6 border-2 border-[#84CC16]/30 border-t-[#84CC16] rounded-full animate-spin inline-block" />
          </div>
        ) : allChannels.length === 0 ? (
          <div className="p-8 text-center">
            <Hash className="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" />
            <p className="text-sm text-[#525252]">
              {activeSection === 'joined' ? 'No channels yet' : 'No channels found'}
            </p>
            <p className="text-xs text-[#A3A3A3] mt-1">
              {activeSection === 'joined'
                ? 'Join a channel to start following'
                : 'Try a different search'}
            </p>
          </div>
        ) : activeChannelId ? (
          /* Channel Posts View */
          <div>
            {/* Channel header */}
            <div className="px-4 py-3 bg-[#F1F5F9] border-b border-[#E2E8F0]">
              <button
                onClick={() => setActiveChannelId(null)}
                className="text-[#0F4C5C] text-sm font-medium mb-2"
              >
                ← Back to channels
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#84CC16] flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-[#0A0A0A]">
                    {allChannels.find((c) => c.id === activeChannelId)?.name}
                  </h3>
                  <p className="text-xs text-[#525252]">
                    {allChannels.find((c) => c.id === activeChannelId)?.memberCount} members
                  </p>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="divide-y divide-[#E2E8F0]">
              {(posts[activeChannelId] || []).map((post) => {
                const initials = post.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div key={post.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-[#E2E8F0] text-[#0A0A0A] text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[#0A0A0A]">{post.author.name}</span>
                      <span className="text-xs text-[#A3A3A3]">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#0A0A0A] whitespace-pre-wrap break-words mb-2">
                      {post.translatedContent || post.content}
                    </p>
                    {post.translatedContent && post.translatedContent !== post.content && (
                      <p className="text-xs text-[#A3A3A3] italic mb-2">
                        Original: {post.content}
                      </p>
                    )}
                    <button
                      onClick={() => handleLikePost(activeChannelId, post.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        post.liked ? 'text-red-500' : 'text-[#525252] hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                      {post.likes > 0 && <span>{post.likes}</span>}
                    </button>
                  </div>
                )
              })}
              {(!posts[activeChannelId] || posts[activeChannelId].length === 0) && (
                <div className="p-8 text-center">
                  <MessageCircle className="w-10 h-10 text-[#E2E8F0] mx-auto mb-2" />
                  <p className="text-sm text-[#525252]">No posts yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Channel List */
          allChannels.map((channel) => {
            const initials = channel.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            return (
              <button
                key={channel.id}
                onClick={() => handleSelectChannel(channel.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F1F5F9] transition-colors border-b border-[#E2E8F0]"
              >
                <div className="w-12 h-12 rounded-full bg-[#84CC16] flex items-center justify-center shrink-0">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-[#0A0A0A] truncate">{channel.name}</p>
                  {channel.description && (
                    <p className="text-xs text-[#525252] truncate">{channel.description}</p>
                  )}
                  <p className="text-xs text-[#A3A3A3]">
                    <Users className="w-3 h-3 inline mr-1" />
                    {channel.memberCount} members
                    {channel.language && (
                      <span className="ml-2">
                        {getLanguageFlag(channel.language)} {channel.language}
                      </span>
                    )}
                  </p>
                </div>
                {!channel.isJoined && activeSection === 'discover' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      handleJoinChannel(channel.id)
                    }}
                    className="text-[#0F4C5C] text-xs font-medium px-3 py-1 bg-[#ECFCCB] rounded-full hover:bg-[#ECFCCB] transition-colors"
                  >
                    Follow
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
