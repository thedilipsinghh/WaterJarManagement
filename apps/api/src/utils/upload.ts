import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { env } from "../config/env"

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

// Memory storage is ideal for serverless or container-based deployments
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

/**
 * Uploads a file buffer directly to Cloudinary
 */
export const uploadToCloudinary = async (fileBuffer: Buffer, folder = "waterjar"): Promise<string> => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.warn("Cloudinary credentials missing, returning placeholder image URL")
    return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400"
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error)
          return reject(error)
        }
        resolve(result?.secure_url || "")
      }
    )
    uploadStream.end(fileBuffer)
  })
}
