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

    const rooms = await db.room.findMany({
      where: { isLive: true },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: { select: { participants: true } },
        participants: {
          where: { role: 'speaker' },
          select: { userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      rooms: rooms.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        language: r.language,
        isLive: r.isLive,
        participantCount: r._count.participants,
        speakerCount: r.participants.length,
        owner: r.owner,
        createdAt: r.createdAt,
      })),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

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

    const { name, description, language } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
    }

    if (!language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })

    const room = await db.room.create({
      data: {
        name,
        description: description || null,
        ownerId: payload.userId,
        language,
        isLive: true,
        speakerCount: 1,
      },
    })

    // Owner auto-joins as speaker
    await db.roomParticipant.create({
      data: {
        roomId: room.id,
        userId: payload.userId,
        role: 'speaker',
        language: user?.preferredLanguage || language,
      },
    })

    return NextResponse.json({ room }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
