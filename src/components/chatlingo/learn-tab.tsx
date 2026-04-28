'use client'

import { useEffect, useState, useCallback } from 'react'
import { useChatLingoStore, type LessonData, type LearningPairData } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getLanguageFlag } from '@/lib/languages'
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Settings,
  Star,
  MessageCircle,
  UserPlus,
  Users,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react'

type LessonCategory = 'all' | 'Vocabulary' | 'Phrases' | 'Grammar'

const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
  Vocabulary: { icon: '📖', label: 'Vocabulary', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  Phrases: { icon: '💬', label: 'Phrases', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  Grammar: { icon: '📝', label: 'Grammar', color: 'bg-amber-50 text-amber-700 border-amber-200' },
}

function getLevelLabel(level: number): string {
  if (level <= 1) return 'Beginner'
  if (level === 2) return 'Intermediate'
  return 'Advanced'
}

function getLevelColor(level: number): { bg: string; text: string; dot: string } {
  if (level <= 1) return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' }
  if (level === 2) return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' }
  return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }
}

function getNextLevelThreshold(currentXp: number): { next: number; current: number; progress: number } {
  const thresholds = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 500 },
  ]
  let currentThreshold = 0
  let nextThreshold = 100
  for (const t of thresholds) {
    if (currentXp >= t.xp) {
      currentThreshold = t.xp
    } else {
      nextThreshold = t.xp
      break
    }
  }
  const range = nextThreshold - currentThreshold
  const progress = range > 0 ? Math.min(((currentXp - currentThreshold) / range) * 100, 100) : 100
  return { next: nextThreshold, current: currentThreshold, progress }
}

