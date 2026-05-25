import { Request, Response } from "express"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { SignOptions } from "jsonwebtoken"
import db from "../config/db"
import { users } from "../models/auth.model"
import { vendors } from "../models/vendor.model"
import { customers } from "../models/customer.model"
import { env } from "../config/env"

export class AuthController {
  private readonly accessTokenOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  }

  private readonly refreshTokenOptions: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  }

  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, companyName, phone, address, deliveryAddress, monthlyRate, vendorId } = req.body

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Name, email, password and role are required." })
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User with this email already exists." })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user inside a transaction
      const newUser = await db.transaction(async (tx) => {
        const [insertedUser] = await tx
          .insert(users)
          .values({
            name,
            email,
            password: hashedPassword,
            role,
            status: "active",
          })
          .returning()

        if (role === "vendor") {
          await tx.insert(vendors).values({
            userId: insertedUser.id,
            companyName: companyName || `${name}'s Company`,
            phone: phone || "",
            address: address || "",
          })
        } else if (role === "customer") {
          if (!vendorId) {
            throw new Error("vendorId is required to register a customer.")
          }
          await tx.insert(customers).values({
            userId: insertedUser.id,
            vendorId: Number(vendorId),
            phone: phone || "",
            address: address || "",
            deliveryAddress: deliveryAddress || address || "",
            monthlyRate: monthlyRate ? Number(monthlyRate) : 0,
            serviceStatus: "active",
          })
        }

        return insertedUser
      })

      const { password: _, ...userWithoutPassword } = newUser

      res.status(201).json({
        message: "User registered successfully",
        result: {
          user: userWithoutPassword,
        },
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      res.status(500).json({
        message: error.message || "Unable to register user",
      })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." })
      }

      // Find user
      const userList = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (userList.length === 0) {
        return res.status(401).json({ message: "Invalid email or password." })
      }

      const user = userList[0]

      if (user.status === "blocked") {
        return res.status(403).json({ message: "Your account is blocked. Please contact admin." })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password." })
      }

      // Generate tokens
      const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name }
      const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, this.accessTokenOptions)
      const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, this.refreshTokenOptions)

      // Set cookies
      const isProduction = env.NODE_ENV === "production"
      
      // Role-specific cookies to support concurrent multi-role sessions
      res.cookie(`accessToken_${user.role}`, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      res.cookie(`refreshToken_${user.role}`, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })

      // General fallback cookies
      res.cookie(env.COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })

      const { password: _, ...userWithoutPassword } = user

      res.status(200).json({
        message: "Login successful",
        result: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        message: "Unable to login user",
      })
    }
  }

  async me(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      if (!authUser) {
        return res.status(401).json({ message: "Not authenticated" })
      }

      const userList = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1)
      if (userList.length === 0) {
        return res.status(404).json({ message: "User not found" })
      }

      const user = userList[0]
      const { password: _, ...userWithoutPassword } = user

      // Fetch supplementary info if customer or vendor
      let detail = null
      if (user.role === "vendor") {
        const vendorList = await db.select().from(vendors).where(eq(vendors.userId, user.id)).limit(1)
        if (vendorList.length > 0) {
          detail = vendorList[0]
        }
      } else if (user.role === "customer") {
        const customerList = await db.select().from(customers).where(eq(customers.userId, user.id)).limit(1)
        if (customerList.length > 0) {
          detail = customerList[0]
        }
      }

      res.status(200).json({
        message: "Profile fetch success",
        result: {
          user: userWithoutPassword,
          detail,
        },
      })
    } catch (error) {
      console.error("Fetch profile error:", error)
      res.status(500).json({
        message: "Unable to fetch user profile",
      })
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const roleHeader = req.headers["x-user-role"] as string
      let refreshToken = ""

      if (roleHeader) {
        refreshToken = req.cookies[`refreshToken_${roleHeader}`]
      }

      if (!refreshToken) {
        refreshToken = req.cookies["refreshToken"] || req.body.refreshToken
      }

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not found" })
      }

      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any
      const userList = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1)

      if (userList.length === 0) {
        return res.status(401).json({ message: "User not found" })
      }

      const user = userList[0]
      if (user.status === "blocked") {
        return res.status(403).json({ message: "Your account has been blocked." })
      }

      const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name }
      const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, this.accessTokenOptions)

      const isProduction = env.NODE_ENV === "production"

      // Set role-specific cookie
      res.cookie(`accessToken_${user.role}`, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      // General fallback cookie
      res.cookie(env.COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.status(200).json({
        message: "Token refreshed successfully",
        result: {
          accessToken,
        },
      })
    } catch (error) {
      console.error("Refresh token error:", error)
      res.status(401).json({ message: "Invalid refresh token" })
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      if (authUser && authUser.role) {
        res.clearCookie(`accessToken_${authUser.role}`)
        res.clearCookie(`refreshToken_${authUser.role}`)
      }

      res.clearCookie(env.COOKIE_NAME)
      res.clearCookie("refreshToken")
      res.status(200).json({
        message: "Logout successful",
      })
    } catch (error) {
      console.error("Logout error:", error)
      res.status(500).json({
        message: "Unable to logout",
      })
    }
  }
}

export const authController = new AuthController()
export default authController
