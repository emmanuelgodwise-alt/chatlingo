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

    const channel = await db.channel.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: { select: { members: true, posts: true } },
      },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    return NextResponse.json({
      channel: {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        avatar: channel.avatar,
        language: channel.language,
        isPublic: channel.isPublic,
        memberCount: channel._count.members,
        postCount: channel._count.posts,
        owner: channel.owner,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
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

    const channel = await db.channel.findUnique({ where: { id } })
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    const existing = await db.channelMember.findUnique({
      where: { channelId_userId: { channelId: id, userId: payload.userId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already a member' }, { status: 409 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })

    const member = await db.channelMember.create({
      data: {
        channelId: id,
        userId: payload.userId,
        language: user?.preferredLanguage || 'English',
      },
    })

    // Update member count
    await db.channel.update({
      where: { id },
      data: { memberCount: { increment: 1 } },
    })

    return NextResponse.json({ member }, { status: 201 })
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

    const channel = await db.channel.findUnique({ where: { id } })
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Owner cannot leave their own channel — they should delete it
    if (channel.ownerId === payload.userId) {
      return NextResponse.json(
        { error: 'Owner cannot leave their own channel' },
        { status: 400 }
      )
    }

    await db.channelMember.delete({
      where: { channelId_userId: { channelId: id, userId: payload.userId } },
    })

    // Decrement member count
    await db.channel.update({
      where: { id },
      data: { memberCount: { decrement: 1 } },
    })

    return NextResponse.json({ message: 'Left channel successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
