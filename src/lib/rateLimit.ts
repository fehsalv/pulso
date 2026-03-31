import { prisma } from '@/lib/prisma'

const MAX_ATTEMPTS = 5
const BLOCK_DURATION_MINUTES = 15

export async function checkRateLimit(key: string): Promise<{
  allowed: boolean
  remainingAttempts: number
  blockedUntil: Date | null
}> {
  const now = new Date()

  const record = await prisma.rateLimit.findUnique({
    where: { key },
  })

  // No record yet — allow
  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: record.blockedUntil,
    }
  }

  // Block expired — reset
  if (record.blockedUntil && record.blockedUntil <= now) {
    await prisma.rateLimit.update({
      where: { key },
      data: { attempts: 1, blockedUntil: null, lastAttempt: now },
    })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  // Too many attempts — block
  if (record.attempts >= MAX_ATTEMPTS) {
    const blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000)
    await prisma.rateLimit.update({
      where: { key },
      data: { blockedUntil, lastAttempt: now },
    })
    return { allowed: false, remainingAttempts: 0, blockedUntil }
  }

  // Increment attempts
  await prisma.rateLimit.update({
    where: { key },
    data: { attempts: { increment: 1 }, lastAttempt: now },
  })

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.attempts - 1,
    blockedUntil: null,
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } })
}

export async function recordFailedAttempt(key: string): Promise<{
  allowed: boolean
  remainingAttempts: number
  blockedUntil: Date | null
}> {
  const now = new Date()

  const record = await prisma.rateLimit.findUnique({ where: { key } })

  if (!record) {
    await prisma.rateLimit.create({
      data: { id: crypto.randomUUID(), key, attempts: 1, lastAttempt: now },
    })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  const newAttempts = record.attempts + 1

  if (newAttempts >= MAX_ATTEMPTS) {
    const blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000)
    await prisma.rateLimit.update({
      where: { key },
      data: { attempts: newAttempts, blockedUntil, lastAttempt: now },
    })
    return { allowed: false, remainingAttempts: 0, blockedUntil }
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { attempts: newAttempts, lastAttempt: now },
  })

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - newAttempts,
    blockedUntil: null,
  }
}