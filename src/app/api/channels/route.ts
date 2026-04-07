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

    // Get channels user is a member of
    const memberships = await db.channelMember.findMany({
      where: { userId: payload.userId },
      include: {
        channel: {
          include: {
            owner: {
              select: { id: true, name: true, avatar: true },
            },
            _count: { select: { members: true, posts: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const joinedChannels = memberships.map((m) => ({
      id: m.channel.id,
      name: m.channel.name,
      description: m.channel.description,
      avatar: m.channel.avatar,
      language: m.channel.language,
      isPublic: m.channel.isPublic,
      memberCount: m.channel._count.members,
      postCount: m.channel._count.posts,
      owner: m.channel.owner,
      userLanguage: m.language,
      joinedAt: m.createdAt,
    }))

    // Get discoverable public channels (limit 20)
    const joinedIds = memberships.map((m) => m.channelId)
    const publicChannels = await db.channel.findMany({
      where: {
        isPublic: true,
        id: { notIn: joinedIds },
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: { select: { members: true, posts: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    const discoveredChannels = publicChannels.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      avatar: c.avatar,
      language: c.language,
      isPublic: c.isPublic,
      memberCount: c._count.members,
      postCount: c._count.posts,
      owner: c.owner,
    }))

    return NextResponse.json({
      channels: joinedChannels,
      discover: discoveredChannels,
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

    const { name, description, isPublic } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })

    const channel = await db.channel.create({
      data: {
        name,
        description: description || null,
        ownerId: payload.userId,
        language: user?.preferredLanguage || 'English',
        isPublic: isPublic !== false,
      },
    })

    // Owner auto-joins
    await db.channelMember.create({
      data: {
        channelId: channel.id,
        userId: payload.userId,
        language: user?.preferredLanguage || 'English',
      },
    })

    return NextResponse.json({ channel }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
