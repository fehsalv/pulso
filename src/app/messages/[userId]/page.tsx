'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Message {
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
}

export default function DMConversationPage() {
  const router = useRouter()
  const params = useParams()
  const targetUserId = params.userId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [targetUser, setTargetUser] = useState<{ name: string; coverPhoto: string | null } | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/direct-messages')
      const data = await res.json()
      if (res.ok) {
        const all: Message[] = data.messages || []
        const conversation = all.filter(
          (m) => m.from.id === targetUserId || (!m.isOwn && m.from.id === targetUserId) || (m.isOwn)
        )
        // Filter only messages between current user and target
        const filtered = all.filter(
          (m) => m.from.id === targetUserId || (m.isOwn)
        )
        setMessages(filtered)
        const other = all.find((m) => m.from.id === targetUserId)
        if (other) setTargetUser(other.from)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [targetUserId])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    setError('')
    const content = input.trim()
    setInput('')

    try {
      const res = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: targetUserId, content }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error sending message')
        setInput(content)
        return
      }

      setRemaining(data.remaining)
      await fetchMessages()
    } catch {
      setError('Connection error. Try again.')
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#8884A8] text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 sticky top-0 z-10"
           style={{ background: 'rgba(18,18,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => router.push('/messages')}
                className="text-[#8884A8] hover:text-white transition-colors text-xl w-8">
          ←
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1C1C28] flex-shrink-0">
          {targetUser?.coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={targetUser.coverPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#FF4D6D] font-bold">
              {targetUser?.name[0] || '?'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{targetUser?.name || 'User'}</p>
          <p className="text-[#8884A8] text-xs">{remaining} messages left today</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-2 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-white font-semibold mb-1">Start the conversation</p>
            <p className="text-[#8884A8] text-sm">Say something nice!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                style={{
                  background: msg.isOwn
                    ? 'linear-gradient(135deg, #FF4D6D, #FF8147)'
                    : '#1C1C28',
                  borderRadius: msg.isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                }}
              >
                <p className="text-white leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.isOwn ? 'text-white/60 text-right' : 'text-[#8884A8]'}`}>
                  {formatTime(msg.createdAt)}
                  {msg.isOwn && <span className="ml-1">{msg.read ? ' ✓✓' : ' ✓'}</span>}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-4 pb-6"
           style={{ background: 'rgba(18,18,26,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={remaining > 0 ? 'Write a message...' : 'No messages left today'}
            disabled={remaining <= 0}
            maxLength={500}
            className="flex-1 bg-[#1C1C28] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || remaining <= 0}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
          >
            ➤
          </button>
        </div>
        {remaining <= 3 && remaining > 0 && (
          <p className="text-xs text-[#FFB347] mt-2 text-center">
            ⚠️ Only {remaining} messages left today
          </p>
        )}
      </div>
    </main>
  )
}