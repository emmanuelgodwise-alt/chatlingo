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

    const profile = await db.learningProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Learning profile not found' }, { status: 404 })
    }

    const pairs = await db.learningPair.findMany({
      where: {
        OR: [
          { learnerId: payload.userId },
          { tutorId: payload.userId },
        ],
      },
      include: {
        learner: {
          select: { id: true, name: true, avatar: true, preferredLanguage: true },
        },
        tutor: {
          select: { id: true, name: true, avatar: true, preferredLanguage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ profile, pairs })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
