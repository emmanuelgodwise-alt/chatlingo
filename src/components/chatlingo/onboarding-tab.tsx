'use client'

import { useState } from 'react'
import { useChatLingoStore } from '@/lib/store'
import {
  MessageCircle,
  Camera,
  Phone,
  Globe,
  GraduationCap,
  Lightbulb,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Languages,
  Mic,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const TUTORIAL_STEPS = [
  {
    icon: <MessageCircle className="w-8 h-8" />,
    emoji: '💬',
    title: 'Chats with Invisible Translation',
    description:
      'Send messages in your language and they\'re automatically translated for your friends. They reply in their language — you read it in yours. No copy-pasting, no switching apps.',
    tip: 'Tap any message to see the original text and translation side by side.',
    color: 'from-[#0F4C5C] to-[#134E5E]',
    accentColor: 'bg-[#0F4C5C]',
  },
  {
    icon: <Camera className="w-8 h-8" />,
    emoji: '📸',
    title: 'Status Updates',
    description:
      'Share photos, text, and updates that disappear after 24 hours. View your friends\' statuses and stay connected across languages.',
    tip: 'Create a status in any language — your friends will see it in theirs.',
    color: 'from-[#A3E635] to-[#65A30D]',
    accentColor: 'bg-[#A3E635]',
  },
  {
    icon: <Phone className="w-8 h-8" />,
    emoji: '📞',
    title: 'Voice & Video Calls with Live Subtitles',
    description:
      'Make crystal-clear voice and video calls with real-time translation. See subtitles appear live as you speak — breaking language barriers instantly.',
    tip: 'Enable speech recognition for the best live-subtitle experience during calls.',
    color: 'from-[#0F4C5C] to-[#0F766E]',
    accentColor: 'bg-[#0F766E]',
  },
  {
    icon: <Globe className="w-8 h-8" />,
    emoji: '🌐',
    title: 'Explore & Rooms',
    description:
      'Join live audio rooms, discover public channels, and connect with language learners worldwide. Practice with native speakers in real-time group conversations.',
    tip: 'Join a room as a listener first, then raise your hand to speak when ready.',
    color: 'from-[#134E5E] to-[#0F4C5C]',
    accentColor: 'bg-[#134E5E]',
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    emoji: '📚',
    title: 'Learn Languages Together',
    description:
      'Access structured lessons, track your progress with XP, maintain daily streaks, and pair up with native-speaking friends for language exchange.',
    tip: 'Set up a learning partner to get personalized lesson recommendations.',
    color: 'from-[#A3E635] to-[#84CC16]',
    accentColor: 'bg-[#A3E635]',
  },
]

const TIPS_AND_TRICKS = [
  {
    icon: <Languages className="w-5 h-5" />,
    title: 'Set Your Preferred Language',
    description: 'Go to Profile & Settings to set your preferred language. This ensures all messages are translated correctly for you.',
  },
  {
    icon: <Mic className="w-5 h-5" />,
    title: 'Use Voice Messages',
    description: 'Send voice messages in your language — they\'re transcribed and translated automatically for the recipient.',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Build Your Learning Streak',
    description: 'Complete lessons daily to build your streak. Streaks unlock bonus XP and keep you motivated.',
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: 'Chat to Learn Naturally',
    description: 'Every conversation helps you practice. The more you chat with friends in different languages, the faster you learn.',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Tap Messages for Details',
    description: 'Tap any translated message to see the original text, which is great for language learning reference.',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Join Audio Rooms',
    description: 'Practice speaking in live rooms with subtitles. Listen first, then raise your hand when you\'re ready.',
  },
]

export function OnboardingTab() {
  const { setActiveTab } = useChatLingoStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const toggleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, TUTORIAL_STEPS.length - 1))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0))

  const step = TUTORIAL_STEPS[currentStep]
  const allCompleted = completedSteps.size === TUTORIAL_STEPS.length

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F1F5F9]">
      {/* Header */}
      <div className="bg-[#0F4C5C] px-4 py-3 flex items-center justify-between wa-shadow-header shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#A3E635] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <h2 className="text-white font-semibold text-base">Welcome to ChatLingo</h2>
        </div>
        <button
          onClick={() => setActiveTab('chats')}
          className="text-xs font-semibold text-[#A3E635] hover:text-[#ECFCCB] transition-colors flex items-center gap-1"
        >
          Skip
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Hero Section */}
        <div className="mx-3 mt-3 bg-gradient-to-br from-[#0F4C5C] to-[#134E5E] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#A3E635]/10" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <img src="/chatlingo-icon.png" alt="ChatLingo" className="w-14 h-14 rounded-2xl object-cover shadow-md" />
              <div>
                <h1 className="text-xl font-bold leading-tight">ChatLingo</h1>
                <p className="text-white/70 text-xs">Connect. Translate. Learn.</p>
              </div>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              Break language barriers with real-time translation. Chat with anyone, in any language, and learn along the way.
            </p>

            {/* Quick stats */}
            <div className="mt-4 flex gap-3">
              <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-[#A3E635]">50+</p>
                <p className="text-[10px] text-white/60">Languages</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-[#A3E635]">Live</p>
                <p className="text-[10px] text-white/60">Translation</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-[#A3E635]">Free</p>
                <p className="text-[10px] text-white/60">Forever</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial Steps */}
        <div className="mx-3 mt-4">
          <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-[#A3E635]" />
            How It Works
          </h3>

          {/* Step Navigation */}
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-thin pb-1">
            {TUTORIAL_STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  currentStep === i
                    ? 'bg-[#0F4C5C] text-white shadow-sm'
                    : completedSteps.has(i)
                    ? 'bg-[#ECFCCB] text-[#0F4C5C] border border-[#A3E635]/30'
                    : 'bg-white text-[#525252] border border-[#E5E5E5] hover:border-[#0F4C5C]/30'
                }`}
              >
                {completedSteps.has(i) ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                ) : (
                  <span className="text-sm">{s.emoji}</span>
                )}
                {s.title.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>

          {/* Active Step Card */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
            {/* Step header with gradient */}
            <div className={`bg-gradient-to-r ${step.color} px-4 py-4 text-white relative`}>
              <div className="absolute -top-2 -right-2 text-5xl opacity-20">{step.emoji}</div>
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{step.title}</h4>
                    <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5">
                      {currentStep + 1}/{TUTORIAL_STEPS.length}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>

            {/* Tip section */}
            <div className="px-4 py-3 bg-[#ECFCCB]/50 border-b border-[#E5E5E5]">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#0F4C5C] shrink-0 mt-0.5" />
                <p className="text-xs text-[#0F4C5C] font-medium leading-relaxed">{step.tip}</p>
              </div>
            </div>

            {/* Step navigation buttons */}
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  currentStep === 0
                    ? 'text-[#A3A3A3] cursor-not-allowed'
                    : 'text-[#0F4C5C] hover:text-[#134E5E]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-1.5">
                {TUTORIAL_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-6 bg-[#0F4C5C]'
                        : completedSteps.has(i)
                        ? 'bg-[#A3E635]'
                        : 'bg-[#E5E5E5]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStepComplete(currentStep)}
                  className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                    completedSteps.has(currentStep)
                      ? 'text-[#A3E635]'
                      : 'text-[#525252] hover:text-[#0F4C5C]'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      completedSteps.has(currentStep) ? 'fill-[#A3E635]' : ''
                    }`}
                  />
                  {completedSteps.has(currentStep) ? 'Done' : 'Mark done'}
                </button>
                {currentStep < TUTORIAL_STEPS.length - 1 && (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 text-xs font-medium text-[#0F4C5C] hover:text-[#134E5E] transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-3 mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#525252] font-medium">Tutorial Progress</span>
            <span className="text-xs text-[#A3A3A3]">
              {completedSteps.size}/{TUTORIAL_STEPS.length} completed
            </span>
          </div>
          <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0F4C5C] to-[#A3E635] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedSteps.size / TUTORIAL_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Tips & Tricks Section */}
        <div className="mx-3 mt-5 mb-3">
          <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0F4C5C]" />
            Tips &amp; Tricks
          </h3>

          <div className="space-y-2">
            {TIPS_AND_TRICKS.map((tip, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3.5 border border-[#E5E5E5] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#ECFCCB] flex items-center justify-center text-[#0F4C5C] shrink-0">
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#0A0A0A] mb-0.5">{tip.title}</h4>
                    <p className="text-xs text-[#525252] leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mx-3 mt-5 mb-3">
          <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#0F4C5C]" />
            Feature Highlights
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {[
              { emoji: '🔄', title: 'Auto-Translate', desc: 'Real-time message translation' },
              { emoji: '🎙️', title: 'Live Subtitles', desc: 'During voice & video calls' },
              { emoji: '📱', title: '50+ Languages', desc: 'Supported worldwide' },
              { emoji: '🔒', title: 'End-to-End', desc: 'Secure conversations' },
              { emoji: '👥', title: 'Group Chats', desc: 'Multi-language groups' },
              { emoji: '🎯', title: 'Learning XP', desc: 'Earn while you chat' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3 border border-[#E5E5E5] shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-1.5">{feature.emoji}</div>
                <h4 className="text-xs font-semibold text-[#0A0A0A] mb-0.5">{feature.title}</h4>
                <p className="text-[10px] text-[#525252] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Get Started CTA */}
        <div className="mx-3 mt-5 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F4C5C] to-[#134E5E] flex items-center justify-center mx-auto mb-3 shadow-md">
              {allCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-[#A3E635]" />
              ) : (
                <GraduationCap className="w-8 h-8 text-white" />
              )}
            </div>
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">
              {allCompleted ? 'You\'re Ready!' : 'Ready to Get Started?'}
            </h3>
            <p className="text-xs text-[#525252] mb-4 leading-relaxed max-w-xs mx-auto">
              {allCompleted
                ? 'You\'ve completed the tutorial. Start chatting and learning with friends around the world!'
                : 'Complete the tutorial steps above or dive right in — ChatLingo is intuitive and easy to use.'}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('chats')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0F4C5C] hover:bg-[#134E5E] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                Start Chatting
              </button>
              <button
                onClick={() => setActiveTab('learn')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <GraduationCap className="w-5 h-5" />
                Start Learning
              </button>
            </div>
          </div>
        </div>

        {/* Bottom spacing for mobile nav */}
        <div className="h-16 md:hidden" />
      </div>
    </div>
  )
}
