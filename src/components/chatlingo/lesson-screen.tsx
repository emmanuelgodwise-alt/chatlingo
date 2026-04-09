'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useChatLingoStore, type ExerciseData } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Lightbulb,
  Check,
  CheckCircle2,
  XCircle,
  Trophy,
  Star,
  Flame,
  RotateCcw,
  ArrowRight,
  PartyPopper,
  Loader2,
  ArrowDownUp,
} from 'lucide-react'
import { speak, stopSpeaking, loadVoices, startRecognition, stopRecognition, getBCP47Code } from '@/lib/speech'

// ============================================
// Main Lesson Screen Component
// ============================================

export function LessonScreen() {
  const {
    token,
    activeLesson,
    activeExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    lessonInProgress,
    setLessonInProgress,
    addExerciseResult,
    resetExerciseResults,
    lessonScore,
    setLessonScore,
    learningProfile,
    setLearningProfile,
    setActiveLesson,
    setShowLessonResult,
    setLastLessonResult,
  } = useChatLingoStore()

  // Local state
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [showHint, setShowHint] = useState(false)
  const [showQuitDialog, setShowQuitDialog] = useState(false)
  const [lessonComplete, setLessonComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Speaking exercise state
  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState<string>('')
  const [speechFeedback, setSpeechFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')

  // Matching exercise state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [wrongMatch, setWrongMatch] = useState<string | null>(null)

  // Listening exercise
  const [hasPlayed, setHasPlayed] = useState(false)

  // XP animation
  const [xpAnim, setXpAnim] = useState(false)

  // Ref for completion data
  const completionDataRef = useRef<{
    score: number
    totalExercises: number
    xpEarned: number
    lessonCompleted: boolean
    newTotalXp: number
    streak: number
  } | null>(null)

  // Voices loaded
  useEffect(() => {
    loadVoices()
  }, [])

  // Current exercise
  const currentExercise = activeExercises[currentExerciseIndex] || null
  const totalExercises = activeExercises.length
  const progress = totalExercises > 0 ? ((currentExerciseIndex) / totalExercises) * 100 : 0

  // Reset local state when exercise changes
  useEffect(() => {
    setSelectedOption(null)
    setFeedbackState('idle')
    setShowHint(false)
    setIsRecording(false)
    setRecognizedText('')
    setSpeechFeedback('idle')
    setSelectedLeft(null)
    setMatchedPairs(new Set())
    setWrongMatch(null)
    setHasPlayed(false)
    stopRecognition()
  }, [currentExerciseIndex])

  // Show idle check if no lesson or not in progress
  if (!activeLesson || !lessonInProgress || !currentExercise) {
    return null
  }

  // ============================================
  // Handlers
  // ============================================

  const handleQuit = () => {
    setLessonInProgress(false)
    resetExerciseResults()
    setActiveLesson(null)
    stopRecognition()
    stopSpeaking()
    setLessonComplete(false)
  }

  const triggerXpAnimation = () => {
    setXpAnim(true)
    setTimeout(() => setXpAnim(false), 800)
  }

  const moveToNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else {
      submitLessonResults()
    }
  }

  const submitLessonResults = async () => {
    if (!token || !activeLesson) return
    setSubmitting(true)

    const store = useChatLingoStore.getState()
    const answers = store.exerciseResults.map((r) => ({
      exerciseId: r.exerciseId,
      userAnswer: r.userAnswer,
    }))

    try {
      const res = await fetch('/api/learn/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId: activeLesson.id,
          answers,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        completionDataRef.current = data

        // Update learning profile with new data
        if (learningProfile) {
          setLearningProfile({
            ...learningProfile,
            totalXp: data.newTotalXp,
            currentStreak: data.streak,
            lessonsCompleted: learningProfile.lessonsCompleted + (data.lessonCompleted ? 1 : 0),
            level: data.newTotalXp >= 500 ? 3 : data.newTotalXp >= 100 ? 2 : learningProfile.level,
            lastPracticeAt: new Date().toISOString(),
          })
        }

        // Set result for result dialog
        setLastLessonResult({
          score: data.score,
          totalExercises: data.totalExercises,
          xpEarned: data.xpEarned,
          lessonCompleted: data.lessonCompleted,
        })
        setShowLessonResult(true)

        setLessonComplete(true)
      }
    } catch {
      // Fallback: still show completion with local data
      const store2 = useChatLingoStore.getState()
      const localScore = store2.lessonScore
      completionDataRef.current = {
        score: Math.round((localScore / totalExercises) * 100),
        totalExercises,
        xpEarned: localScore * 5,
        lessonCompleted: localScore >= totalExercises * 0.7,
        newTotalXp: (learningProfile?.totalXp || 0) + localScore * 5,
        streak: (learningProfile?.currentStreak || 0) + 1,
      }
      setLessonComplete(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTryAgain = () => {
    setLessonComplete(false)
    completionDataRef.current = null
    resetExerciseResults()
    setCurrentExerciseIndex(0)
    setSubmitting(false)
  }

  const handleCheck = () => {
    if (!currentExercise) return

    const exercise = currentExercise

    if (exercise.type === 'speaking') {
      // Speaking exercise handled separately
      return
    }

    if (exercise.type === 'matching') {
      // Matching exercise handled separately
      return
    }

    if (!selectedOption) return

    const isCorrect = selectedOption === exercise.correctAnswer
    addExerciseResult(exercise.id, selectedOption, isCorrect)

    setFeedbackState(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) triggerXpAnimation()

    // Auto-advance after delay
    setTimeout(() => {
      moveToNextExercise()
    }, isCorrect ? 1000 : 1500)
  }

  const handleOptionSelect = (option: string) => {
    if (feedbackState !== 'idle') return
    setSelectedOption(option)
  }

  // ============================================
  // Speaking Exercise Handler
  // ============================================

  const handleStartRecording = () => {
    if (!activeLesson) return

    const targetLang = activeLesson.targetLanguage
    setIsRecording(true)
    setRecognizedText('')
    setSpeechFeedback('idle')

    startRecognition(targetLang, (text, isFinal) => {
      setRecognizedText(text)
      if (isFinal && text.trim()) {
        setIsRecording(false)
        stopRecognition()

        const isCorrect = text.trim().toLowerCase() === currentExercise?.correctAnswer.toLowerCase()
        setSpeechFeedback(isCorrect ? 'correct' : 'wrong')
        addExerciseResult(currentExercise.id, text.trim(), isCorrect)
        if (isCorrect) triggerXpAnimation()

        setTimeout(() => {
          moveToNextExercise()
        }, isCorrect ? 1200 : 1800)
      }
    })
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    stopRecognition()
  }

  // ============================================
  // Matching Exercise Handler
  // ============================================

  const handleMatchingSelect = (side: 'left' | 'right', value: string) => {
    if (feedbackState !== 'idle') return
    if (!currentExercise) return

    if (side === 'left') {
      setSelectedLeft(value)
      setWrongMatch(null)
    } else if (side === 'right' && selectedLeft) {
      // Check if this pair is correct
      const pairs = parseMatchingPairs(currentExercise.correctAnswer)
      const correctTranslation = pairs.get(selectedLeft)
      const isCorrect = correctTranslation === value

      if (isCorrect) {
        const matchKey = `${selectedLeft}:${value}`
        setMatchedPairs((prev) => {
          const next = new Set(prev)
          next.add(matchKey)
          return next
        })
        setSelectedLeft(null)

        // Check if all matched
        if (matchedPairs.size + 1 >= pairs.size) {
          // All matched - record result
          addExerciseResult(currentExercise.id, Array.from(matchedPairs).join(',') + `,${selectedLeft}:${value}`, true)
          triggerXpAnimation()
          setTimeout(() => moveToNextExercise(), 800)
        }
      } else {
        setWrongMatch(value)
        setTimeout(() => {
          setWrongMatch(null)
          setSelectedLeft(null)
        }, 600)
      }
    }
  }

  // ============================================
  // Helper Functions
  // ============================================

  function playListeningAudio(text: string, language: string) {
    speak(text, language)
    setHasPlayed(true)
  }

  // ============================================
  // Render - Lesson Complete Screen
  // ============================================

  if (lessonComplete && completionDataRef.current) {
    const data = completionDataRef.current
    const perfectScore = data.score === 100
    const passedScore = data.lessonCompleted

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F9] p-6 animate-fadeIn">
        {/* Confetti / Celebration */}
        <div className="text-6xl mb-4">{perfectScore ? '🏆' : passedScore ? '🎉' : '💪'}</div>
        <PartyPopper className="w-10 h-10 text-[#A3E635] mb-2" />

        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-1">
          {perfectScore ? 'Perfect Score!' : passedScore ? 'Well Done!' : 'Keep Practicing!'}
        </h1>
        <p className="text-[#525252] text-sm mb-6">
          {activeLesson.title}
        </p>

        {/* Score Card */}
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-sm border border-[#E5E5E5] mb-4">
          {/* Score */}
          <div className="text-center mb-4">
            <div className={`text-5xl font-bold mb-1 ${data.score >= 70 ? 'text-[#A3E635]' : 'text-[#FF6B6B]'}`}>
              {data.score}%
            </div>
            <p className="text-[#525252] text-sm">
              You got {lessonScore} out of {data.totalExercises} correct!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-[#F1F5F9] rounded-xl p-3">
              <Star className="w-5 h-5 text-[#FFB800] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#0A0A0A]">+{data.xpEarned}</div>
              <div className="text-[10px] text-[#525252]">XP Earned</div>
            </div>
            <div className="text-center bg-[#F1F5F9] rounded-xl p-3">
              <Flame className="w-5 h-5 text-[#A3E635] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#0A0A0A]">{data.streak}</div>
              <div className="text-[10px] text-[#525252]">Day Streak</div>
            </div>
            <div className="text-center bg-[#F1F5F9] rounded-xl p-3">
              <Trophy className="w-5 h-5 text-[#A3E635] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#0A0A0A]">{data.newTotalXp}</div>
              <div className="text-[10px] text-[#525252]">Total XP</div>
            </div>
          </div>

          {/* Completion Badge */}
          {passedScore && (
            <div className="mt-4 flex items-center justify-center gap-2 bg-[#ECFCCB] rounded-xl py-2.5 px-4">
              <CheckCircle2 className="w-5 h-5 text-[#A3E635]" />
              <span className="text-sm font-semibold text-[#0F4C5C]">Lesson Completed!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-2">
          <Button
            onClick={handleQuit}
            className="w-full h-12 rounded-xl bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] font-semibold text-base"
          >
            Continue
          </Button>
          <Button
            onClick={handleTryAgain}
            variant="outline"
            className="w-full h-12 rounded-xl border-[#E5E5E5] text-[#0F4C5C] font-semibold text-base hover:bg-[#F1F5F9]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // ============================================
  // Render - Submitting State
  // ============================================

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F9]">
        <Loader2 className="w-10 h-10 text-[#A3E635] animate-spin mb-4" />
        <p className="text-[#525252] text-sm">Submitting your results...</p>
      </div>
    )
  }

  // ============================================
  // Render - Main Lesson UI
  // ============================================

  const exercise = currentExercise
  const isOptionDisabled = feedbackState !== 'idle'

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F9]">
      {/* ========== PROGRESS BAR ========== */}
      <div className="bg-white shrink-0 wa-shadow-sm">
        <div className="flex items-center px-4 py-3 gap-3">
          {/* Quit Button */}
          <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
            <AlertDialogTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] transition-colors">
                <X className="w-5 h-5 text-[#525252]" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Quit Lesson?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress in this lesson will be lost. Are you sure you want to quit?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Keep Learning</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleQuit}
                  className="bg-[#FF6B6B] hover:bg-[#EF4444] text-white rounded-xl"
                >
                  Quit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Progress Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[#525252]">
                {currentExerciseIndex + 1} / {totalExercises} exercises
              </span>
              <span className="text-xs text-[#A3E635] font-semibold">
                {lessonScore} correct
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A3E635] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Lesson Title Pill */}
          <div className="hidden sm:block bg-[#ECFCCB] rounded-full px-3 py-1">
            <span className="text-[10px] font-semibold text-[#0F4C5C] whitespace-nowrap">
              {activeLesson.category}
            </span>
          </div>
        </div>
      </div>

      {/* ========== EXERCISE AREA ========== */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 overflow-y-auto scrollbar-thin">
        {/* XP Animation */}
        {xpAnim && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideUp pointer-events-none">
            <div className="bg-[#A3E635] text-[#0A0A0A] px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              +{exercise.xpReward} XP
            </div>
          </div>
        )}

        {/* Exercise Type Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            exercise.type === 'translation' ? 'bg-blue-50 text-blue-700' :
            exercise.type === 'fill_blank' ? 'bg-purple-50 text-purple-700' :
            exercise.type === 'listening' ? 'bg-orange-50 text-orange-700' :
            exercise.type === 'matching' ? 'bg-amber-50 text-amber-700' :
            'bg-rose-50 text-rose-700'
          }`}>
            {exercise.type === 'translation' && '🌐'}
            {exercise.type === 'fill_blank' && '✏️'}
            {exercise.type === 'listening' && '🔊'}
            {exercise.type === 'matching' && '🔗'}
            {exercise.type === 'speaking' && '🗣️'}
            {exercise.type === 'translation' && 'Translation'}
            {exercise.type === 'fill_blank' && 'Fill in the Blank'}
            {exercise.type === 'listening' && 'Listening'}
            {exercise.type === 'matching' && 'Matching'}
            {exercise.type === 'speaking' && 'Speaking'}
          </span>
        </div>

        {/* ===== TRANSLATION EXERCISE ===== */}
        {exercise.type === 'translation' && (
          <TranslationExercise
            exercise={exercise}
            nativeLanguage={activeLesson.nativeLanguage}
            targetLanguage={activeLesson.targetLanguage}
            selectedOption={selectedOption}
            feedbackState={feedbackState}
            showHint={showHint}
            onOptionSelect={handleOptionSelect}
            onToggleHint={() => setShowHint(!showHint)}
          />
        )}

        {/* ===== FILL IN THE BLANK EXERCISE ===== */}
        {exercise.type === 'fill_blank' && (
          <FillBlankExercise
            exercise={exercise}
            selectedOption={selectedOption}
            feedbackState={feedbackState}
            showHint={showHint}
            onOptionSelect={handleOptionSelect}
            onToggleHint={() => setShowHint(!showHint)}
          />
        )}

        {/* ===== LISTENING EXERCISE ===== */}
        {exercise.type === 'listening' && (
          <ListeningExercise
            exercise={exercise}
            nativeLanguage={activeLesson.nativeLanguage}
            targetLanguage={activeLesson.targetLanguage}
            selectedOption={selectedOption}
            feedbackState={feedbackState}
            hasPlayed={hasPlayed}
            onPlay={() => playListeningAudio(exercise.question, activeLesson.targetLanguage)}
            onOptionSelect={handleOptionSelect}
          />
        )}

        {/* ===== MATCHING EXERCISE ===== */}
        {exercise.type === 'matching' && (
          <MatchingExercise
            exercise={exercise}
            selectedLeft={selectedLeft}
            matchedPairs={matchedPairs}
            wrongMatch={wrongMatch}
            feedbackState={feedbackState}
            onSideSelect={handleMatchingSelect}
          />
        )}

        {/* ===== SPEAKING EXERCISE ===== */}
        {exercise.type === 'speaking' && (
          <SpeakingExercise
            exercise={exercise}
            targetLanguage={activeLesson.targetLanguage}
            isRecording={isRecording}
            recognizedText={recognizedText}
            speechFeedback={speechFeedback}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPlayPronunciation={() => speak(exercise.question, activeLesson.targetLanguage)}
          />
        )}
      </div>

      {/* ========== BOTTOM BAR ========== */}
      <div className="bg-white border-t border-[#E5E5E5] px-4 py-3 shrink-0 safe-area-bottom">
        {/* Hint Button for non-matching, non-speaking exercises */}
        {exercise.type !== 'matching' && exercise.type !== 'speaking' && exercise.hint && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="w-full flex items-center justify-center gap-2 py-2 mb-2 text-[#525252] hover:text-[#0F4C5C] transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">Show Hint</span>
          </button>
        )}

        {/* Check / Continue Button */}
        {exercise.type === 'matching' ? (
          <div className="text-center py-2">
            <p className="text-sm text-[#525252]">
              Tap a word, then tap its translation
            </p>
          </div>
        ) : exercise.type === 'speaking' ? (
          speechFeedback === 'idle' && !isRecording ? (
            <Button
              onClick={handleStartRecording}
              className="w-full h-12 rounded-xl bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A] font-semibold text-base"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Speaking
            </Button>
          ) : isRecording ? (
            <Button
              onClick={handleStopRecording}
              className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-base animate-pulse"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-[#525252]">Moving to next exercise...</p>
            </div>
          )
        ) : (
          <Button
            onClick={handleCheck}
            disabled={!selectedOption || isOptionDisabled}
            className="w-full h-12 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#A3E635] hover:bg-[#65A30D] text-[#0A0A0A]"
          >
            Check
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================
// Translation Exercise Sub-Component
// ============================================

function TranslationExercise({
  exercise,
  nativeLanguage,
  targetLanguage,
  selectedOption,
  feedbackState,
  showHint,
  onOptionSelect,
  onToggleHint,
}: {
  exercise: ExerciseData
  nativeLanguage: string
  targetLanguage: string
  selectedOption: string | null
  feedbackState: 'idle' | 'correct' | 'wrong'
  showHint: boolean
  onOptionSelect: (option: string) => void
  onToggleHint: () => void
}) {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Instruction */}
      <p className="text-center text-sm font-medium text-[#525252]">
        Translate this to {nativeLanguage}
      </p>

      {/* Word/Phrase Display */}
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E5E5E5]">
        <p className="text-2xl font-bold text-[#0A0A0A] mb-1">{exercise.question}</p>
        <p className="text-xs text-[#525252]">{targetLanguage}</p>
      </div>

      {/* Hint */}
      {showHint && exercise.hint && (
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-3 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
          <p className="text-sm text-[#8B6914]">{exercise.hint}</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {exercise.options.map((option) => {
          const isSelected = selectedOption === option
          const isCorrect = option === exercise.correctAnswer
          const showCorrect = feedbackState !== 'idle' && isCorrect
          const showWrong = feedbackState === 'wrong' && isSelected

          return (
            <button
              key={option}
              onClick={() => onOptionSelect(option)}
              disabled={feedbackState !== 'idle'}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                showCorrect
                  ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0F4C5C]'
                  : showWrong
                  ? 'border-[#FF6B6B] bg-[#FEE2E2] text-[#991B1B] animate-[shake_0.4s_ease-in-out]'
                  : isSelected
                  ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0A0A0A]'
                  : 'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:border-[#A3E635]/50 hover:bg-[#F1F5F9]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                showCorrect
                  ? 'bg-[#A3E635] text-[#0A0A0A]'
                  : showWrong
                  ? 'bg-[#FF6B6B] text-white'
                  : isSelected
                  ? 'bg-[#A3E635]/20 text-[#A3E635]'
                  : 'bg-[#F1F5F9] text-[#525252]'
              }`}>
                {showCorrect ? <Check className="w-4 h-4" /> : showWrong ? <X className="w-4 h-4" /> : ''}
              </div>
              <span className="text-base font-medium">{option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Fill-in-the-Blank Exercise Sub-Component
// ============================================

function FillBlankExercise({
  exercise,
  selectedOption,
  feedbackState,
  showHint,
  onOptionSelect,
  onToggleHint,
}: {
  exercise: ExerciseData
  selectedOption: string | null
  feedbackState: 'idle' | 'correct' | 'wrong'
  showHint: boolean
  onOptionSelect: (option: string) => void
  onToggleHint: () => void
}) {
  // Replace ___ with a styled blank indicator
  const displaySentence = exercise.question.replace('___', '\u00AD\u00AD\u00AD\u00AD\u00AD')

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Instruction */}
      <p className="text-center text-sm font-medium text-[#525252]">
        Fill in the blank
      </p>

      {/* Sentence with Blank */}
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E5E5E5]">
        <p className="text-xl font-semibold text-[#0A0A0A] leading-relaxed">
          {displaySentence.split('\u00AD\u00AD\u00AD\u00AD\u00AD').map((part, idx, arr) => (
            <span key={idx}>
              {part}
              {idx < arr.length - 1 && (
                <span className={`inline-block min-w-[80px] border-b-2 mx-1 transition-colors ${
                  selectedOption ? 'border-[#A3E635]' : 'border-[#525252]'
                }`}>
                  {feedbackState !== 'idle' && (
                    <span className={`text-sm font-bold ${
                      feedbackState === 'correct' ? 'text-[#A3E635]' : 'text-[#FF6B6B]'
                    }`}>
                      {selectedOption}
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Hint */}
      {showHint && exercise.hint && (
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-3 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
          <p className="text-sm text-[#8B6914]">{exercise.hint}</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {exercise.options.map((option) => {
          const isSelected = selectedOption === option
          const isCorrect = option === exercise.correctAnswer
          const showCorrect = feedbackState !== 'idle' && isCorrect
          const showWrong = feedbackState === 'wrong' && isSelected

          return (
            <button
              key={option}
              onClick={() => onOptionSelect(option)}
              disabled={feedbackState !== 'idle'}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                showCorrect
                  ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0F4C5C]'
                  : showWrong
                  ? 'border-[#FF6B6B] bg-[#FEE2E2] text-[#991B1B] animate-[shake_0.4s_ease-in-out]'
                  : isSelected
                  ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0A0A0A]'
                  : 'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:border-[#A3E635]/50 hover:bg-[#F1F5F9]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                showCorrect
                  ? 'bg-[#A3E635] text-[#0A0A0A]'
                  : showWrong
                  ? 'bg-[#FF6B6B] text-white'
                  : isSelected
                  ? 'bg-[#A3E635]/20 text-[#A3E635]'
                  : 'bg-[#F1F5F9] text-[#525252]'
              }`}>
                {showCorrect ? <Check className="w-4 h-4" /> : showWrong ? <X className="w-4 h-4" /> : ''}
              </div>
              <span className="text-base font-medium">{option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Listening Exercise Sub-Component
// ============================================

function ListeningExercise({
  exercise,
  nativeLanguage,
  targetLanguage,
  selectedOption,
  feedbackState,
  hasPlayed,
  onPlay,
  onOptionSelect,
}: {
  exercise: ExerciseData
  nativeLanguage: string
  targetLanguage: string
  selectedOption: string | null
  feedbackState: 'idle' | 'correct' | 'wrong'
  hasPlayed: boolean
  onPlay: () => void
  onOptionSelect: (option: string) => void
}) {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Instruction */}
      <p className="text-center text-sm font-medium text-[#525252]">
        Listen and choose the correct translation
      </p>

      {/* Speaker Button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onPlay}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            hasPlayed
              ? 'bg-[#A3E635] hover:bg-[#65A30D] hover:scale-105'
              : 'bg-[#0F4C5C] hover:bg-[#134E5E] hover:scale-105 animate-pulse'
          }`}
        >
          <Volume2 className="w-9 h-9 text-[#0A0A0A]" />
        </button>
        <p className="text-xs text-[#525252]">
          {hasPlayed ? 'Tap to replay' : 'Tap to listen'} · {targetLanguage}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {exercise.options.map((option) => {
          const isSelected = selectedOption === option
          const isCorrect = option === exercise.correctAnswer
          const showCorrect = feedbackState !== 'idle' && isCorrect
          const showWrong = feedbackState === 'wrong' && isSelected

          return (
            <button
              key={option}
              onClick={() => onOptionSelect(option)}
              disabled={feedbackState !== 'idle'}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                showCorrect
                  ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0F4C5C]'
                  : showWrong
                  ? 'border-[#FF6B6B] bg-[#FEE2E2] text-[#991B1B] animate-[shake_0.4s_ease-in-out]'
                  : isSelected
                  ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0A0A0A]'
                  : 'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:border-[#A3E635]/50 hover:bg-[#F1F5F9]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                showCorrect
                  ? 'bg-[#A3E635] text-[#0A0A0A]'
                  : showWrong
                  ? 'bg-[#FF6B6B] text-white'
                  : isSelected
                  ? 'bg-[#A3E635]/20 text-[#A3E635]'
                  : 'bg-[#F1F5F9] text-[#525252]'
              }`}>
                {showCorrect ? <Check className="w-4 h-4" /> : showWrong ? <X className="w-4 h-4" /> : ''}
              </div>
              <span className="text-base font-medium">{option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Shared Utility - shuffleArray
// ============================================

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ============================================
// Matching Exercise Sub-Component
// ============================================

function MatchingExercise({
  exercise,
  selectedLeft,
  matchedPairs,
  wrongMatch,
  feedbackState,
  onSideSelect,
}: {
  exercise: ExerciseData
  selectedLeft: string | null
  matchedPairs: Set<string>
  wrongMatch: string | null
  feedbackState: 'idle' | 'correct' | 'wrong'
  onSideSelect: (side: 'left' | 'right', value: string) => void
}) {
  const pairs = parseMatchingPairs(exercise.correctAnswer)
  const leftWords = Array.from(pairs.keys())
  const rightWords = shuffleArray(Array.from(pairs.values()))

  // Check if a word is already matched
  const isWordMatched = (word: string) => {
    for (const pair of matchedPairs) {
      if (pair.startsWith(`${word}:`) || pair.endsWith(`:${word}`)) return true
    }
    return false
  }

  // Check if a specific match exists
  const isSpecificMatch = (left: string, right: string) => {
    return matchedPairs.has(`${left}:${right}`)
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Instruction */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-[#525252]">
          Match the words with their translations
        </p>
        <p className="text-xs text-[#A3A3A3]">
          {matchedPairs.size} / {pairs.size} matched
        </p>
      </div>

      {/* Matching Progress Bar */}
      <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#A3E635] rounded-full transition-all duration-300"
          style={{ width: `${(matchedPairs.size / pairs.size) * 100}%` }}
        />
      </div>

      {/* Matching Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-1 text-center">
            {exercise.question || 'Words'}
          </p>
          {leftWords.map((word) => {
            const matched = isWordMatched(word)
            const selected = selectedLeft === word
            return (
              <button
                key={word}
                onClick={() => !matched && feedbackState === 'idle' && onSideSelect('left', word)}
                disabled={matched || feedbackState !== 'idle'}
                className={`w-full px-4 py-3 rounded-xl border-2 text-center transition-all duration-200 text-sm font-medium ${
                  matched
                    ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0F4C5C] opacity-60'
                    : selected
                    ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0A0A0A] shadow-sm'
                    : 'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:border-[#A3E635]/50'
                }`}
              >
                {matched && <Check className="w-3 h-3 inline mr-1 text-[#A3E635]" />}
                {word}
              </button>
            )
          })}
        </div>

        {/* Arrow Divider */}
        <div className="col-span-2 flex justify-center -my-2">
          <ArrowDownUp className="w-5 h-5 text-[#E5E5E5] -rotate-90" />
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-1 text-center">
            Translations
          </p>
          {rightWords.map((word) => {
            const matched = isWordMatched(word)
            const isWrong = wrongMatch === word
            return (
              <button
                key={word}
                onClick={() => !matched && selectedLeft && feedbackState === 'idle' && onSideSelect('right', word)}
                disabled={matched || !selectedLeft || feedbackState !== 'idle'}
                className={`w-full px-4 py-3 rounded-xl border-2 text-center transition-all duration-200 text-sm font-medium ${
                  isWrong
                    ? 'border-[#FF6B6B] bg-[#FEE2E2] text-[#991B1B] animate-[shake_0.4s_ease-in-out]'
                    : matched
                    ? 'border-[#A3E635] bg-[#ECFCCB] text-[#0F4C5C] opacity-60'
                    : selectedLeft
                    ? 'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:border-[#A3E635]/50'
                    : 'border-[#E5E5E5] bg-[#F1F5F9] text-[#A3A3A3] cursor-not-allowed'
                }`}
              >
                {matched && <Check className="w-3 h-3 inline mr-1 text-[#A3E635]" />}
                {word}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Speaking Exercise Sub-Component
// ============================================

function SpeakingExercise({
  exercise,
  targetLanguage,
  isRecording,
  recognizedText,
  speechFeedback,
  onStartRecording,
  onStopRecording,
  onPlayPronunciation,
}: {
  exercise: ExerciseData
  targetLanguage: string
  isRecording: boolean
  recognizedText: string
  speechFeedback: 'idle' | 'correct' | 'wrong'
  onStartRecording: () => void
  onStopRecording: () => void
  onPlayPronunciation: () => void
}) {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Instruction */}
      <p className="text-center text-sm font-medium text-[#525252]">
        Say this in <span className="font-semibold text-[#0A0A0A]">{targetLanguage}</span>
      </p>

      {/* Word/Phrase to Pronounce */}
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#E5E5E5]">
        <p className="text-2xl font-bold text-[#0A0A0A] mb-2">{exercise.question}</p>
        <button
          onClick={onPlayPronunciation}
          className="inline-flex items-center gap-1.5 text-[#A3E635] hover:text-[#65A30D] transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-xs font-medium">Listen to pronunciation</span>
        </button>
      </div>

      {/* Microphone Area */}
      <div className="flex flex-col items-center gap-4">
        {/* Mic Button */}
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
              : speechFeedback === 'correct'
              ? 'bg-[#A3E635] scale-110'
              : speechFeedback === 'wrong'
              ? 'bg-[#FF6B6B] scale-110'
              : 'bg-[#0F4C5C] hover:bg-[#134E5E] hover:scale-105'
          }`}
        >
          {isRecording ? (
            <div className="relative">
              <MicOff className="w-9 h-9 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
            </div>
          ) : speechFeedback === 'correct' ? (
            <CheckCircle2 className="w-9 h-9 text-[#0A0A0A]" />
          ) : speechFeedback === 'wrong' ? (
            <XCircle className="w-9 h-9 text-white" />
          ) : (
            <Mic className="w-9 h-9 text-white" />
          )}
        </button>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-500">Listening...</span>
          </div>
        )}

        {/* Recognized Text */}
        {(recognizedText || speechFeedback !== 'idle') && (
          <div className={`w-full rounded-xl p-4 text-center transition-all ${
            speechFeedback === 'correct'
              ? 'bg-[#ECFCCB] border-2 border-[#A3E635]'
              : speechFeedback === 'wrong'
              ? 'bg-[#FEE2E2] border-2 border-[#FF6B6B]'
              : 'bg-[#F1F5F9] border-2 border-transparent'
          }`}>
            <p className="text-xs text-[#525252] mb-1">You said:</p>
            <p className="text-base font-medium text-[#0A0A0A]">{recognizedText || '—'}</p>
            {speechFeedback === 'correct' && (
              <p className="text-xs font-semibold text-[#A3E635] mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Correct!
              </p>
            )}
            {speechFeedback === 'wrong' && (
              <div className="mt-1">
                <p className="text-xs font-semibold text-[#FF6B6B] flex items-center justify-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Not quite right
                </p>
                <p className="text-xs text-[#525252] mt-0.5">
                  Correct answer: <span className="font-semibold text-[#0A0A0A]">{exercise.correctAnswer}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Shared Utility
// ============================================

function parseMatchingPairs(correctAnswer: string): Map<string, string> {
  const pairs = new Map<string, string>()
  const parts = correctAnswer.split(',')
  for (const part of parts) {
    const [word, trans] = part.split(':')
    if (word && trans) {
      pairs.set(word.trim(), trans.trim())
    }
  }
  return pairs
}
