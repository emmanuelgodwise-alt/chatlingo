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

    const { partnerId } = await request.json()

    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 })
    }

    if (partnerId === payload.userId) {
      return NextResponse.json({ error: 'Cannot pair with yourself' }, { status: 400 })
    }

    // Verify partner exists
    const partner = await db.user.findUnique({
      where: { id: partnerId },
      select: { id: true, preferredLanguage: true },
    })
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Get both users' learning profiles
    const myProfile = await db.learningProfile.findUnique({
      where: { userId: payload.userId },
    })
    const partnerProfile = await db.learningProfile.findUnique({
      where: { userId: partnerId },
    })
    if (!myProfile || !partnerProfile) {
      return NextResponse.json(
        { error: 'Both users must have a learning profile to form a pair' },
        { status: 400 }
      )
    }

    // Check if pair already exists
    const existingPair = await db.learningPair.findFirst({
      where: {
        OR: [
          { learnerId: payload.userId, tutorId: partnerId },
          { learnerId: partnerId, tutorId: payload.userId },
        ],
      },
    })
    if (existingPair) {
      return NextResponse.json({ error: 'Learning pair already exists' }, { status: 409 })
    }

    // Create mutual learning pairs:
    // Pair 1: I learn partner's native language (partner is tutor for their language)
    // Pair 2: Partner learns my native language (I am tutor for my language)
    const [pair1, pair2] = await db.$transaction([
      db.learningPair.create({
        data: {
          learnerId: payload.userId,
          tutorId: partnerId,
          learnerLanguage: myProfile.nativeLanguage,
          tutorLanguage: partnerProfile.nativeLanguage,
        },
        include: {
          learner: { select: { id: true, name: true, avatar: true } },
          tutor: { select: { id: true, name: true, avatar: true } },
        },
      }),
      db.learningPair.create({
        data: {
          learnerId: partnerId,
          tutorId: payload.userId,
          learnerLanguage: partnerProfile.nativeLanguage,
          tutorLanguage: myProfile.nativeLanguage,
        },
        include: {
          learner: { select: { id: true, name: true, avatar: true } },
          tutor: { select: { id: true, name: true, avatar: true } },
        },
      }),
    ])

    return NextResponse.json({ pairs: [pair1, pair2] }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
