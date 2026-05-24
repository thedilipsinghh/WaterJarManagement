import path from "path"
import dotenv from "dotenv"

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
})

export const PRODUCTION = "production"

export const env = {
  JWT_KEY: process.env.JWT_KEY || "change-me",
  JWT_SECRET: process.env.JWT_SECRET || process.env.JWT_KEY || "change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_KEY || "change-me-refresh",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  PG_URL: process.env.PG_URL as string,
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  LIVE_URL: process.env.LIVE_URL || "",
  LOCAL_URL: process.env.LOCAL_URL || "http://localhost:3000",
  OTP_EXPIRY: process.env.OTP_EXPIRY as string,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
  PRODUCTION: "production",
  COOKIE_NAME: "USER",
  FRONTEND_URL:
    process.env.NODE_ENV === "production"
      ? (process.env.LIVE_URL as string)
      : (process.env.LOCAL_URL as string)
}
