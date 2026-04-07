import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetLanguage = searchParams.get('targetLanguage')
    const level = searchParams.get('level')

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'targetLanguage query parameter is required' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {
      targetLanguage,
      isPublished: true,
    }

    if (level) {
      where.level = parseInt(level, 10)
    }

    const lessons = await db.lesson.findMany({
      where,
      include: {
        _count: {
          select: { exercises: true },
        },
      },
      orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
    })

    const formattedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      targetLanguage: lesson.targetLanguage,
      nativeLanguage: lesson.nativeLanguage,
      level: lesson.level,
      orderIndex: lesson.orderIndex,
      xpReward: lesson.xpReward,
      exercisesCount: lesson._count.exercises,
      createdAt: lesson.createdAt,
    }))

    return NextResponse.json({ lessons: formattedLessons })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
