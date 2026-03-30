'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Message {
  id: string
  content: string
  isOwn: boolean
  read: boolean
  createdAt: string
}

interface MatchInfo {
  id: string
  other: {
    id: string
    name: string
    coverPhoto: string | null
  }
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string

  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`)
      const data = await res.json()
      if (res.ok) {
        setMatchInfo(data.match)
        setMessages(data.messages)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || sending) return

    setSending(true)
    const content = input.trim()
    setInput('')

    // Optimistic update
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      content,
      isOwn: true,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMessage])

    try {
      const res = await fetch(`/api/messages/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()

      if (res.ok) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.message : m))
        )
      }
    } catch (error) {
      console.error(error)
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
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

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#8884A8] text-sm">Loading chat...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-[#12121A] border-b border-white/5 sticky top-0 z-10">
        <button
          onClick={() => router.push('/matches')}
          className="text-[#8884A8] hover:text-white transition-colors text-lg"
        >
          ←
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1C1C28] flex-shrink-0">
          {matchInfo?.other.coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={matchInfo.other.coverPhoto}
              alt={matchInfo.other.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#FF4D6D] font-bold">
              {matchInfo?.other.name[0].toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <p className="text-white font-semibold text-sm">{matchInfo?.other.name}</p>
          <p className="text-[#8884A8] text-xs">Match</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-white font-semibold mb-1">Say hello!</p>
            <p className="text-[#8884A8] text-sm">
              You matched with {matchInfo?.other.name}. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  message.isOwn
                    ? 'text-white rounded-br-sm'
                    : 'bg-[#1C1C28] text-white rounded-bl-sm'
                }`}
                style={
                  message.isOwn
                    ? { background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }
                    : {}
                }
              >
                <p className="leading-relaxed">{message.content}</p>
                <p className={`text-[10px] mt-1 ${message.isOwn ? 'text-white/60 text-right' : 'text-[#8884A8]'}`}>
                  {formatTime(message.createdAt)}
                  {message.isOwn && (
                    <span className="ml-1">{message.read ? '✓✓' : '✓'}</span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#12121A] border-t border-white/5">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="flex-1 bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
          >
            ➤
          </button>
        </div>
      </div>
    </main>
  )
}