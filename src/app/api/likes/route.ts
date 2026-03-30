import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LIKES_POR_PLAN } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userPlan = request.headers.get('x-user-plan') || 'FREE'

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { toUserId } = await request.json()
    if (!toUserId) {
      return NextResponse.json({ error: 'toUserId is required' }, { status: 400 })
    }

    if (toUserId === userId) {
      return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 })
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0]
    const likesLimit = LIKES_POR_PLAN[userPlan] || 10

    const likeCount = await prisma.likeDailyCount.findUnique({
      where: { userId_fecha: { userId, fecha: today } },
    })

    const likesUsed = likeCount?.count || 0

    if (likesUsed >= likesLimit) {
      return NextResponse.json(
        { error: 'Daily like limit reached. Upgrade to PULSO+ for unlimited likes.' },
        { status: 429 }
      )
    }

    // Check if already liked
    const alreadyLiked = await prisma.like.findUnique({
      where: { fromUserId_toUserId: { fromUserId: userId, toUserId } },
    })

    if (alreadyLiked) {
      return NextResponse.json({ error: 'Already liked this user' }, { status: 409 })
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: toUserId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create like and update daily counter in a transaction
    const [like] = await prisma.$transaction([
      prisma.like.create({
        data: { fromUserId: userId, toUserId },
      }),
      prisma.likeDailyCount.upsert({
        where: { userId_fecha: { userId, fecha: today } },
        create: { userId, fecha: today, count: 1 },
        update: { count: { increment: 1 } },
      }),
    ])

    // Check if it's a mutual match
    const mutualLike = await prisma.like.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: userId } },
    })

    let match = null
    if (mutualLike) {
      // Create match (ensure consistent order for unique constraint)
      const [userAId, userBId] = [userId, toUserId].sort()
      match = await prisma.match.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        create: { userAId, userBId },
        update: {},
      })
    }

    return NextResponse.json({
      ok: true,
      liked: like.id,
      match: match ? { id: match.id, isNew: true } : null,
      likesUsed: likesUsed + 1,
      likesRemaining: likesLimit === 999999 ? null : Math.max(0, likesLimit - likesUsed - 1),
    })
  } catch (error) {
    console.error('[LIKE]', error)
    return NextResponse.json({ error: 'Error processing like' }, { status: 500 })
  }
}