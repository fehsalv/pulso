import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        bio: true,
        vibeActual: true,
        ciudad: true,
        plan: true,
        fotos: {
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            url: true,
            esPortada: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.nombre,
        email: user.email,
        bio: user.bio,
        vibe: user.vibeActual,
        city: user.ciudad,
        plan: user.plan,
        photos: user.fotos.map((f) => ({
          id: f.id,
          url: f.url,
          isCover: f.esPortada,
        })),
      },
    })
  } catch (error) {
    console.error('[GET_PROFILE]', error)
    return NextResponse.json({ error: 'Error fetching profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { bio, city, vibe } = await request.json()

    const validVibes = ['ENCENDIDO', 'TRANQUILO', 'CREATIVO', 'SOCIAL']
    if (vibe && !validVibes.includes(vibe)) {
      return NextResponse.json({ error: 'Invalid vibe' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(city !== undefined && { ciudad: city.trim() || null }),
        ...(vibe && { vibeActual: vibe }),
      },
    })

    return NextResponse.json({
      ok: true,
      profile: {
        bio: updated.bio,
        city: updated.ciudad,
        vibe: updated.vibeActual,
      },
    })
  } catch (error) {
    console.error('[UPDATE_PROFILE]', error)
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 })
  }
}