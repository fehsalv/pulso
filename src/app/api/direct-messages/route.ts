import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_DM_PER_DAY = 10

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { toUserId, content } = await request.json()

    if (!toUserId || !content?.trim()) {
      return NextResponse.json({ error: 'toUserId and content are required' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 chars)' }, { status: 400 })
    }

    if (toUserId === userId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    // Check if target user allows direct messages
    const targetUser = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { allowDirectMessages: true, activo: true },
    })

    if (!targetUser || !targetUser.activo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!targetUser.allowDirectMessages) {
      return NextResponse.json(
        { error: 'This user does not accept direct messages' },
        { status: 403 }
      )
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0]
    const dailyCount = await prisma.directMessageDailyCount.findUnique({
      where: { userId_fecha: { userId, fecha: today } },
    })

    const used = dailyCount?.count || 0
    if (used >= MAX_DM_PER_DAY) {
      return NextResponse.json(
        { error: `Daily limit of ${MAX_DM_PER_DAY} direct messages reached` },
        { status: 429 }
      )
    }

    // Create message and update counter
    const [message] = await prisma.$transaction([
      prisma.directMessage.create({
        data: { fromUserId: userId, toUserId, content: content.trim() },
      }),
      prisma.directMessageDailyCount.upsert({
        where: { userId_fecha: { userId, fecha: today } },
        create: { userId, fecha: today, count: 1 },
        update: { count: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      ok: true,
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
      },
      remaining: MAX_DM_PER_DAY - used - 1,
    })
  } catch (error) {
    console.error('[SEND_DM]', error)
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        fromUser: {
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Mark received messages as read
    await prisma.directMessage.updateMany({
      where: { toUserId: userId, read: false },
      data: { read: true },
    })

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        isOwn: m.fromUserId === userId,
        read: m.read,
        createdAt: m.createdAt,
        from: {
          id: m.fromUser.id,
          name: m.fromUser.nombre,
          coverPhoto: m.fromUser.fotos[0]?.url || null,
        },
      })),
    })
  } catch (error) {
    console.error('[GET_DMS]', error)
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 })
  }
}