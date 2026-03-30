'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid credentials')
        return
      }

      router.push(data.redirectTo || '/explore')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-black tracking-tight text-[#FF4D6D]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            PULSO
          </h1>
          <p className="text-[#8884A8] text-sm mt-2">Connect with your energy</p>
        </div>

        <div className="bg-[#12121A] border border-white/5 rounded-2xl p-7">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-[#8884A8] text-sm mb-6">Sign in to your account.</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#8884A8] mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-[#8884A8]">Password</label>
                <a href="/forgot-password" className="text-xs text-[#FF4D6D] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FF4D6D, #FF8147)',
                boxShadow: '0 8px 24px rgba(255,77,109,0.35)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-xs text-[#8884A8]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#FF4D6D] hover:underline font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#8884A8] mt-6">
          Platform exclusively for users 18 and older
        </p>
      </div>
    </main>
  )
}