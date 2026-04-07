import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { lessonId, answers } = await request.json()

    if (!lessonId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'lessonId and answers array are required' },
        { status: 400 }
      )
    }

    // Verify lesson exists and get its exercises
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Build exercise map for quick lookup
    const exerciseMap = new Map(lesson.exercises.map((ex) => [ex.id, ex]))

    // Calculate score
    let correctCount = 0
    let totalXpEarned = 0
    const attemptRecords: Array<{
      exerciseId: string
      userAnswer: string
      isCorrect: boolean
      xpEarned: number
    }> = []

    for (const answer of answers) {
      const exercise = exerciseMap.get(answer.exerciseId)
      if (!exercise) continue

      // Normalize both answers for comparison (case-insensitive, trimmed)
      const normalizedUserAnswer = answer.userAnswer.trim().toLowerCase()
      const normalizedCorrectAnswer = exercise.correctAnswer.trim().toLowerCase()
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer

      if (isCorrect) {
        correctCount++
        totalXpEarned += exercise.xpReward
      }

      attemptRecords.push({
        exerciseId: exercise.id,
        userAnswer: answer.userAnswer,
        isCorrect,
        xpEarned: isCorrect ? exercise.xpReward : 0,
      })
    }

    const totalExercises = lesson.exercises.length
    const score = totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0
    const lessonXpReward = lesson.xpReward
    const lessonCompleted = score >= 70

    // Add lesson XP if completed
    let xpEarned = totalXpEarned
    if (lessonCompleted) {
      xpEarned += lessonXpReward
    }

    // Upsert lesson progress
    const existingProgress = await db.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: payload.userId,
          lessonId,
        },
      },
    })

    const wasAlreadyCompleted = existingProgress?.completed || false

    if (existingProgress) {
      await db.lessonProgress.update({
        where: {
          userId_lessonId: {
            userId: payload.userId,
            lessonId,
          },
        },
        data: {
          score,
          totalExercises,
          bestScore: Math.max(existingProgress.bestScore, score),
          attempts: existingProgress.attempts + 1,
          completed: lessonCompleted || existingProgress.completed,
          completedAt: lessonCompleted && !existingProgress.completed ? new Date() : existingProgress.completedAt,
        },
      })
    } else {
      await db.lessonProgress.create({
        data: {
          userId: payload.userId,
          lessonId,
          completed: lessonCompleted,
          score,
          totalExercises,
          bestScore: score,
          attempts: 1,
          completedAt: lessonCompleted ? new Date() : null,
        },
      })
    }

    // Create exercise attempts
    if (existingProgress) {
      await db.$transaction(
        attemptRecords.map((record) =>
          db.exerciseAttempt.create({
            data: {
              userId: payload.userId,
              exerciseId: record.exerciseId,
              lessonProgressId: existingProgress.id,
              userAnswer: record.userAnswer,
              isCorrect: record.isCorrect,
              xpEarned: record.xpEarned,
            },
          })
        )
      )
    } else {
      // Get the newly created progress
      const newProgress = await db.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: payload.userId,
            lessonId,
          },
        },
      })
      if (newProgress) {
        await db.$transaction(
          attemptRecords.map((record) =>
            db.exerciseAttempt.create({
              data: {
                userId: payload.userId,
                exerciseId: record.exerciseId,
                lessonProgressId: newProgress.id,
                userAnswer: record.userAnswer,
                isCorrect: record.isCorrect,
                xpEarned: record.xpEarned,
              },
            })
          )
        )
      }
    }

    // Update learning profile XP, streak, and lessons completed
    const profile = await db.learningProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (profile) {
      const now = new Date()
      const lastPractice = profile.lastPracticeAt ? new Date(profile.lastPracticeAt) : null

      // Calculate streak
      let newCurrentStreak = profile.currentStreak
      let newLongestStreak = profile.longestStreak

      if (lastPractice) {
        const diffMs = now.getTime() - lastPractice.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          // Consecutive day
          newCurrentStreak += 1
        } else if (diffDays > 1) {
          // Streak broken
          newCurrentStreak = 1
        }
        // diffDays === 0 means same day, keep current streak
      } else {
        newCurrentStreak = 1
      }

      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak)

      const newLessonsCompleted = profile.lessonsCompleted + (lessonCompleted && !wasAlreadyCompleted ? 1 : 0)
      const newTotalXp = profile.totalXp + xpEarned

      // Calculate level based on XP thresholds
      let newLevel = profile.level
      if (newTotalXp >= 500) newLevel = 3
      else if (newTotalXp >= 100) newLevel = 2
      else newLevel = 1

      await db.learningProfile.update({
        where: { userId: payload.userId },
        data: {
          totalXp: newTotalXp,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lessonsCompleted: newLessonsCompleted,
          level: newLevel,
          lastPracticeAt: now,
        },
      })
    }

    return NextResponse.json({
      score,
      totalExercises,
      xpEarned,
      newTotalXp: (profile?.totalXp || 0) + xpEarned,
      lessonCompleted,
      streak: profile ? profile.currentStreak + 1 : 1,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
