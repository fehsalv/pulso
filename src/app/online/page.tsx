'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface OnlineUser {
  id: string
  name: string
  vibe: string
  city: string | null
  allowDirectMessages: boolean
  coverPhoto: string | null
}

interface Notification {
  type: string
  message: string
}

const VIBE_EMOJI: Record<string, string> = {
  ENCENDIDO: '🔥',
  TRANQUILO: '🌿',
  CREATIVO: '🎨',
  SOCIAL: '🎉',
}

const PING_INTERVAL = 30000 // 30 seconds

export default function OnlinePage() {
  const router = useRouter()
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [onlineMinutes, setOnlineMinutes] = useState(0)
  const [superLikes, setSuperLikes] = useState(0)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [dmTarget, setDmTarget] = useState<OnlineUser | null>(null)
  const [dmContent, setDmContent] = useState('')
  const [dmSending, setDmSending] = useState(false)
  const [dmRemaining, setDmRemaining] = useState(10)
  const [dmSuccess, setDmSuccess] = useState(false)

  const ping = useCallback(async () => {
    try {
      const res = await fetch('/api/presence', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setOnlineMinutes(data.onlineMinutesToday)
        setSuperLikes(data.superLikes)
        if (data.notification) {
          setNotification(data.notification)
          setTimeout(() => setNotification(null), 6000)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/presence')
      const data = await res.json()
      if (res.ok) setUsers(data.users || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ping()
    fetchOnlineUsers()

    const pingInterval = setInterval(ping, PING_INTERVAL)
    const refreshInterval = setInterval(fetchOnlineUsers, 15000)

    return () => {
      clearInterval(pingInterval)
      clearInterval(refreshInterval)
    }
  }, [ping, fetchOnlineUsers])

  const handleSendDM = async () => {
    if (!dmTarget || !dmContent.trim() || dmSending) return
    setDmSending(true)
    try {
      const res = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: dmTarget.id, content: dmContent }),
      })
      const data = await res.json()
      if (res.ok) {
        setDmRemaining(data.remaining)
        setDmSuccess(true)
        setDmContent('')
        setTimeout(() => {
          setDmSuccess(false)
          setDmTarget(null)
        }, 2000)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setDmSending(false)
    }
  }

  const progressPercent = Math.min((onlineMinutes / 120) * 100, 100)

  return (
    <main className="min-h-screen bg-[#0A0A0F] pb-24">

      {/* Notification popup */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4">
          <div className="px-5 py-4 rounded-2xl text-white text-sm font-medium text-center shadow-2xl"
               style={{ background: notification.type === 'super_like_earned' ? 'linear-gradient(135deg, #FF4D6D, #FF8147)' : '#1C1C28', border: '1px solid rgba(255,255,255,0.1)' }}>
            {notification.message}
          </div>
        </div>
      )}

      {/* DM Modal */}
      {dmTarget && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1C1C28] flex-shrink-0">
                {dmTarget.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={dmTarget.coverPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#FF4D6D] font-bold">
                    {dmTarget.name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{dmTarget.name}</p>
                <p className="text-[#8884A8] text-xs">{dmRemaining} messages left today</p>
              </div>
              <button onClick={() => setDmTarget(null)} className="ml-auto text-[#8884A8] hover:text-white text-xl">×</button>
            </div>

            {dmSuccess ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-white font-semibold">Message sent!</p>
              </div>
            ) : (
              <>
                <textarea
                  value={dmContent}
                  onChange={(e) => setDmContent(e.target.value)}
                  placeholder="Write your message..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors resize-none mb-3"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8884A8]">{dmContent.length}/500</span>
                  <button
                    onClick={handleSendDM}
                    disabled={!dmContent.trim() || dmSending}
                    className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
                  >
                    {dmSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-sm mx-auto p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pt-4">
          <h1 className="text-2xl font-black text-[#FF4D6D]"
              style={{ fontFamily: 'Syne, sans-serif' }}>
            Online now
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[#8884A8] text-xs">{users.length} online</span>
          </div>
        </div>

        {/* Super like progress */}
        <div className="bg-[#12121A] border border-white/5 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <div>
                <p className="text-white text-xs font-semibold">Super likes available</p>
                <p className="text-[#8884A8] text-xs">Stay 2 hours online to earn one</p>
              </div>
            </div>
            <span className="text-[#FF4D6D] font-black text-xl"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
              {superLikes}
            </span>
          </div>
          <div className="h-1.5 bg-[#1C1C28] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #FF4D6D, #FFB347)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#8884A8]">{onlineMinutes} min today</span>
            <span className="text-xs text-[#8884A8]">120 min goal</span>
          </div>
        </div>

        {/* Online users */}
        {loading ? (
          <div className="text-center text-[#8884A8] text-sm py-12">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">👀</div>
            <p className="text-white font-semibold mb-1">No one online right now</p>
            <p className="text-[#8884A8] text-sm">Check back in a few minutes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <div key={user.id}
                   className="flex items-center gap-3 bg-[#12121A] border border-white/5 rounded-2xl p-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1C1C28]">
                    {user.coverPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.coverPhoto} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#FF4D6D] font-bold">
                        {user.name[0]}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#12121A]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs">{VIBE_EMOJI[user.vibe]}</span>
                    {user.city && <span className="text-[#8884A8] text-xs">📍 {user.city}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/explore`)}
                    className="w-9 h-9 rounded-full bg-[#1C1C28] border border-white/10 flex items-center justify-center text-sm hover:border-[#FF4D6D]/50 transition-all"
                  >
                    ♥
                  </button>
                  {user.allowDirectMessages && (
                    <button
                      onClick={() => setDmTarget(user)}
                      className="w-9 h-9 rounded-full bg-[#1C1C28] border border-white/10 flex items-center justify-center text-sm hover:border-[#FF4D6D]/50 transition-all"
                    >
                      💬
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}