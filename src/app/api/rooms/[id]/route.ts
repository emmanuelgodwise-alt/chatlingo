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

    const room = await db.room.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                preferredLanguage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        language: room.language,
        isLive: room.isLive,
        owner: room.owner,
        participantCount: room.participants.length,
        speakers: room.participants.filter((p) => p.role === 'speaker').map((p) => ({
          id: p.id,
          userId: p.user.id,
          name: p.user.name,
          avatar: p.user.avatar,
          language: p.language,
          isMuted: p.isMuted,
        })),
        listeners: room.participants.filter((p) => p.role === 'listener').map((p) => ({
          id: p.id,
          userId: p.user.id,
          name: p.user.name,
          avatar: p.user.avatar,
          language: p.language,
        })),
        participants: room.participants.map((p) => ({
          id: p.id,
          userId: p.user.id,
          name: p.user.name,
          avatar: p.user.avatar,
          role: p.role,
          language: p.language,
          isMuted: p.isMuted,
          joinedAt: p.createdAt,
        })),
        createdAt: room.createdAt,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
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
    const { role, language } = await request.json()

    const room = await db.room.findUnique({ where: { id } })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (!room.isLive) {
      return NextResponse.json({ error: 'Room is not live' }, { status: 400 })
    }

    const existing = await db.roomParticipant.findUnique({
      where: { roomId_userId: { roomId: id, userId: payload.userId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already in the room' }, { status: 409 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })

    const participantRole = role || 'listener'

    const participant = await db.roomParticipant.create({
      data: {
        roomId: id,
        userId: payload.userId,
        role: participantRole,
        language: language || user?.preferredLanguage || room.language,
      },
    })

    // Update speaker count if joining as speaker
    if (participantRole === 'speaker') {
      await db.room.update({
        where: { id },
        data: { speakerCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ participant }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
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

    const room = await db.room.findUnique({ where: { id } })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const participant = await db.roomParticipant.findUnique({
      where: { roomId_userId: { roomId: id, userId: payload.userId } },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Not in the room' }, { status: 404 })
    }

    // Decrement speaker count if leaving as speaker
    if (participant.role === 'speaker') {
      await db.room.update({
        where: { id },
        data: { speakerCount: { decrement: 1 } },
      })
    }

    await db.roomParticipant.delete({
      where: { id: participant.id },
    })

    // If owner left, check if there are still participants
    if (room.ownerId === payload.userId) {
      const remaining = await db.roomParticipant.count({
        where: { roomId: id },
      })
      if (remaining === 0) {
        await db.room.update({
          where: { id },
          data: { isLive: false },
        })
      } else {
        // Transfer ownership to first remaining participant
        const newOwner = await db.roomParticipant.findFirst({
          where: { roomId: id },
        })
        if (newOwner) {
          await db.room.update({
            where: { id },
            data: { ownerId: newOwner.userId },
          })
        }
      }
    }

    return NextResponse.json({ message: 'Left room successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
