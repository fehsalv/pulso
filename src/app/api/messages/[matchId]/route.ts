import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { matchId } = await params

    // Verify user belongs to this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: {
            id: true,
            nombre: true,
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
            fotos: {
              where: { esPortada: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const other = match.userAId === userId ? match.userB : match.userA

    // Get messages
    const messages = await prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        contenido: true,
        senderId: true,
        leido: true,
        createdAt: true,
      },
    })

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: userId },
        leido: false,
      },
      data: { leido: true },
    })

    return NextResponse.json({
      match: {
        id: match.id,
        other: {
          id: other.id,
          name: other.nombre,
          coverPhoto: other.fotos[0]?.url || null,
        },
      },
      messages: messages.map((m) => ({
        id: m.id,
        content: m.contenido,
        isOwn: m.senderId === userId,
        read: m.leido,
        createdAt: m.createdAt,
      })),
    })
  } catch (error) {
    console.error('[GET_MESSAGES]', error)
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { matchId } = await params
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    // Verify user belongs to this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ userAId: userId }, { userBId: userId }],
        estado: 'ACTIVO',
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        contenido: content.trim(),
      },
    })

    return NextResponse.json({
      ok: true,
      message: {
        id: message.id,
        content: message.contenido,
        isOwn: true,
        read: false,
        createdAt: message.createdAt,
      },
    })
  } catch (error) {
    console.error('[SEND_MESSAGE]', error)
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 })
  }
}