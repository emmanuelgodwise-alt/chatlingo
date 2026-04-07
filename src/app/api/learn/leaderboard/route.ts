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
    const targetLanguage = searchParams.get('targetLanguage')

    // Get user's contacts for friends ranking
    const contacts = await db.contact.findMany({
      where: { userId: payload.userId },
      select: { contactUserId: true },
    })
    const contactIds = contacts.map((c) => c.contactUserId)

    // Get all users with learning profiles
    const whereClause: Record<string, unknown> = {
      totalXp: { gt: 0 },
    }

    if (targetLanguage) {
      whereClause.targetLanguage = targetLanguage
    }

    const profiles = await db.learningProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { totalXp: 'desc' },
      take: 50,
    })

    // Format leaderboard entries
    const leaderboard = profiles.map((p, index) => {
      const isFriend = contactIds.includes(p.userId) || p.userId === payload.userId

      // Calculate level from XP
      let level = 1
      if (p.totalXp >= 500) level = 3
      else if (p.totalXp >= 100) level = 2

      return {
        rank: index + 1,
        userId: p.userId,
        name: p.user.name,
        avatar: p.user.avatar,
        totalXp: p.totalXp,
        level,
        currentStreak: p.currentStreak,
        lessonsCompleted: p.lessonsCompleted,
        targetLanguage: p.targetLanguage,
        isCurrentUser: p.userId === payload.userId,
        isFriend,
      }
    })

    // Separate global leaderboard and friends leaderboard
    const globalLeaderboard = leaderboard
    const friendsLeaderboard = leaderboard
      .filter((entry) => entry.isFriend)
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))

    // Find current user's rank
    const currentUserRank = leaderboard.find((e) => e.isCurrentUser)?.rank || null

    return NextResponse.json({
      leaderboard: globalLeaderboard,
      friendsLeaderboard,
      currentUserRank,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
