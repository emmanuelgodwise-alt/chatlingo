import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Get user's progress for this lesson
    const progress = await db.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: payload.userId,
          lessonId: id,
        },
      },
    })

    const formattedExercises = lesson.exercises.map((ex) => ({
      id: ex.id,
      type: ex.type,
      question: ex.question,
      correctAnswer: ex.correctAnswer,
      options: JSON.parse(ex.options || '[]'),
      hint: ex.hint,
      audioUrl: ex.audioUrl,
      orderIndex: ex.orderIndex,
      xpReward: ex.xpReward,
    }))

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        category: lesson.category,
        targetLanguage: lesson.targetLanguage,
        nativeLanguage: lesson.nativeLanguage,
        level: lesson.level,
        orderIndex: lesson.orderIndex,
        xpReward: lesson.xpReward,
        exercises: formattedExercises,
      },
      progress,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
