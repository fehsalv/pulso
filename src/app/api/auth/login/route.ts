import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validations'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const body = await request.json()

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || 'Invalid data' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Check rate limit by IP and email
    const ipKey = `login:ip:${ip}`
    const emailKey = `login:email:${email}`

    const ipLimit = await checkRateLimit(ipKey)
    if (!ipLimit.allowed) {
      const minutes = Math.ceil(
        (ipLimit.blockedUntil!.getTime() - Date.now()) / 60000
      )
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${minutes} minutes.` },
        { status: 429 }
      )
    }

    const emailLimit = await checkRateLimit(emailKey)
    if (!emailLimit.allowed) {
      const minutes = Math.ceil(
        (emailLimit.blockedUntil!.getTime() - Date.now()) / 60000
      )
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${minutes} minutes.` },
        { status: 429 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        fotos: { orderBy: { orden: 'asc' }, take: 1 },
      },
    })

    if (!user) {
      await recordFailedAttempt(ipKey)
      await recordFailedAttempt(emailKey)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: 'Your account has been suspended. Contact support.' },
        { status: 403 }
      )
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash)
    if (!passwordOk) {
      await recordFailedAttempt(ipKey)
      await recordFailedAttempt(emailKey)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Success — reset rate limit
    await resetRateLimit(ipKey)
    await resetRateLimit(emailKey)

    const token = signToken({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    })

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        plan: user.plan,
        perfilCompleto: user.perfilCompleto,
        fotoPortada: user.fotos[0]?.url || null,
      },
      redirectTo: user.perfilCompleto ? '/explore' : '/register/photos',
    })

    response.cookies.set('pulso_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[LOGIN]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}