export function LearnTab() {
  const {
    token,
    learningProfile,
    setLearningProfile,
    learningPairs,
    setLearningPairs,
    availableLessons,
    setAvailableLessons,
    setActiveLesson,
    setActiveExercises,
    setLessonInProgress,
    setShowLearnSetup,
    setShowLearnPairDialog,
    setShowLeaderboard,
  } = useChatLingoStore()

  const [loading, setLoading] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [activeCategory, setActiveCategory] = useState<LessonCategory>('all')

  // Fetch learning profile on mount
  const fetchProfile = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/learn/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLearningProfile(data.profile)
        // Transform pairs from DB format to store format
        const transformedPairs: LearningPairData[] = (data.pairs || []).map(
          (p: {
            id: string
            learnerId: string
            tutorId: string
            iLearn: string
            iTeach: string
            learner: { id: string; name: string; avatar?: string | null; preferredLanguage: string }
            tutor: { id: string; name: string; avatar?: string | null; preferredLanguage: string }
          }) => ({
            id: p.id,
            partner: {
              id: data.profile && p.learnerId === data.profile.userId ? p.tutor.id : p.learner.id,
              name: data.profile && p.learnerId === data.profile.userId ? p.tutor.name : p.learner.name,
              avatar: data.profile && p.learnerId === data.profile.userId ? p.tutor.avatar : p.learner.avatar,
              preferredLanguage:
                data.profile && p.learnerId === data.profile.userId
                  ? p.tutor.preferredLanguage
                  : p.learner.preferredLanguage,
              online: false,
            },
            iLearn: p.iLearn,
            iTeach: p.iTeach,
          })
        )
        setLearningPairs(transformedPairs)

        // Fetch lessons for the target language
        if (data.profile?.targetLanguage) {
          setLoadingLessons(true)
          const lessonsRes = await fetch(
            `/api/learn/lessons?targetLanguage=${encodeURIComponent(data.profile.targetLanguage)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (lessonsRes.ok) {
            const lessonsData = await lessonsRes.json()
            setAvailableLessons(lessonsData.lessons || [])
          }
          setLoadingLessons(false)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, setLearningProfile, setLearningPairs, setAvailableLessons])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleStartLesson = async (lesson: LessonData) => {
    if (!token) return
    try {
      const res = await fetch(`/api/learn/lessons/${lesson.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        // Merge progress into lesson object
        const lessonWithProgress: LessonData = {
          ...lesson,
          progress: data.progress
            ? {
                completed: data.progress.completed,
                score: data.progress.bestScore,
                bestScore: data.progress.bestScore,
                attempts: data.progress.attempts,
              }
            : null,
        }
        setActiveLesson(lessonWithProgress)
        setActiveExercises(data.lesson.exercises || [])
        setLessonInProgress(true)
      }
    } catch {
      // ignore
    }
  }

  // Filter lessons by category
  const filteredLessons =
    activeCategory === 'all'
      ? availableLessons
      : availableLessons.filter((l) => l.category === activeCategory)

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F1F5F9]">
        <div className="bg-[#0F4C5C] px-4 py-3 flex items-center gap-2 wa-shadow-header shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
          <h2 className="text-white font-semibold text-base">Learn</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#A3E635] animate-spin" />
        </div>
      </div>
    )
  }

  // ---- No profile: Welcome screen ----
  if (!learningProfile) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F1F5F9]">
        {/* Header */}
        <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between wa-shadow-header shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            <h2 className="text-white font-semibold text-base">Learn</h2>
          </div>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="text-white/80 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
          >
            <Trophy className="w-5 h-5" />
          </button>
        </div>

        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            {/* Illustration */}
            <div className="relative mx-auto mb-6 w-40 h-40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#A3E635]/20 to-[#0F4C5C]/20 animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#ECFCCB] to-[#ECFCCB] flex items-center justify-center shadow-lg">
                <div className="text-6xl">🌍</div>
              </div>
              {/* Floating emojis */}
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>
                🗣️
              </div>
              <div className="absolute -bottom-1 -left-3 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>
                📚
              </div>
              <div className="absolute top-1 -left-5 text-xl animate-bounce" style={{ animationDelay: '0.6s' }}>
                ✨
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#0A0A0A] mb-2">Start Your Language Journey</h2>
            <p className="text-sm text-[#525252] mb-6 leading-relaxed">
              Learn a new language by practicing with native-speaking friends. Set your learning language to get started!
            </p>

            <button
              onClick={() => setShowLearnSetup(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <GraduationCap className="w-5 h-5" />
              Get Started
            </button>

            <button
              onClick={() => setShowLearnPairDialog(true)}
              className="mt-4 text-sm text-[#0F4C5C] hover:text-[#134E5E] font-medium transition-colors"
            >
              Already set up? <span className="underline">Onboard with a friend</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Main Dashboard (profile exists) ----
  const { next, progress } = getNextLevelThreshold(learningProfile.totalXp)

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F1F5F9]">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between wa-shadow-header shrink-0">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-white" />
          <h2 className="text-white font-semibold text-base">Learn</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="text-white/80 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
          >
            <Trophy className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowLearnSetup(true)}
            className="text-white/80 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile Stats Card */}
        <div className="mx-3 mt-3 bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-sm">
          {/* Stats Row */}
          <div className="grid grid-cols-4 divide-x divide-[#E5E5E5]">
            <div className="px-3 py-3 text-center">
              <div className="text-lg mb-0.5">🔥</div>
              <p className="text-base font-bold text-[#0A0A0A]">{learningProfile.currentStreak}</p>
              <p className="text-[10px] text-[#A3A3A3] mt-0.5">Day Streak</p>
            </div>
            <div className="px-3 py-3 text-center">
              <div className="text-lg mb-0.5">⭐</div>
              <p className="text-base font-bold text-[#0A0A0A]">{learningProfile.totalXp}</p>
              <p className="text-[10px] text-[#A3A3A3] mt-0.5">Total XP</p>
            </div>
            <div className="px-3 py-3 text-center">
              <div className="text-lg mb-0.5">📚</div>
              <p className="text-base font-bold text-[#0A0A0A]">{learningProfile.lessonsCompleted}</p>
              <p className="text-[10px] text-[#A3A3A3] mt-0.5">Completed</p>
            </div>
            <div className="px-3 py-3 text-center">
              <div className="text-lg mb-0.5">🏆</div>
              <p className="text-base font-bold text-[#0A0A0A]">{learningProfile.longestStreak}</p>
              <p className="text-[10px] text-[#A3A3A3] mt-0.5">Best Streak</p>
            </div>
          </div>

          {/* Level + Progress bar */}
          <div className="px-4 py-3 bg-[#F8F9FA] border-t border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#0F4C5C] text-white">
                  {getLevelLabel(learningProfile.level)}
                </span>
                <span className="text-xs text-[#525252]">
                  {getLanguageFlag(learningProfile.targetLanguage)} Learning {learningProfile.targetLanguage}
                </span>
              </div>
              <span className="text-[10px] text-[#A3A3A3]">
                {learningProfile.totalXp} / {next} XP
              </span>
            </div>
            <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#A3E635] to-[#0F4C5C] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Learning Pairs Section */}
        {learningPairs.length > 0 && (
          <div className="mx-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0F4C5C]" />
                Learning Partners
              </h3>
              <button
                onClick={() => setShowLearnPairDialog(true)}
                className="text-xs text-[#0F4C5C] font-semibold hover:text-[#134E5E] transition-colors flex items-center gap-0.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Partner
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {learningPairs.map((pair) => {
                const initials = pair.partner.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <div
                    key={pair.id}
                    className="bg-white rounded-xl p-3 flex items-center gap-3 border border-[#E5E5E5] shadow-sm"
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-[#E5E5E5] text-[#0A0A0A] text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{pair.partner.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#525252]">
                        <span className="flex items-center gap-0.5">
                          I learn: {getLanguageFlag(pair.iLearn)} {pair.iLearn}
                        </span>
                        <span className="text-[#E5E5E5]">|</span>
                        <span className="flex items-center gap-0.5">
                          I teach: {getLanguageFlag(pair.iTeach)} {pair.iTeach}
                        </span>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-medium text-[#0F4C5C] bg-[#ECFCCB] hover:bg-[#ECFCCB] px-3 py-1.5 rounded-full transition-colors shrink-0">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Need a Partner? Prompt (no pairs) */}
        {learningPairs.length === 0 && (
          <div className="mx-3 mt-3">
            <div className="bg-gradient-to-br from-[#ECFCCB] to-[#ECFCCB] rounded-xl p-4 border border-[#A3E635]/20 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-5 h-5 text-[#0F4C5C]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#0A0A0A] mb-0.5">Need a Partner?</h3>
                  <p className="text-xs text-[#525252] mb-2.5 leading-relaxed">
                    Learning is better together! Find a language exchange partner to practice with and help each other improve.
                  </p>
                  <button
                    onClick={() => setShowLearnPairDialog(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] text-xs font-semibold rounded-full transition-all shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Find a Partner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Categories */}
        <div className="mx-3 mt-4 mb-3">
          <h3 className="text-sm font-bold text-[#0A0A0A] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#A3E635]" />
            Lessons
          </h3>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-thin mb-3 pb-1">
            {(['all', 'Vocabulary', 'Phrases', 'Grammar'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as LessonCategory)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#0F4C5C] text-white'
                    : 'bg-white text-[#525252] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                }`}
              >
                {cat !== 'all' && CATEGORY_META[cat]?.icon}
                {cat === 'all' ? 'All' : CATEGORY_META[cat]?.label}
              </button>
            ))}
          </div>

          {/* Lesson Grid */}
          {loadingLessons ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-[#A3E635] animate-spin mx-auto" />
              <p className="text-xs text-[#A3A3A3] mt-2">Loading lessons...</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-[#E5E5E5] mx-auto mb-2" />
              <p className="text-sm text-[#525252]">No lessons available yet</p>
              <p className="text-xs text-[#A3A3A3] mt-1">Lessons for {learningProfile.targetLanguage} will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
              {filteredLessons.map((lesson) => {
                const meta = CATEGORY_META[lesson.category] || CATEGORY_META.Vocabulary
                const levelInfo = getLevelColor(lesson.level)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleStartLesson(lesson)}
                    className="bg-white rounded-xl p-3.5 border border-[#E5E5E5] shadow-sm hover:shadow-md hover:border-[#A3E635]/30 transition-all text-left active:scale-[0.99] group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Category icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border ${
                          meta.color
                        }`}
                      >
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[#0A0A0A] leading-tight group-hover:text-[#0F4C5C] transition-colors line-clamp-2">
                            {lesson.title}
                          </h4>
                          {lesson.progress?.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#A3E635] shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5 group-hover:text-[#0F4C5C] transition-colors" />
                          )}
                        </div>

                        {/* Level badge + Difficulty dots + XP */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${levelInfo.bg} ${levelInfo.text}`}
                          >
                            {getLevelLabel(lesson.level)}
                          </span>

                          {/* Difficulty dots */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((dot) => (
                              <span
                                key={dot}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  dot <= lesson.level ? levelInfo.dot : 'bg-[#E5E5E5]'
                                }`}
                              />
                            ))}
                          </div>

                          <span className="text-[10px] text-[#A3A3A3] flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {lesson.xpReward} XP
                          </span>
                          <span className="text-[10px] text-[#A3A3A3]">
                            {lesson.exercisesCount} exercises
                          </span>
                        </div>

                        {/* Progress bar for in-progress lessons */}
                        {lesson.progress && !lesson.progress.completed && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-[#525252]">Best: {lesson.progress.bestScore}%</span>
                              <span className="text-[10px] text-[#525252]">{lesson.progress.attempts} attempt{lesson.progress.attempts !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  lesson.progress.bestScore >= 80
                                    ? 'bg-[#A3E635]'
                                    : lesson.progress.bestScore >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-400'
                                }`}
                                style={{ width: `${lesson.progress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Completed label */}
                        {lesson.progress?.completed && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-[#A3E635]">Completed</span>
                            <span className="text-[10px] text-[#A3A3A3]">
                              Score: {lesson.progress.bestScore}%
                            </span>
                          </div>
                        )}

                        {/* Description */}
                        {lesson.description && (
                          <p className="text-[11px] text-[#A3A3A3] mt-1 line-clamp-1">{lesson.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom spacing for mobile nav */}
        <div className="h-16 md:hidden" />
      </div>
    </div>
  )
}
