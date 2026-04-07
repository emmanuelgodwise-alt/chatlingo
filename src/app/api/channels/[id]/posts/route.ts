import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { translateText } from '@/lib/translate'

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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 20
    const skip = (page - 1) * limit

    const posts = await db.channelPost.findMany({
      where: { channelId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            preferredLanguage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const totalPosts = await db.channelPost.count({
      where: { channelId: id },
    })

    // Auto-translate posts to viewer's language
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { preferredLanguage: true },
    })
    const viewerLang = user?.preferredLanguage || 'English'

    const translatedPosts = await Promise.all(
      posts.map(async (post) => {
        const translatedContent =
          post.language !== viewerLang && post.content
            ? await translateText(post.content, post.language, viewerLang)
            : post.content

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          translatedContent,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          language: post.language,
          translatedLanguage: viewerLang,
          likes: post.likes,
          createdAt: post.createdAt,
          author: post.author,
        }
      })
    )

    return NextResponse.json({
      posts: translatedPosts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
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
    const { title, content, mediaUrl, mediaType } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check membership
    const membership = await db.channelMember.findUnique({
      where: { channelId_userId: { channelId: id, userId: payload.userId } },
    })
    if (!membership) {
      return NextResponse.json(
        { error: 'Must be a channel member to post' },
        { status: 403 }
      )
    }

    const post = await db.channelPost.create({
      data: {
        channelId: id,
        authorId: payload.userId,
        title: title || null,
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        language: membership.language || 'English',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
