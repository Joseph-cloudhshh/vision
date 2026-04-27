import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(
  fileUrl: string,
  folder: string = 'visionforge',
  resourceType: 'image' | 'video' = 'image'
): Promise<{ url: string; thumbnailUrl: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileUrl, {
    folder,
    resource_type: resourceType,
    transformation:
      resourceType === 'image'
        ? [{ quality: 'auto', fetch_format: 'auto' }]
        : undefined,
  })

  const thumbnailUrl =
    resourceType === 'video'
      ? cloudinary.url(result.public_id, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [{ width: 400, height: 300, crop: 'fill' }],
        })
      : cloudinary.url(result.public_id, {
          transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
        })

  return {
    url: result.secure_url,
    thumbnailUrl,
    publicId: result.public_id,
  }
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export async function getStorageUsage(): Promise<number> {
  try {
    const result = await cloudinary.api.usage()
    return result.storage?.usage || 0
  } catch {
    return 0
  }
}

export default cloudinary
