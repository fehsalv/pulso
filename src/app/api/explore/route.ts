import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LIKES_POR_PLAN } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userPlan = request.headers.get('x-user-plan') || 'FREE'

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get today's date as string YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    // Get how many likes the user has used today
    const likeCount = await prisma.likeDailyCount.findUnique({
      where: { userId_fecha: { userId, fecha: today } },
    })

    const likesUsed = likeCount?.count || 0
    const likesLimit = LIKES_POR_PLAN[userPlan] || 10
    const likesRemaining = Math.max(0, likesLimit - likesUsed)

    // Get IDs the user has already liked
    const alreadyLiked = await prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    })
    const excludeIds = alreadyLiked.map((l) => l.toUserId)
    excludeIds.push(userId) // exclude self

    // Get profiles to show
    const profiles = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        activo: true,
        perfilCompleto: true,
      },
      select: {
        id: true,
        nombre: true,
        fechaNacimiento: true,
        bio: true,
        vibeActual: true,
        ciudad: true,
        fotos: {
          where: { esPortada: true },
          select: { url: true },
          take: 1,
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    // Calculate age for each profile
    const profilesWithAge = profiles.map((p) => {
      const birth = new Date(p.fechaNacimiento)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const hasBirthday =
        today >= new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
      if (!hasBirthday) age--

      return {
        id: p.id,
        name: p.nombre,
        age,
        bio: p.bio,
        vibe: p.vibeActual,
        city: p.ciudad,
        coverPhoto: p.fotos[0]?.url || null,
      }
    })

    return NextResponse.json({
      profiles: profilesWithAge,
      likes: {
        used: likesUsed,
        limit: likesLimit === 999999 ? null : likesLimit,
        remaining: likesLimit === 999999 ? null : likesRemaining,
      },
    })
  } catch (error) {
    console.error('[EXPLORE]', error)
    return NextResponse.json({ error: 'Error fetching profiles' }, { status: 500 })
  }
}