import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        estado: 'ACTIVO',
      },
      include: {
        userA: {
          select: {
            id: true,
            nombre: true,
            vibeActual: true,
            fotos: {
              where: { esPortada: true },
              select: { url: true },
              take: 1,
            },
          },
        },
        userB: {
          select: {
            id: true,
            nombre: true,
            vibeActual: true,
            fotos: {
              where: { esPortada: true },
              select: { url: true },
              take: 1,
            },
          },
        },
        mensajes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            contenido: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Return the other user's info for each match
    const formatted = matches.map((match) => {
      const other = match.userAId === userId ? match.userB : match.userA
      const lastMessage = match.mensajes[0] || null

      return {
        matchId: match.id,
        user: {
          id: other.id,
          name: other.nombre,
          vibe: other.vibeActual,
          coverPhoto: other.fotos[0]?.url || null,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.contenido,
              isOwn: lastMessage.senderId === userId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        createdAt: match.createdAt,
      }
    })

    return NextResponse.json({ matches: formatted })
  } catch (error) {
    console.error('[MATCHES]', error)
    return NextResponse.json({ error: 'Error fetching matches' }, { status: 500 })
  }
}