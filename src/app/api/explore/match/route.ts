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

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        preferredLanguage: true,
        learningLanguages: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const myLearningLangs: string[] = JSON.parse(user.learningLanguages || '[]')
    const myPreferredLang = user.preferredLanguage

    // Find users whose preferredLanguage matches one of my learningLanguages
    // OR whose learningLanguages includes my preferredLanguage
    const allUsers = await db.user.findMany({
      where: {
        id: { not: payload.userId },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        preferredLanguage: true,
        learningLanguages: true,
        online: true,
      },
    })

    // Calculate compatibility score for each user
    const scoredUsers = allUsers.map((u) => {
      const theirLearningLangs: string[] = JSON.parse(u.learningLanguages || '[]')
      const matchedLanguages: string[] = []

      let score = 0

      // I want to learn their preferred language → great match
      if (myLearningLangs.includes(u.preferredLanguage)) {
        score += 3
        matchedLanguages.push(u.preferredLanguage)
      }

      // They want to learn my preferred language → great match
      if (theirLearningLangs.includes(myPreferredLang)) {
        score += 3
        matchedLanguages.push(myPreferredLang)
      }

      // Shared learning languages
      const sharedLearning = myLearningLangs.filter((l) => theirLearningLangs.includes(l))
      score += sharedLearning.length
      matchedLanguages.push(...sharedLearning)

      // Remove duplicates
      const uniqueMatched = [...new Set(matchedLanguages)]

      return {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        bio: u.bio,
        preferredLanguage: u.preferredLanguage,
        learningLanguages: u.learningLanguages,
        online: u.online,
        compatibilityScore: score,
        matchedLanguages: uniqueMatched,
      }
    })

    // Filter users with at least some compatibility and sort by score
    const suggestions = scoredUsers
      .filter((u) => u.compatibilityScore > 0)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10)

    return NextResponse.json({ suggestions })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
