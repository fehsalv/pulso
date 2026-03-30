'use client'

import { useState, useEffect } from 'react'

interface Profile {
  id: string
  name: string
  age: number
  bio: string | null
  vibe: string
  city: string | null
  coverPhoto: string | null
}

interface LikesInfo {
  used: number
  limit: number | null
  remaining: number | null
}

const VIBE_EMOJI: Record<string, string> = {
  ENCENDIDO: '🔥',
  TRANQUILO: '🌿',
  CREATIVO: '🎨',
  SOCIAL: '🎉',
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [likes, setLikes] = useState<LikesInfo>({ used: 0, limit: 10, remaining: 10 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [matchAlert, setMatchAlert] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/explore')
      const data = await res.json()
      setProfiles(data.profiles || [])
      setLikes(data.likes)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    const profile = profiles[currentIndex]
    if (!profile || actionLoading) return

    setActionLoading(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: profile.id }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setLimitReached(true)
        return
      }

      if (data.match) {
        setMatchAlert(true)
        setTimeout(() => setMatchAlert(false), 3000)
      }

      setLikes(prev => ({
        ...prev,
        used: data.likesUsed,
        remaining: data.likesRemaining,
      }))

      nextProfile()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePass = () => {
    if (actionLoading) return
    nextProfile()
  }

  const nextProfile = () => {
    setCurrentIndex(prev => prev + 1)
  }

  const profile = profiles[currentIndex]

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#8884A8] text-sm">Loading profiles...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4">

      {/* Match alert */}
      {matchAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#FF4D6D] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg animate-bounce">
          🔥 It&apos;s a match!
        </div>
      )}

      {/* Limit reached */}
      {limitReached && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121A] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-white font-bold text-xl mb-2">No more likes today</h2>
            <p className="text-[#8884A8] text-sm mb-6">
              You&apos;ve used all 10 daily likes. Upgrade to PULSO+ for unlimited likes.
            </p>
            <button
              onClick={() => setLimitReached(false)}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
            >
              Upgrade to PULSO+
            </button>
            <button
              onClick={() => setLimitReached(false)}
              className="w-full py-3 mt-2 rounded-xl text-[#8884A8] text-sm"
            >
              Come back tomorrow
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#FF4D6D]"
            style={{ fontFamily: 'Syne, sans-serif' }}>
          PULSO
        </h1>
        <div className="flex items-center gap-2">
          <div className="text-xs text-[#8884A8]">
            {likes.remaining !== null ? (
              <span>
                <span className="text-white font-semibold">{likes.remaining}</span> likes left
              </span>
            ) : (
              <span className="text-[#FF4D6D] font-semibold">Unlimited ✨</span>
            )}
          </div>
        </div>
      </div>

      {/* Likes progress bar */}
      {likes.limit && (
        <div className="w-full max-w-sm mb-4">
          <div className="h-1 bg-[#1C1C28] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(likes.used / likes.limit) * 100}%`,
                background: 'linear-gradient(90deg, #FF4D6D, #FF8147)',
              }}
            />
          </div>
        </div>
      )}

      {/* Profile card */}
      {profile ? (
        <div className="w-full max-w-sm">
          <div className="bg-[#12121A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            {/* Photo */}
            <div className="relative w-full aspect-[3/4] bg-[#1C1C28]">
              {profile.coverPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.coverPhoto}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#252535] flex items-center justify-center text-3xl font-bold text-[#FF4D6D]">
                    {profile.name[0].toUpperCase()}
                  </div>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-40"
                   style={{ background: 'linear-gradient(transparent, rgba(10,10,15,0.95))' }} />

              {/* Profile info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-white font-bold text-2xl leading-tight">
                      {profile.name}, {profile.age}
                    </h2>
                    {profile.city && (
                      <p className="text-[#8884A8] text-sm mt-0.5">📍 {profile.city}</p>
                    )}
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm">
                    {VIBE_EMOJI[profile.vibe]} {profile.vibe.charAt(0) + profile.vibe.slice(1).toLowerCase()}
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-[#8884A8] text-sm mt-2 line-clamp-2">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6 p-5">
              <button
                onClick={handlePass}
                disabled={actionLoading}
                className="w-14 h-14 rounded-full bg-[#1C1C28] border border-white/10 flex items-center justify-center text-2xl transition-all hover:scale-110 hover:border-white/30 disabled:opacity-40"
              >
                ✕
              </button>
              <button
                onClick={handleLike}
                disabled={actionLoading}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #FF4D6D, #FF8147)',
                  boxShadow: '0 0 30px rgba(255,77,109,0.5)',
                }}
              >
                ♥
              </button>
              <button
                className="w-14 h-14 rounded-full bg-[#1C1C28] border border-white/10 flex items-center justify-center text-xl transition-all hover:scale-110 hover:border-white/30"
              >
                ⭐
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-5xl mb-4">🌊</div>
          <h2 className="text-white font-bold text-xl mb-2">No more profiles</h2>
          <p className="text-[#8884A8] text-sm">Come back later for new people nearby.</p>
        </div>
      )}
    </main>
  )
}