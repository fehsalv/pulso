import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export interface UploadResult {
  url: string
  publicId: string
}

export async function uploadProfilePhoto(
  fileBuffer: Buffer,
  userId: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `pulso/users/${userId}`,
          transformation: [
            { width: 800, height: 800, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      )
      .end(fileBuffer)
  })
}

export async function deletePhoto(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}