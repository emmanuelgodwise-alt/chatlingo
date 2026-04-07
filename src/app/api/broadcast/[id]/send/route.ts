import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { translateText } from '@/lib/translate'

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
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Verify ownership of the broadcast list
    const broadcastList = await db.broadcastList.findUnique({
      where: { id },
    })

    if (!broadcastList) {
      return NextResponse.json({ error: 'Broadcast list not found' }, { status: 404 })
    }

    if (broadcastList.ownerId !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the owner can send broadcasts' },
        { status: 403 }
      )
    }

    // Get all members
    const members = await db.broadcastMember.findMany({
      where: { broadcastListId: id },
      include: {
        user: {
          select: { id: true, name: true, preferredLanguage: true },
        },
      },
    })

    const sender = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })
    const senderLang = sender?.preferredLanguage || 'English'

    let sentCount = 0

    for (const member of members) {
      const targetLang = member.language || member.user.preferredLanguage || 'English'

      // Translate message to each member's language
      const translatedContent = await translateText(content, senderLang, targetLang)

      // Find or create a conversation between sender and member
      const existingConversation = await db.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: payload.userId, participant2Id: member.userId },
            { participant1Id: member.userId, participant2Id: payload.userId },
          ],
        },
      })

      let conversationId: string

      if (existingConversation) {
        conversationId = existingConversation.id
      } else {
        const conv = await db.conversation.create({
          data: {
            participant1Id: payload.userId,
            participant2Id: member.userId,
            participant1Lang: senderLang,
            participant2Lang: targetLang,
          },
        })
        conversationId = conv.id
      }

      // Create message
      await db.message.create({
        data: {
          conversationId,
          senderId: payload.userId,
          content,
          translatedContent,
          senderLanguage: senderLang,
          receiverLanguage: targetLang,
          messageType: 'broadcast',
        },
      })

      // Update conversation
      await db.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageAt: new Date(),
        },
      })

      sentCount++
    }

    return NextResponse.json({
      message: `Broadcast sent to ${sentCount} recipients`,
      sentCount,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
