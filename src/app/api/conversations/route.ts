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

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { participant1Id: payload.userId },
          { participant2Id: payload.userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            avatar: true,
            online: true,
            preferredLanguage: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            avatar: true,
            online: true,
            preferredLanguage: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const formattedConversations = conversations.map((conv) => {
      const isParticipant1 = conv.participant1Id === payload.userId
      const otherUser = isParticipant1 ? conv.participant2 : conv.participant1
      const myLanguage = isParticipant1 ? conv.participant1Lang : conv.participant2Lang
      const theirLanguage = isParticipant1 ? conv.participant2Lang : conv.participant1Lang

      return {
        id: conv.id,
        otherUser,
        myLanguage,
        theirLanguage,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.messages.filter((m: { senderId: string; read: boolean }) => !m.read && m.senderId !== payload.userId).length,
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
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

    const { participant2Id, participant1Lang, participant2Lang } = await request.json()

    if (!participant2Id) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    if (participant2Id === payload.userId) {
      return NextResponse.json(
        { error: 'Cannot start a conversation with yourself' },
        { status: 400 }
      )
    }

    const existingConversation = await db.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: payload.userId,
            participant2Id,
          },
          {
            participant1Id: participant2Id,
            participant2Id: payload.userId,
          },
        ],
      },
    })

    if (existingConversation) {
      return NextResponse.json({
        message: 'Conversation already exists',
        conversation: existingConversation,
      })
    }

    const me = await db.user.findUnique({ where: { id: payload.userId } })
    const them = await db.user.findUnique({ where: { id: participant2Id } })

    const conversation = await db.conversation.create({
      data: {
        participant1Id: payload.userId,
        participant2Id,
        participant1Lang: participant1Lang || me?.preferredLanguage || 'English',
        participant2Lang: participant2Lang || them?.preferredLanguage || 'English',
      },
    })

    return NextResponse.json({
      message: 'Conversation started',
      conversation,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
