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

    const { targetLanguage, nativeLanguage } = await request.json()

    if (!targetLanguage || !nativeLanguage) {
      return NextResponse.json(
        { error: 'targetLanguage and nativeLanguage are required' },
        { status: 400 }
      )
    }

    const profile = await db.learningProfile.upsert({
      where: { userId: payload.userId },
      update: {
        targetLanguage,
        nativeLanguage,
      },
      create: {
        userId: payload.userId,
        targetLanguage,
        nativeLanguage,
      },
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
