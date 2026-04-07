import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export async function PATCH(
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
    const { myLanguage, theirLanguage } = await request.json()

    const conversation = await db.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const isParticipant1 = conversation.participant1Id === payload.userId

    const updateData: Record<string, string> = {}
    if (myLanguage) {
      updateData[isParticipant1 ? 'participant1Lang' : 'participant2Lang'] = myLanguage
    }
    if (theirLanguage) {
      updateData[isParticipant1 ? 'participant2Lang' : 'participant1Lang'] = theirLanguage
    }

    const updated = await db.conversation.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Language preferences updated',
      participant1Lang: updated.participant1Lang,
      participant2Lang: updated.participant2Lang,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
