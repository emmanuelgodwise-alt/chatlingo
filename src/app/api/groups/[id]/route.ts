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

    const group = await db.group.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true, preferredLanguage: true },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                preferredLanguage: true,
                learningLanguages: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user is a member
    const isMember = group.members.some((m) => m.userId === payload.userId)
    if (!isMember) {
      return NextResponse.json({ error: 'Not a group member' }, { status: 403 })
    }

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        owner: group.owner,
        memberCount: group.members.length,
        members: group.members.map((m) => ({
          id: m.id,
          userId: m.user.id,
          name: m.user.name,
          avatar: m.user.avatar,
          role: m.role,
          language: m.language,
          preferredLanguage: m.user.preferredLanguage,
          learningLanguages: m.user.learningLanguages,
          joinedAt: m.createdAt,
        })),
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
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
    const { name, description } = await request.json()

    const group = await db.group.findUnique({ where: { id } })
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Only owner can update
    if (group.ownerId !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the group owner can update the group' },
        { status: 403 }
      )
    }

    const updatedGroup = await db.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    })

    return NextResponse.json({ group: updatedGroup })
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

    const group = await db.group.findUnique({ where: { id } })
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Only owner can delete
    if (group.ownerId !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the group owner can delete the group' },
        { status: 403 }
      )
    }

    await db.group.delete({ where: { id } })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
