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

    const status = await db.status.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            preferredLanguage: true,
          },
        },
        _count: { select: { views: true } },
        views: {
          select: {
            viewer: {
              select: { id: true, name: true, avatar: true },
            },
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!status) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    // Check if expired
    if (status.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Status has expired' }, { status: 410 })
    }

    // Check if viewer has viewed
    const hasViewed = await db.statusView.findUnique({
      where: {
        statusId_viewerId: {
          statusId: id,
          viewerId: payload.userId,
        },
      },
    })

    return NextResponse.json({
      status: {
        id: status.id,
        content: status.content,
        mediaUrl: status.mediaUrl,
        mediaType: status.mediaType,
        language: status.language,
        bgGradient: status.bgGradient,
        createdAt: status.createdAt,
        expiresAt: status.expiresAt,
        viewCount: status._count.views,
        viewed: !!hasViewed,
        owner: status.owner,
        viewers: status.views,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
