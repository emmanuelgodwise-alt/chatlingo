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
    const type = searchParams.get('type') || 'people'
    const q = searchParams.get('q') || ''
    const lang = searchParams.get('lang') || ''

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { learningLanguages: true, preferredLanguage: true },
    })

    let results: unknown[] = []

    switch (type) {
      case 'people': {
        // Get contact IDs to exclude
        const contacts = await db.contact.findMany({
          where: { userId: payload.userId },
          select: { contactUserId: true },
        })
        const contactIds = contacts.map((c) => c.contactUserId)

        const peopleWhere: Record<string, unknown> = {
          id: { not: payload.userId },
          ...(contactIds.length > 0 && { id: { notIn: [...contactIds, payload.userId] } }),
        }

        if (q) {
          peopleWhere.OR = [
            { name: { contains: q } },
            { bio: { contains: q } },
          ]
        }

        if (lang) {
          peopleWhere.OR = [
            { preferredLanguage: lang },
            { learningLanguages: { contains: lang } },
          ]
        }

        const people = await db.user.findMany({
          where: peopleWhere,
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            preferredLanguage: true,
            learningLanguages: true,
            online: true,
          },
          take: 20,
          orderBy: { online: 'desc' },
        })

        results = people
        break
      }

      case 'channels': {
        const channelWhere: Record<string, unknown> = { isPublic: true }

        if (q) {
          channelWhere.OR = [
            { name: { contains: q } },
            { description: { contains: q } },
          ]
        }

        if (lang) {
          channelWhere.language = lang
        }

        const channels = await db.channel.findMany({
          where: channelWhere,
          include: {
            owner: {
              select: { id: true, name: true, avatar: true },
            },
            _count: { select: { members: true, posts: true } },
          },
          take: 20,
          orderBy: { memberCount: 'desc' },
        })

        results = channels.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          avatar: c.avatar,
          language: c.language,
          memberCount: c._count.members,
          postCount: c._count.posts,
          owner: c.owner,
        }))
        break
      }

      case 'groups': {
        // Get group IDs the user is already a member of
        const memberships = await db.groupMember.findMany({
          where: { userId: payload.userId },
          select: { groupId: true },
        })
        const memberGroupIds = memberships.map((m) => m.groupId)

        const groupWhere: Record<string, unknown> = {
          ...(memberGroupIds.length > 0 && { id: { notIn: memberGroupIds } }),
        }

        if (q) {
          groupWhere.OR = [
            { name: { contains: q } },
            { description: { contains: q } },
          ]
        }

        const groups = await db.group.findMany({
          where: groupWhere,
          include: {
            owner: {
              select: { id: true, name: true, avatar: true },
            },
            _count: { select: { members: true } },
          },
          take: 20,
          orderBy: { createdAt: 'desc' },
        })

        results = groups.map((g) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          avatar: g.avatar,
          memberCount: g._count.members,
          owner: g.owner,
          createdAt: g.createdAt,
        }))
        break
      }

      case 'rooms': {
        const roomWhere: Record<string, unknown> = { isLive: true }

        if (q) {
          roomWhere.OR = [
            { name: { contains: q } },
            { description: { contains: q } },
          ]
        }

        if (lang) {
          roomWhere.language = lang
        }

        const rooms = await db.room.findMany({
          where: roomWhere,
          include: {
            owner: {
              select: { id: true, name: true, avatar: true },
            },
            _count: { select: { participants: true } },
          },
          take: 20,
          orderBy: { createdAt: 'desc' },
        })

        results = rooms.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          language: r.language,
          isLive: r.isLive,
          participantCount: r._count.participants,
          owner: r.owner,
        }))
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type. Use: people, channels, groups, or rooms' }, { status: 400 })
    }

    return NextResponse.json({ type, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
