import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

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
    const { role } = await request.json()

    if (!role || !['speaker', 'listener'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be "speaker" or "listener"' },
        { status: 400 }
      )
    }

    const participant = await db.roomParticipant.findUnique({
      where: { roomId_userId: { roomId: id, userId: payload.userId } },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Not in the room' }, { status: 404 })
    }

    const oldRole = participant.role
    const newRole = oldRole === 'speaker' ? 'listener' : role

    // Update role
    const updated = await db.roomParticipant.update({
      where: { id: participant.id },
      data: { role: newRole },
    })

    // Adjust speaker count
    if (oldRole === 'speaker' && newRole === 'listener') {
      await db.room.update({
        where: { id },
        data: { speakerCount: { decrement: 1 } },
      })
    } else if (oldRole === 'listener' && newRole === 'speaker') {
      await db.room.update({
        where: { id },
        data: { speakerCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ participant: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
