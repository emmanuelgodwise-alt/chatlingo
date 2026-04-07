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

    const now = new Date()

    // Get contact user IDs
    const contacts = await db.contact.findMany({
      where: { userId: payload.userId },
      select: { contactUserId: true },
    })
    const contactIds = contacts.map((c) => c.contactUserId)

    // Get user's own statuses
    const ownStatuses = await db.status.findMany({
      where: {
        userId: payload.userId,
        expiresAt: { gt: now },
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get statuses from contacts
    const contactStatuses = await db.status.findMany({
      where: {
        userId: { in: contactIds },
        expiresAt: { gt: now },
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Check which statuses the user has viewed
    const viewedStatuses = await db.statusView.findMany({
      where: {
        viewerId: payload.userId,
        statusId: {
          in: [...ownStatuses.map((s) => s.id), ...contactStatuses.map((s) => s.id)],
        },
      },
      select: { statusId: true },
    })
    const viewedIds = new Set(viewedStatuses.map((v) => v.statusId))

    const formatStatus = (s: typeof ownStatuses[0]) => ({
      id: s.id,
      content: s.content,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      language: s.language,
      bgGradient: s.bgGradient,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      viewCount: s._count.views,
      viewed: viewedIds.has(s.id),
      owner: s.owner,
    })

    return NextResponse.json({
      statuses: [
        ...ownStatuses.map(formatStatus),
        ...contactStatuses.map(formatStatus),
      ],
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

    const { content, mediaUrl, mediaType, bgGradient } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const status = await db.status.create({
      data: {
        userId: payload.userId,
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || (mediaUrl ? 'image' : 'text'),
        language: user?.preferredLanguage || 'English',
        bgGradient: bgGradient || 'from-emerald-500 to-teal-600',
        expiresAt,
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json({ status }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
