'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string
  email: string
  bio: string | null
  vibe: string
  city: string | null
  plan: string
  allowDirectMessages: boolean
  photos: { id: string; url: string; isCover: boolean }[]
}

const VIBE_OPTIONS = [
  { id: 'ENCENDIDO', emoji: '🔥', label: 'Lit up' },
  { id: 'TRANQUILO', emoji: '🌿', label: 'Chill' },
  { id: 'CREATIVO', emoji: '🎨', label: 'Creative' },
  { id: 'SOCIAL', emoji: '🎉', label: 'Social' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [vibe, setVibe] = useState('SOCIAL')
  const [allowDM, setAllowDM] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile)
          setBio(data.profile.bio || '')
          setCity(data.profile.city || '')
          setVibe(data.profile.vibe)
          setAllowDM(data.profile.allowDirectMessages ?? true)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, city, vibe, allowDirectMessages: allowDM }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-[#8884A8] text-sm">Loading profile...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] pb-24">
      <div className="max-w-sm mx-auto p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-black text-[#FF4D6D]"
              style={{ fontFamily: 'Syne, sans-serif' }}>
            Profile
          </h1>
          <button
            onClick={handleLogout}
            className="text-[#8884A8] text-sm hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Plan badge */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: profile?.plan === 'FREE'
                ? 'rgba(136,132,168,0.15)'
                : 'rgba(255,77,109,0.15)',
              color: profile?.plan === 'FREE' ? '#8884A8' : '#FF4D6D',
              border: `1px solid ${profile?.plan === 'FREE' ? 'rgba(136,132,168,0.3)' : 'rgba(255,77,109,0.3)'}`,
            }}
          >
            {profile?.plan === 'FREE' ? 'Free plan' : `PULSO ${profile?.plan}`}
          </div>
          {profile?.plan === 'FREE' && (
            <button className="text-xs text-[#FF4D6D] hover:underline">
              Upgrade →
            </button>
          )}
        </div>

        {/* Photos */}
        <div className="mb-6">
          <p className="text-xs text-[#8884A8] mb-2 font-medium uppercase tracking-wider">Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {profile?.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-[#1C1C28] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                {photo.isCover && (
                  <span className="absolute top-1 left-1 bg-[#FF4D6D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {(profile?.photos.length || 0) < 6 && (
              <button
                onClick={() => router.push('/register/photos')}
                className="aspect-square rounded-xl bg-[#1C1C28] border border-white/10 flex items-center justify-center text-[#8884A8] hover:text-white transition-colors"
              >
                <span className="text-2xl">+</span>
              </button>
            )}
          </div>
        </div>

        {/* Vibe */}
        <div className="mb-6">
          <p className="text-xs text-[#8884A8] mb-2 font-medium uppercase tracking-wider">Today&apos;s vibe</p>
          <div className="grid grid-cols-2 gap-2">
            {VIBE_OPTIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVibe(v.id)}
                className="p-3 rounded-xl border text-left transition-all"
                style={{
                  background: vibe === v.id ? 'rgba(255,77,109,0.08)' : '#12121A',
                  borderColor: vibe === v.id ? 'rgba(255,77,109,0.5)' : 'rgba(255,255,255,0.07)',
                }}
              >
                <span className="text-lg">{v.emoji}</span>
                <p className="text-white text-xs font-medium mt-1">{v.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <p className="text-xs text-[#8884A8] mb-2 font-medium uppercase tracking-wider">Bio</p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people about yourself..."
            maxLength={200}
            rows={3}
            className="w-full bg-[#12121A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors resize-none"
          />
          <p className="text-xs text-[#8884A8] text-right mt-1">{bio.length}/200</p>
        </div>

        {/* City */}
        <div className="mb-6">
          <p className="text-xs text-[#8884A8] mb-2 font-medium uppercase tracking-wider">City</p>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Your city (optional)"
            className="w-full bg-[#12121A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
          />
        </div>

        {/* Privacy */}
        <div className="mb-6">
          <p className="text-xs text-[#8884A8] mb-3 font-medium uppercase tracking-wider">Privacy</p>
          <div className="bg-[#12121A] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Allow direct messages</p>
              <p className="text-[#8884A8] text-xs mt-0.5">
                Let people message you without a match
              </p>
            </div>
            <button
              onClick={() => setAllowDM((prev) => !prev)}
              className="relative w-11 h-6 rounded-full transition-all flex-shrink-0 ml-4"
              style={{
                background: allowDM ? '#FF4D6D' : '#1C1C28',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: allowDM ? '22px' : '2px' }}
              />
            </button>
          </div>
        </div>

        {/* Messages inbox link */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/messages')}
            className="w-full bg-[#12121A] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">💌</span>
              <p className="text-white text-sm font-medium">Direct messages inbox</p>
            </div>
            <span className="text-[#8884A8] text-sm">→</span>
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </div>
    </main>
  )
}