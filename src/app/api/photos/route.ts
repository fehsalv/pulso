import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadProfilePhoto, deletePhoto } from '@/lib/cloudinary'

const MAX_PHOTOS = 6
const MIN_PHOTOS = 2
const MAX_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG and WEBP images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json(
        { error: `Image cannot exceed ${MAX_SIZE_MB}MB` },
        { status: 400 }
      )
    }

    // Validate magic bytes
    const buffer = Buffer.from(await file.arrayBuffer())
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50
    const isWebp = buffer.slice(8, 12).toString() === 'WEBP'

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      )
    }

    // Check photo limit
    const currentCount = await prisma.photo.count({ where: { userId } })
    if (currentCount >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `You can only have up to ${MAX_PHOTOS} photos` },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadProfilePhoto(buffer, userId)

    const isCover = currentCount === 0
    const photo = await prisma.photo.create({
      data: {
        userId,
        url,
        publicId,
        orden: currentCount,
        esPortada: isCover,
      },
    })

    const totalPhotos = currentCount + 1
    if (totalPhotos >= MIN_PHOTOS) {
      await prisma.user.update({
        where: { id: userId },
        data: { perfilCompleto: true },
      })
    }

    return NextResponse.json({
      ok: true,
      photo: {
        id: photo.id,
        url: photo.url,
        isCover: photo.esPortada,
        order: photo.orden,
      },
      profileComplete: totalPhotos >= MIN_PHOTOS,
      totalPhotos,
    })
  } catch (error) {
    console.error('[UPLOAD_PHOTO]', error)
    return NextResponse.json({ error: 'Error uploading image' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const photos = await prisma.photo.findMany({
      where: { userId },
      orderBy: { orden: 'asc' },
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('[GET_PHOTOS]', error)
    return NextResponse.json({ error: 'Error fetching photos' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { photoId } = await request.json()
    if (!photoId) {
      return NextResponse.json({ error: 'photoId is required' }, { status: 400 })
    }

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId },
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const totalPhotos = await prisma.photo.count({ where: { userId } })
    if (totalPhotos <= MIN_PHOTOS) {
      return NextResponse.json(
        { error: `You must keep at least ${MIN_PHOTOS} photos` },
        { status: 400 }
      )
    }

    await deletePhoto(photo.publicId)
    await prisma.photo.delete({ where: { id: photoId } })

    if (photo.esPortada) {
      const next = await prisma.photo.findFirst({
        where: { userId },
        orderBy: { orden: 'asc' },
      })
      if (next) {
        await prisma.photo.update({
          where: { id: next.id },
          data: { esPortada: true },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE_PHOTO]', error)
    return NextResponse.json({ error: 'Error deleting photo' }, { status: 500 })
  }
}