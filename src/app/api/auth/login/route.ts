import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        fotos: { orderBy: { orden: 'asc' }, take: 1 },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      )
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido suspendida. Contacta soporte.' },
        { status: 403 }
      )
    }

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(password, user.passwordHash)
    if (!passwordOk) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Generar JWT
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
      // Redirigir a subir fotos si el perfil no está completo
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
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
