'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Match {
  matchId: string
  user: {
    id: string
    name: string
    vibe: string
    coverPhoto: string | null
  }
  lastMessage: {
    content: string
    isOwn: boolean
    createdAt: string
  } | null
  createdAt: string
}

const VIBE_EMOJI: Record<string, string> = {
  ENCENDIDO: '🔥',
  TRANQUILO: '🌿',
  CREATIVO: '🎨',
  SOCIAL: '🎉',
}

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => setMatches(data.matches || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0F] p-4">
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-black text-[#FF4D6D]"
              style={{ fontFamily: 'Syne, sans-serif' }}>
            Matches
          </h1>
          <button
            onClick={() => router.push('/explore')}
            className="text-[#8884A8] text-sm hover:text-white transition-colors"
          >
            Explore →
          </button>
        </div>

        {loading ? (
          <div className="text-[#8884A8] text-sm text-center mt-12">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="text-center mt-16">
            <div className="text-5xl mb-4">💫</div>
            <h2 className="text-white font-bold text-xl mb-2">No matches yet</h2>
            <p className="text-[#8884A8] text-sm mb-6">
              Keep exploring and liking profiles to get your first match.
            </p>
            <button
              onClick={() => router.push('/explore')}
              className="px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
            >
              Go explore
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((match) => (
              <button
                key={match.matchId}
                onClick={() => router.push(`/chat/${match.matchId}`)}
                className="flex items-center gap-4 bg-[#12121A] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all text-left w-full"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1C1C28]">
                    {match.user.coverPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={match.user.coverPhoto}
                        alt={match.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#FF4D6D] font-bold text-xl">
                        {match.user.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-sm">
                    {VIBE_EMOJI[match.user.vibe]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white font-semibold text-sm">{match.user.name}</span>
                    {match.lastMessage && (
                      <span className="text-[#8884A8] text-xs">
                        {new Date(match.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[#8884A8] text-xs truncate">
                    {match.lastMessage
                      ? `${match.lastMessage.isOwn ? 'You: ' : ''}${match.lastMessage.content}`
                      : "It's a match! Say hello 👋"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}