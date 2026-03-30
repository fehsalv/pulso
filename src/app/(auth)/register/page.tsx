'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Tipos ──────────────────────────────────────────────
interface FormData {
  nombre: string
  email: string
  password: string
  fechaNacimiento: string
  ciudad: string
}

interface FotoPreview {
  file: File
  preview: string
}

type Paso = 1 | 2 | 3

// ── Componente principal ───────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Paso 1 — datos personales
  const [form, setForm] = useState<FormData>({
    nombre: '',
    email: '',
    password: '',
    fechaNacimiento: '',
    ciudad: '',
  })

  // Paso 2 — fotos
  const [fotos, setFotos] = useState<FotoPreview[]>([])
  const [uploading, setUploading] = useState(false)

  // ── Handlers paso 1 ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleStep1 = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrar')
        return
      }

      setUserId(data.user.id)
      setPaso(2)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── Handlers paso 2 ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const nuevas = files.slice(0, 6 - fotos.length)

    const previews = nuevas.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setFotos((prev) => [...prev, ...previews].slice(0, 6))
    setError('')
  }

  const removeFoto = (index: number) => {
    setFotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleStep2 = async () => {
    if (fotos.length < 2) {
      setError('Debes subir al menos 2 fotografías para continuar.')
      return
    }

    setUploading(true)
    setError('')

    try {
      for (const foto of fotos) {
        const formData = new FormData()
        formData.append('foto', foto.file)

        const res = await fetch('/api/fotos', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Error al subir una foto')
          return
        }
      }

      setPaso(3)
    } catch {
      setError('Error al subir las fotos. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  // ── Paso 3 — vibe inicial ──
  const vibes = [
    { id: 'ENCENDIDO', emoji: '🔥', nombre: 'Encendido/a', desc: 'Listo para aventuras' },
    { id: 'TRANQUILO', emoji: '🌿', nombre: 'Tranquilo/a', desc: 'Conversación profunda' },
    { id: 'CREATIVO', emoji: '🎨', nombre: 'Creativo/a', desc: 'Ideas y proyectos' },
    { id: 'SOCIAL', emoji: '🎉', nombre: 'Social', desc: 'Planes y salidas' },
  ]
  const [vibeSeleccionado, setVibeSeleccionado] = useState('SOCIAL')

  const handleStep3 = async () => {
    setLoading(true)
    try {
      await fetch('/api/perfil/vibe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: vibeSeleccionado }),
      })
      router.push('/explorar')
    } catch {
      router.push('/explorar')
    } finally {
      setLoading(false)
    }
  }

  // ── Calcular si es mayor de 18 ──
  const esValidoStep1 =
    form.nombre.length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.fechaNacimiento !== ''

  // ── Render ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-[#FF4D6D]"
              style={{ fontFamily: 'Syne, sans-serif' }}>
            PULSO
          </h1>
          <p className="text-[#8884A8] text-sm mt-1">Solo para mayores de 18 años</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {([1, 2, 3] as Paso[]).map((n) => (
            <div
              key={n}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ background: n <= paso ? '#FF4D6D' : '#1C1C28' }}
            />
          ))}
        </div>

        <div className="bg-[#12121A] border border-white/5 rounded-2xl p-7">

          {/* ── PASO 1: Datos personales ── */}
          {paso === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Crea tu cuenta</h2>
              <p className="text-[#8884A8] text-sm mb-6">Rápido y sin tarjeta de crédito.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-[#8884A8] mb-1 block">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#8884A8] mb-1 block">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#8884A8] mb-1 block">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
                  />
                  <p className="text-xs text-[#8884A8] mt-1">Incluye mayúsculas y números</p>
                </div>

                <div>
                  <label className="text-xs text-[#8884A8] mb-1 block">
                    Fecha de nacimiento <span className="text-[#FF4D6D]">(debes ser mayor de 18)</span>
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0]}
                    className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#8884A8] mb-1 block">Ciudad (opcional)</label>
                  <input
                    type="text"
                    name="ciudad"
                    placeholder="Ej: Ciudad de México"
                    value={form.ciudad}
                    onChange={handleChange}
                    className="w-full bg-[#1C1C28] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF4D6D]/60 transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleStep1}
                  disabled={!esValidoStep1 || loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #FF4D6D, #FF8147)',
                    boxShadow: esValidoStep1 ? '0 8px 24px rgba(255,77,109,0.35)' : 'none',
                  }}
                >
                  {loading ? 'Creando cuenta...' : 'Continuar →'}
                </button>

                <p className="text-center text-xs text-[#8884A8]">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-[#FF4D6D] hover:underline">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ── PASO 2: Fotos ── */}
          {paso === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Tus fotos</h2>
              <p className="text-[#8884A8] text-sm mb-6">
                Sube <span className="text-white font-medium">mínimo 2 fotos</span> reales y recientes.
                Hasta 6 en total.
              </p>

              {/* Grid de fotos */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {Array.from({ length: 6 }).map((_, i) => {
                  const foto = fotos[i]
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden relative bg-[#1C1C28] border border-white/10 flex items-center justify-center"
                    >
                      {foto ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={foto.preview}
                            alt={`Foto ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {i === 0 && (
                            <span className="absolute top-1 left-1 bg-[#FF4D6D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              Portada
                            </span>
                          )}
                          <button
                            onClick={() => removeFoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-black"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-1 text-[#8884A8] hover:text-white transition-colors w-full h-full justify-center">
                          <span className="text-xl">+</span>
                          <span className="text-[10px]">
                            {i < 2 ? 'Requerida' : 'Opcional'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                            multiple={false}
                          />
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Indicador de progreso */}
              <div className="flex items-center gap-2 mb-5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all"
                    style={{ background: i < fotos.length ? '#FF4D6D' : '#1C1C28' }}
                  />
                ))}
              </div>
              <p className="text-xs text-[#8884A8] mb-5 text-center">
                {fotos.length}/6 fotos · {fotos.length < 2 ? `Faltan ${2 - fotos.length} más` : '¡Listo!'}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleStep2}
                disabled={fotos.length < 2 || uploading}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #FF4D6D, #FF8147)',
                  boxShadow: fotos.length >= 2 ? '0 8px 24px rgba(255,77,109,0.35)' : 'none',
                }}
              >
                {uploading ? 'Subiendo fotos...' : `Continuar con ${fotos.length} foto${fotos.length !== 1 ? 's' : ''} →`}
              </button>
            </div>
          )}

          {/* ── PASO 3: Vibe inicial ── */}
          {paso === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">¿Cómo te sientes hoy?</h2>
              <p className="text-[#8884A8] text-sm mb-6">
                Tu <span className="text-[#FF4D6D]">Modo Pulso</span> define a quién te mostramos hoy.
                Puedes cambiarlo cuando quieras.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {vibes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVibeSeleccionado(v.id)}
                    className="p-4 rounded-xl border text-left transition-all duration-200"
                    style={{
                      background: vibeSeleccionado === v.id ? 'rgba(255,77,109,0.08)' : '#1C1C28',
                      borderColor: vibeSeleccionado === v.id ? 'rgba(255,77,109,0.5)' : 'rgba(255,255,255,0.07)',
                      boxShadow: vibeSeleccionado === v.id ? '0 0 20px rgba(255,77,109,0.15)' : 'none',
                    }}
                  >
                    <span className="text-2xl block mb-1">{v.emoji}</span>
                    <div className="text-sm font-semibold text-white">{v.nombre}</div>
                    <div className="text-xs text-[#8884A8] mt-0.5">{v.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleStep3}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #FF4D6D, #FF8147)',
                  boxShadow: '0 8px 24px rgba(255,77,109,0.35)',
                }}
              >
                {loading ? 'Entrando a PULSO...' : '¡Empezar a conocer gente! 🔥'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#8884A8] mt-6">
          Al registrarte aceptas nuestros{' '}
          <a href="/terminos" className="text-[#FF4D6D] hover:underline">Términos de uso</a>
          {' '}y la{' '}
          <a href="/privacidad" className="text-[#FF4D6D] hover:underline">Política de privacidad</a>.
        </p>
      </div>
    </main>
  )
}
