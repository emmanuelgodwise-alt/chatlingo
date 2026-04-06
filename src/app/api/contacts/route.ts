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

    const contacts = await db.contact.findMany({
      where: { userId: payload.userId },
      include: {
        contactUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            preferredLanguage: true,
            avatar: true,
            online: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      contacts: contacts.map((c) => c.contactUser),
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

    const { contactUserId } = await request.json()
    if (!contactUserId) {
      return NextResponse.json(
        { error: 'Contact user ID is required' },
        { status: 400 }
      )
    }

    if (contactUserId === payload.userId) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a contact' },
        { status: 400 }
      )
    }

    const contactExists = await db.contact.findUnique({
      where: {
        userId_contactUserId: {
          userId: payload.userId,
          contactUserId,
        },
      },
    })

    if (contactExists) {
      return NextResponse.json(
        { error: 'Contact already exists' },
        { status: 409 }
      )
    }

    await db.contact.create({
      data: {
        userId: payload.userId,
        contactUserId,
      },
    })

    return NextResponse.json({ message: 'Contact added successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
