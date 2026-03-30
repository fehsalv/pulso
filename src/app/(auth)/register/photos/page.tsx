 'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PhotosPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.slice(0, 6 - photos.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 6))
  }

  const removePhoto = (i: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const handleUpload = async () => {
    if (photos.length < 2) {
      setError('Upload at least 2 photos to continue.')
      return
    }
    setUploading(true)
    setError('')
    try {
      for (const photo of photos) {
        const formData = new FormData()
        formData.append('photo', photo.file)
        const res = await fetch('/api/photos', { method: 'POST', body: formData })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Error uploading photo')
          return
        }
      }
      router.push('/explore')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#12121A] border border-white/5 rounded-2xl p-7">
        <h1 className="text-xl font-bold text-white mb-1">Your profile photos</h1>
        <p className="text-[#8884A8] text-sm mb-6">
          Upload <span className="text-white font-medium">at least 2 photos</span> to activate your profile.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {Array.from({ length: 6 }).map((_, i) => {
            const photo = photos[i]
            return (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#1C1C28] border border-white/10 flex items-center justify-center relative">
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-[#FF4D6D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">Cover</span>
                    )}
                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full text-xs flex items-center justify-center">×</button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-1 text-[#8884A8] hover:text-white w-full h-full justify-center">
                    <span className="text-xl">+</span>
                    <span className="text-[10px]">{i < 2 ? 'Required' : 'Optional'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-[#8884A8] text-center mb-4">
          {photos.length}/6 photos · {photos.length < 2 ? `${2 - photos.length} more needed` : 'Ready!'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">{error}</div>
        )}

        <button
          onClick={handleUpload}
          disabled={photos.length < 2 || uploading}
          className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8147)' }}
        >
          {uploading ? 'Uploading...' : 'Activate my profile →'}
        </button>
      </div>
    </main>
  )
}
