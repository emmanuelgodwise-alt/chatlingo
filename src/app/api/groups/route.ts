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

    const memberships = await db.groupMember.findMany({
      where: { userId: payload.userId },
      include: {
        group: {
          include: {
            owner: {
              select: { id: true, name: true, avatar: true },
            },
            members: {
              select: { userId: true },
            },
            conversations: {
              include: {
                messages: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const groups = memberships.map((m) => {
      const group = m.group
      const lastMessage = group.conversations[0]?.messages[0] || null
      const unreadCount = 0 // Simplified — would need to track per-member read state

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        owner: group.owner,
        memberCount: group.members.length,
        lastMessage: lastMessage?.content || null,
        lastMessageAt: lastMessage?.createdAt || group.createdAt,
        unreadCount,
        createdAt: group.createdAt,
        userRole: m.role,
        userLanguage: m.language,
      }
    })

    return NextResponse.json({ groups })
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

    const { name, description, memberIds } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one member is required' },
        { status: 400 }
      )
    }

    // Validate all member IDs
    const validMembers = await db.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, preferredLanguage: true },
    })
    const validIds = validMembers.map((m) => m.id)

    if (validIds.length !== memberIds.length) {
      return NextResponse.json(
        { error: 'One or more member IDs are invalid' },
        { status: 400 }
      )
    }

    const owner = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })

    // Create group
    const group = await db.group.create({
      data: {
        name,
        description: description || null,
        ownerId: payload.userId,
      },
    })

    // Create GroupMember records for owner
    await db.groupMember.create({
      data: {
        groupId: group.id,
        userId: payload.userId,
        role: 'admin',
        language: owner?.preferredLanguage || 'English',
      },
    })

    // Create GroupMember records for each member
    for (const member of validMembers) {
      await db.groupMember.create({
        data: {
          groupId: group.id,
          userId: member.id,
          role: 'member',
          language: member.preferredLanguage || 'English',
        },
      })
    }

    // Create a group conversation (use owner + first member as participants for the Conversation model)
    const firstMemberId = validIds[0]
    // Check if a conversation already exists between these two participants
    const existingConv = await db.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: payload.userId, participant2Id: firstMemberId },
          { participant1Id: firstMemberId, participant2Id: payload.userId },
        ],
      },
    })
    if (!existingConv) {
      await db.conversation.create({
        data: {
          participant1Id: payload.userId,
          participant2Id: firstMemberId,
          participant1Lang: owner?.preferredLanguage || 'English',
          participant2Lang: validMembers[0].preferredLanguage || 'English',
          isGroup: true,
          groupId: group.id,
        },
      })
    }

    return NextResponse.json({ group }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
