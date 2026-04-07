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

    const lists = await db.broadcastList.findMany({
      where: { ownerId: payload.userId },
      include: {
        members: {
          include: {
            broadcastList: false,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get member details separately
    const formattedLists = await Promise.all(
      lists.map(async (list) => {
        const memberRecords = await db.broadcastMember.findMany({
          where: { broadcastListId: list.id },
          include: {
            user: {
              select: { id: true, name: true, avatar: true, preferredLanguage: true },
            },
          },
        })

        return {
          id: list.id,
          name: list.name,
          memberCount: memberRecords.length,
          members: memberRecords.map((m) => ({
            id: m.id,
            userId: m.userId,
            name: m.user.name,
            avatar: m.user.avatar,
            language: m.language,
          })),
          createdAt: list.createdAt,
        }
      })
    )

    return NextResponse.json({ broadcastLists: formattedLists })
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

    const { name, memberIds } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'List name is required' }, { status: 400 })
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one member is required' },
        { status: 400 }
      )
    }

    // Validate member IDs
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

    const broadcastList = await db.broadcastList.create({
      data: {
        name,
        ownerId: payload.userId,
      },
    })

    // Create broadcast member records
    for (const member of validMembers) {
      await db.broadcastMember.create({
        data: {
          broadcastListId: broadcastList.id,
          userId: member.id,
          language: member.preferredLanguage || 'English',
        },
      })
    }

    return NextResponse.json({ broadcastList }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
