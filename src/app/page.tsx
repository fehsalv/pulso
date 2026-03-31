'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const VIBE_OPTIONS = [
  { id: 'ENCENDIDO', emoji: '🔥', name: 'Lit up', desc: 'Ready for adventures' },
  { id: 'TRANQUILO', emoji: '🌿', name: 'Chill', desc: 'Deep conversation' },
  { id: 'CREATIVO', emoji: '🎨', name: 'Creative', desc: 'Ideas and projects' },
  { id: 'SOCIAL', emoji: '🎉', name: 'Social', desc: 'Plans and outings' },
]

export default function HomePage() {
  const router = useRouter()
  const [activeVibe, setActiveVibe] = useState(0)
  const [likesUsed, setLikesUsed] = useState(7)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVibe((prev) => (prev + 1) % VIBE_OPTIONS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0F] overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
           style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-2xl font-black text-[#FF4D6D]" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em' }}>
          PULSO
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/login')}
            className="text-[#8884A8] text-sm font-medium hover:text-white transition-colors">
            Sign in
          </button>
          <button onClick={() => router.push('/register')}
            className="text-white text-sm font-medium px-4 py-2 rounded-full"
            style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}>
            Sign up free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16"
               style={{ background: 'radial-gradient(ellipse 60% 55% at 80% 20%, rgba(255,77,109,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(255,179,71,0.12) 0%, transparent 65%)' }}>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
             style={{ background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.3)' }}>
          <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" />
          <span className="text-[#FF8FA3] text-xs font-medium uppercase tracking-widest">18+ only · Free to join</span>
        </div>

        <h1 className="font-black leading-none tracking-tight mb-6"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(3rem, 10vw, 6rem)', letterSpacing: '-0.04em' }}>
          Meet people<br />
          <span className="text-[#FF4D6D]">with your</span><br />
          <span className="text-[#8884A8]">energy.</span>
        </h1>

        <p className="text-[#8884A8] text-lg max-w-md mb-10 leading-relaxed">
          Not just photos — PULSO connects people by how they feel <em className="text-white not-italic">today</em>.
          Real, authentic, free to start.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => router.push('/register')}
            className="text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)', boxShadow: '0 0 40px rgba(255,77,109,0.4)' }}>
            Create my profile — free
          </button>
          <button onClick={() => router.push('/login')}
            className="text-white font-medium px-8 py-4 rounded-full text-lg transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            Sign in
          </button>
        </div>
      </section>

      {/* STATS */}
      <div className="flex justify-center gap-12 flex-wrap py-8 px-6"
           style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#12121A' }}>
        {[
          { num: '100%', label: 'Verified profiles' },
          { num: '18+', label: 'Adults only' },
          { num: '2 photos', label: 'Required to register' },
          { num: 'Free', label: 'To get started' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-black" style={{ fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg, #FF4D6D, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {s.num}
            </div>
            <div className="text-[#8884A8] text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* PULSO MODE FEATURE */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-[#FF4D6D] mb-3">What makes us different</div>
            <h2 className="font-black leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em' }}>
              Your energy attracts<br />the <span className="text-[#FF4D6D]">right people.</span>
            </h2>
            <p className="text-[#8884A8] leading-relaxed mb-6">
              Every morning you choose your vibe. The algorithm filters and prioritizes profiles that share your same rhythm at that moment. Nothing like it exists.
            </p>
            <div className="flex flex-wrap gap-2">
              {['⚡ Daily vibe', '🔒 Verified adults', '🎯 No bots', '🔥 Daily like limit'].map((chip) => (
                <span key={chip} className="text-xs px-3 py-1.5 rounded-full text-[#8884A8]"
                      style={{ background: '#1C1C28', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Vibe selector demo */}
          <div className="bg-[#12121A] rounded-2xl p-6" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-semibold text-white mb-4">How are you feeling today?</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {VIBE_OPTIONS.map((v, i) => (
                <div key={v.id} onClick={() => setActiveVibe(i)}
                     className="p-3 rounded-xl cursor-pointer transition-all"
                     style={{
                       background: activeVibe === i ? 'rgba(255,77,109,0.08)' : '#1C1C28',
                       border: `1px solid ${activeVibe === i ? 'rgba(255,77,109,0.5)' : 'rgba(255,255,255,0.07)'}`,
                       boxShadow: activeVibe === i ? '0 0 20px rgba(255,77,109,0.15)' : 'none',
                     }}>
                  <span className="text-2xl block mb-1">{v.emoji}</span>
                  <div className="text-white text-xs font-semibold">{v.name}</div>
                  <div className="text-[#8884A8] text-xs mt-0.5">{v.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl"
                 style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.25)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg, #3a2060, #602040)' }}>✨</div>
              <div>
                <p className="text-[#8884A8] text-xs">PULSO match suggestion</p>
                <p className="text-[#FF4D6D] font-bold text-sm">{VIBE_OPTIONS[activeVibe].emoji} {VIBE_OPTIONS[activeVibe].name} match</p>
                <p className="text-[#8884A8] text-xs">Sofia J. · 28 years · 2.1 km</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIKES DEMO */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-[#12121A] rounded-2xl p-6" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-semibold text-white mb-4">Your likes today</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} onClick={() => setLikesUsed(i + 1)}
                     className="w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all"
                     style={{
                       background: i < likesUsed ? '#FF4D6D' : '#1C1C28',
                       boxShadow: i < likesUsed ? '0 0 12px rgba(255,77,109,0.4)' : 'none',
                       color: i < likesUsed ? 'white' : '#8884A8',
                       border: i < likesUsed ? 'none' : '1px solid rgba(255,255,255,0.07)',
                     }}>
                  {i < likesUsed ? '♥' : i - likesUsed + 1}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#8884A8] mb-4">
              {likesUsed}/10 likes used · resets at midnight
            </p>
            <div className="p-3 rounded-xl text-xs text-[#FFB347]"
                 style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)' }}>
              ⭐ With PULSO+ you get unlimited likes and see who liked you first.
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-[#FF4D6D] mb-3">Freemium model</div>
            <h2 className="font-black leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em' }}>
              Free to connect.<br /><span className="text-[#FF4D6D]">Premium to</span> take off.
            </h2>
            <p className="text-[#8884A8] leading-relaxed">
              10 daily likes are enough to find something real. If you want more speed, more visibility and more features, PULSO+ gives you that.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="font-black mb-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em' }}>
            No surprises.<br />No tricks.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              name: 'FREE', price: '$0', period: 'forever, no card needed',
              features: ['Complete profile', '10 likes per day', 'Chat on match', 'Basic Pulso Mode'],
              locked: ['See who liked you', 'Unlimited likes', 'Featured profile'],
              featured: false,
            },
            {
              name: 'PULSO+', price: '$99', period: 'MXN / month',
              features: ['Everything in Free', 'Unlimited likes', 'See who liked you', 'Full Pulso Mode', 'Featured profile 1x/week', 'Advanced filters'],
              locked: [],
              featured: true,
            },
            {
              name: 'GOLD', price: '$199', period: 'MXN / month',
              features: ['Everything in PULSO+', 'Daily top pick', 'Incognito mode', 'Profile stats', 'Gold badge'],
              locked: [],
              featured: false,
              gold: true,
            },
          ].map((plan) => (
            <div key={plan.name} className="rounded-2xl p-6"
                 style={{
                   background: plan.featured ? 'linear-gradient(160deg, rgba(255,77,109,0.08) 0%, #12121A 100%)' : '#12121A',
                   border: plan.featured ? '1px solid rgba(255,77,109,0.5)' : '1px solid rgba(255,255,255,0.07)',
                   boxShadow: plan.featured ? '0 0 40px rgba(255,77,109,0.12)' : 'none',
                 }}>
              {plan.featured && (
                <span className="text-xs font-semibold text-white px-3 py-1 rounded-full mb-3 inline-block"
                      style={{ background: '#FF4D6D' }}>Most popular</span>
              )}
              <div className="text-[#8884A8] text-sm font-semibold mb-1">{plan.name}</div>
              <div className="font-black text-4xl mb-1" style={{ fontFamily: 'Syne, sans-serif', color: plan.gold ? '#E8C97E' : plan.featured ? '#FF4D6D' : 'white' }}>
                {plan.price}
              </div>
              <div className="text-[#8884A8] text-xs mb-5">{plan.period}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-2">
                    <span style={{ color: plan.gold ? '#E8C97E' : '#FF4D6D' }}>✓</span>
                    <span className="text-white">{f}</span>
                  </li>
                ))}
                {plan.locked.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-2 opacity-40">
                    <span className="text-[#8884A8]">✗</span>
                    <span className="text-[#8884A8]">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push('/register')}
                className="w-full py-3 rounded-full font-semibold text-sm transition-all"
                style={{
                  background: plan.featured ? 'linear-gradient(135deg, #FF4D6D, #FF8147)' : 'transparent',
                  color: plan.featured ? 'white' : plan.gold ? '#E8C97E' : '#8884A8',
                  border: plan.featured ? 'none' : `1px solid ${plan.gold ? 'rgba(232,201,126,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: plan.featured ? '0 8px 24px rgba(255,77,109,0.35)' : 'none',
                }}>
                {plan.featured ? 'Try PULSO+ 7 days free' : plan.gold ? 'Get Gold' : 'Start free'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <div className="text-center px-6 py-20" style={{ background: '#12121A', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="font-black mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em' }}>
          Ready to feel the <span className="text-[#FF4D6D]">PULSO</span>?
        </h2>
        <p className="text-[#8884A8] mb-8 max-w-sm mx-auto">
          Join today. Create your profile, upload your photos and discover people with your same energy.
        </p>
        <button onClick={() => router.push('/register')}
          className="text-white font-semibold px-10 py-4 rounded-full text-lg transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)', boxShadow: '0 0 40px rgba(255,77,109,0.4)' }}>
          Create my profile — it&apos;s free
        </button>
      </div>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#12121A' }}>
        <span className="font-black text-[#FF4D6D]" style={{ fontFamily: 'Syne, sans-serif' }}>PULSO</span>
        <div className="flex gap-6">
          {['Terms', 'Privacy', 'Safety', 'Contact'].map((l) => (
            <a key={l} href="#" className="text-[#8884A8] text-xs hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <span className="text-[#8884A8] text-xs">© 2025 PULSO · 18+ only</span>
      </footer>
    </main>
  )
}