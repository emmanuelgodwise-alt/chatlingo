'use client'

import { useChatLingoStore } from '@/lib/store'
import type { LeaderboardEntry } from '@/lib/store'
import { X, Trophy, Flame, Star, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function LeaderboardDialog() {
  const { token, setShowLeaderboard } = useChatLingoStore()
  const [tab, setTab] = useState<'global' | 'friends'>('global')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [targetLanguage, setTargetLanguage] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    if (!token) return
    const params = new URLSearchParams()
    if (tab === 'friends') params.set('friends', 'true')
    if (targetLanguage) params.set('targetLanguage', targetLanguage)

    fetch(`/api/learn/leaderboard?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || [])
      })
      .catch(() => {
        setEntries([])
      })
      .finally(() => setLoading(false))
  }, [token, tab, targetLanguage])

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  const getLevelLabel = (level: number) => {
    if (level >= 5) return 'Expert'
    if (level >= 4) return 'Advanced'
    if (level >= 3) return 'Intermediate'
    if (level >= 2) return 'Elementary'
    return 'Beginner'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Green Header */}
        <div className="bg-[#0F4C5C] px-6 py-5 rounded-t-xl flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-white text-xl font-semibold">
              <span className="text-2xl">🏆</span>
              Leaderboard
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Top language learners ranked by XP
            </p>
          </div>
          <button
            onClick={() => setShowLeaderboard(false)}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filter */}
        <div className="flex border-b border-[#E2E8F0]">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'global'
                ? 'text-[#0F4C5C] border-[#0F4C5C]'
                : 'text-[#525252] border-transparent hover:text-[#0A0A0A]'
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'friends'
                ? 'text-[#0F4C5C] border-[#0F4C5C]'
                : 'text-[#525252] border-transparent hover:text-[#0A0A0A]'
            }`}
          >
            👥 Friends
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#84CC16] animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-[#A3A3A3]" />
              </div>
              <p className="text-sm font-medium text-[#0A0A0A] mb-1">
                No learners yet
              </p>
              <p className="text-xs text-[#525252]">
                Be the first! Start learning to climb the leaderboard.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const medal = getMedal(entry.rank)
                const initials = entry.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                const isCurrentUser = entry.isCurrentUser

                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isCurrentUser
                        ? 'bg-[#84CC16]/10 border border-[#84CC16]/20'
                        : entry.rank <= 3
                        ? 'bg-[#F1F5F9]'
                        : 'hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {medal ? (
                        <span className="text-lg">{medal}</span>
                      ) : (
                        <span className="text-sm font-medium text-[#525252]">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                        entry.rank === 1
                          ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                          : entry.rank === 2
                          ? 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                          : entry.rank === 3
                          ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                          : 'bg-[#E2E8F0] text-[#0A0A0A]'
                      }`}
                    >
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrentUser ? 'text-[#0F4C5C]' : 'text-[#0A0A0A]'
                        }`}
                      >
                        {entry.name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-xs text-[#84CC16] font-normal">
                            (You)
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#525252] flex items-center gap-0.5">
                          <Star className="w-3 h-3" />
                          Lvl {entry.level} {getLevelLabel(entry.level)}
                        </span>
                        {entry.currentStreak > 0 && (
                          <span className="text-xs text-[#525252] flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {entry.currentStreak}d
                          </span>
                        )}
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrentUser ? 'text-[#0F4C5C]' : 'text-[#0A0A0A]'
                        }`}
                      >
                        {entry.totalXp.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#A3A3A3]">XP</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2 border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={() => setShowLeaderboard(false)}
            className="text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
