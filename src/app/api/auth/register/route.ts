import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { registerSchema } from '@/lib/validations'
import { checkRateLimit, recordFailedAttempt } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const ipKey = `register:ip:${ip}`

    // Max 5 registrations per IP per 15 minutes
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

    const body = await request.json()

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || 'Invalid data' },
        { status: 400 }
      )
    }

    const { nombre, email, password, fechaNacimiento, ciudad } = parsed.data

    const emailExiste = await prisma.user.findUnique({ where: { email } })
    if (emailExiste) {
      await recordFailedAttempt(ipKey)
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash,
        fechaNacimiento: new Date(fechaNacimiento),
        ciudad: ciudad || null,
      },
    })

    const token = signToken({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    })

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          perfilCompleto: user.perfilCompleto,
        },
      },
      { status: 201 }
    )

    response.cookies.set('pulso_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}