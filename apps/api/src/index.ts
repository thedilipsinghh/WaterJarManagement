import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { env } from "./config/env"
import authRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"
import vendorRoutes from "./routes/vendor.routes"
import customerRoutes from "./routes/customer.routes"

const app = express()
const PORT = Number(env.PORT) || 5000

// CORS setup supporting credentials (critical for cookie authentication)
const allowedOrigins = [
  env.LOCAL_URL,
  "http://localhost:3000",
  "http://localhost:19006", // expo web if testing
  env.FRONTEND_URL
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req, _res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.url} - IP: ${req.ip}`)
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy",
    result: {
      status: "UP",
      timestamp: new Date().toISOString(),
    }
  })
})

// Route registration
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/vendor", vendorRoutes)
app.use("/api/customer", customerRoutes)

// Centralized error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Error Exception:", err)
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred on the server.",
  })
})

app.listen(PORT, () => {
  console.log(`[API] Server is running on port ${PORT} in ${env.NODE_ENV} mode`)
})

export default app
