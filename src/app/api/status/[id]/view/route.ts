import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

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

    // Check status exists and not expired
    const status = await db.status.findUnique({
      where: { id },
    })

    if (!status) {
      return NextResponse.json({ error: 'Status not found' }, { status: 404 })
    }

    if (status.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Status has expired' }, { status: 410 })
    }

    // Create view if not exists (upsert)
    await db.statusView.upsert({
      where: {
        statusId_viewerId: {
          statusId: id,
          viewerId: payload.userId,
        },
      },
      create: {
        statusId: id,
        viewerId: payload.userId,
      },
      update: {},
    })

    return NextResponse.json({ message: 'Status viewed' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
