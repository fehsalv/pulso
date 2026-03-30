import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { nombre, email, password, fechaNacimiento, ciudad } = parsed.data

    // Verificar que el email no esté en uso
    const emailExiste = await prisma.user.findUnique({ where: { email } })
    if (emailExiste) {
      return NextResponse.json(
        { error: 'Este correo ya está registrado' },
        { status: 409 }
      )
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash,
        fechaNacimiento: new Date(fechaNacimiento),
        ciudad: ciudad || null,
        // perfilCompleto queda en false hasta que suba 2 fotos
      },
    })

    // Generar JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    })

    // Respuesta con cookie
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
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
