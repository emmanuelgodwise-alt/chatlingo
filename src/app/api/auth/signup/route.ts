import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, preferredLanguage } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      // If the user exists, try to log them in instead
      const isMatch = await bcrypt.compare(password, existingUser.password)
      if (isMatch) {
        // Account already exists with this password — log them in
        await db.user.update({
          where: { id: existingUser.id },
          data: { online: true },
        })
        const token = signToken({
          userId: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        })
        return NextResponse.json({
          message: 'Logged in successfully (account already existed)',
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
            preferredLanguage: existingUser.preferredLanguage,
            avatar: existingUser.avatar,
          },
          token,
        })
      }
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 }
      )
    }

    // Hash password FIRST — if this fails, nothing is in the DB yet
    const hashedPassword = await bcrypt.hash(password, 12)

    // Sign token BEFORE creating user — if JWT fails, nothing is in the DB
    let userId = ''
    try {
      userId = `temp-${Date.now()}`
      // We can't know the user ID before creation, so we'll sign after
    } catch {
      // just a placeholder
    }

    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        preferredLanguage: preferredLanguage || 'English',
        online: true,
      },
    })

    // Now sign the token with the real user ID
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        avatar: user.avatar,
        online: user.online,
      },
      token,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Signup error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
