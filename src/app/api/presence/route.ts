import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MINUTES_FOR_SUPER_LIKE = 120 // 2 hours
const NOTIFY_INTERVALS = [30, 60, 90, 120] // minutes to notify

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onlineSince: true,
        onlineMinutesToday: true,
        superLikeEarnedDate: true,
        superLikes: true,
        lastSeenAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate minutes online this session
    let onlineSince = user.onlineSince
    let onlineMinutesToday = user.onlineMinutesToday

    // Reset daily counter if it's a new day
    const lastSeenDate = user.lastSeenAt?.toISOString().split('T')[0]
    if (lastSeenDate && lastSeenDate !== today) {
      onlineMinutesToday = 0
      onlineSince = now
    }

    // Set onlineSince if not set
    if (!onlineSince) {
      onlineSince = now
    }

    // Calculate minutes since session started
    const sessionMinutes = Math.floor(
      (now.getTime() - onlineSince.getTime()) / 60000
    )

    // Update total minutes today
    const totalMinutesToday = onlineMinutesToday + sessionMinutes

    // Check if super like should be earned
    let earnedSuperLike = false
    let newSuperLikes = user.superLikes

    const alreadyEarnedToday = user.superLikeEarnedDate === today

    if (totalMinutesToday >= MINUTES_FOR_SUPER_LIKE && !alreadyEarnedToday) {
      earnedSuperLike = true
      newSuperLikes = user.superLikes + 1
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastSeenAt: now,
        onlineSince,
        onlineMinutesToday: totalMinutesToday,
        ...(earnedSuperLike && {
          superLikes: newSuperLikes,
          superLikeEarnedDate: today,
        }),
      },
    })

    // Calculate next notification
    const nextNotification = NOTIFY_INTERVALS.find(
      (m) => m > totalMinutesToday
    )

    // Determine notification message
    let notification = null
    const justHitInterval = NOTIFY_INTERVALS.find(
      (m) => totalMinutesToday >= m && totalMinutesToday < m + 1
    )

    if (earnedSuperLike) {
      notification = {
        type: 'super_like_earned',
        message: "🌟 You earned a Super Like! You've been active for 2 hours today.",
      }
    } else if (justHitInterval && !alreadyEarnedToday) {
      const remaining = MINUTES_FOR_SUPER_LIKE - totalMinutesToday
        notification = {
        type: 'progress',
        message: `⚡ ${totalMinutesToday} minutes active! ${remaining} more minutes to earn a Super Like.`,
      }
    }

    return NextResponse.json({
      ok: true,
      onlineMinutesToday: totalMinutesToday,
      superLikes: newSuperLikes,
      earnedSuperLike,
      notification,
      nextNotificationAt: nextNotification
        ? nextNotification - totalMinutesToday
        : null,
    })
  } catch (error) {
    console.error('[PRESENCE]', error)
    return NextResponse.json({ error: 'Error updating presence' }, { status: 500 })
  }
}

// GET online users
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)

    const onlineUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        lastSeenAt: { gte: oneMinuteAgo },
        activo: true,
        perfilCompleto: true,
      },
      select: {
        id: true,
        nombre: true,
        vibeActual: true,
        ciudad: true,
        allowDirectMessages: true,
        fotos: {
          where: { esPortada: true },
          select: { url: true },
          take: 1,
        },
      },
      take: 50,
      orderBy: { lastSeenAt: 'desc' },
    })

    return NextResponse.json({
      users: onlineUsers.map((u) => ({
        id: u.id,
        name: u.nombre,
        vibe: u.vibeActual,
        city: u.ciudad,
        allowDirectMessages: u.allowDirectMessages,
        coverPhoto: u.fotos[0]?.url || null,
      })),
      count: onlineUsers.length,
    })
  } catch (error) {
    console.error('[ONLINE_USERS]', error)
    return NextResponse.json({ error: 'Error fetching online users' }, { status: 500 })
  }
}