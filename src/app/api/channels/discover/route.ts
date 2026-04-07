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

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const lang = searchParams.get('lang') || ''

    // Get channels the user has already joined
    const joinedMemberships = await db.channelMember.findMany({
      where: { userId: payload.userId },
      select: { channelId: true },
    })
    const joinedIds = joinedMemberships.map((m) => m.channelId)

    // Build search filters
    const where: Record<string, unknown> = {
      isPublic: true,
      id: { notIn: joinedIds },
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ]
    }

    if (lang) {
      where.language = lang
    }

    const channels = await db.channel.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: { select: { members: true, posts: true } },
      },
      take: 20,
      orderBy: { memberCount: 'desc' },
    })

    return NextResponse.json({
      channels: channels.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        avatar: c.avatar,
        language: c.language,
        isPublic: c.isPublic,
        memberCount: c._count.members,
        postCount: c._count.posts,
        owner: c.owner,
      })),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
