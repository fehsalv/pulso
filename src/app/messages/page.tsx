'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DirectMessage {
  id: string
  content: string
  isOwn: boolean
  read: boolean
  createdAt: string
  from: {
    id: string
    name: string
    coverPhoto: string | null
  }
  to: {
    id: string
    name: string
    coverPhoto: string | null
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/direct-messages')
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .finally(() => setLoading(false))
  }, [])

  const received = messages.filter((m) => !m.isOwn)
  const sent = messages.filter((m) => m.isOwn)

  return (
    <main className="min-h-screen bg-[#0A0A0F] pb-24">
      <div className="max-w-sm mx-auto p-4">

        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-black text-[#FF4D6D]"
              style={{ fontFamily: 'Syne, sans-serif' }}>
            Direct messages
          </h1>
        </div>

        {loading ? (
          <div className="text-center text-[#8884A8] text-sm py-12">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💌</div>
            <p className="text-white font-semibold mb-1">No messages yet</p>
            <p className="text-[#8884A8] text-sm mb-6">
              Go to the online area and send a message to someone.
            </p>
            <button
              onClick={() => router.push('/online')}
              className="px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
            >
              See who&apos;s online
            </button>
          </div>
        ) : (
          <div>
            {/* Received */}
            {received.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-[#8884A8] uppercase tracking-wider font-medium mb-3">
                  Received
                </p>
                <div className="flex flex-col gap-2">
                  {received.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => router.push(`/messages/${msg.from.id}`)}
                      className="flex items-start gap-3 bg-[#12121A] border rounded-2xl p-4 transition-all cursor-pointer hover:border-white/20"
                      style={{ borderColor: msg.read ? 'rgba(255,255,255,0.05)' : 'rgba(255,77,109,0.3)' }}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1C1C28] flex-shrink-0">
                        {msg.from.coverPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={msg.from.coverPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#FF4D6D] font-bold text-sm">
                            {msg.from.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-sm">{msg.from.name}</span>
                          <div className="flex items-center gap-2">
                            {!msg.read && <span className="w-2 h-2 rounded-full bg-[#FF4D6D]" />}
                            <span className="text-[#8884A8] text-xs">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-[#8884A8] text-sm truncate">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent */}
            {sent.length > 0 && (
              <div>
                <p className="text-xs text-[#8884A8] uppercase tracking-wider font-medium mb-3">
                  Sent
                </p>
                <div className="flex flex-col gap-2">
                  {sent.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => router.push(`/messages/${msg.to.id}`)}
                      className="flex items-start gap-3 bg-[#12121A] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1C1C28] flex-shrink-0">
                        {msg.to.coverPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={msg.to.coverPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#FF4D6D] font-bold text-sm">
                            {msg.to.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-sm">To: {msg.to.name}</span>
                          <span className="text-[#8884A8] text-xs">
                            {msg.read ? '✓✓ Read' : '✓ Sent'}
                          </span>
                        </div>
                        <p className="text-[#8884A8] text-sm truncate">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}