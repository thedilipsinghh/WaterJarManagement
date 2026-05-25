import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "admin" | "vendor" | "customer";
    name: string;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token = ""

  // 1. Authorization header takes highest priority
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]
  }

  // 2. Fall back to role-specific cookies based on custom X-User-Role header
  if (!token) {
    const roleHeader = req.headers["x-user-role"] as string
    if (roleHeader) {
      token = req.cookies[`accessToken_${roleHeader}`]
    }
  }

  // 3. Fall back to role-specific cookies based on request path
  if (!token) {
    const path = req.baseUrl || req.path
    if (path.includes("/customer")) {
      token = req.cookies["accessToken_customer"]
    } else if (path.includes("/vendor")) {
      token = req.cookies["accessToken_vendor"]
    } else if (path.includes("/admin")) {
      token = req.cookies["accessToken_admin"]
    }
  }

  // 4. Fall back to global cookies if still not found
  if (!token) {
    token = req.cookies[env.COOKIE_NAME] || req.cookies["accessToken"]
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Token not found." })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any
    ;(req as any).user = decoded
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(401).json({ message: "Unauthorized. Invalid or expired token." })
  }
}
