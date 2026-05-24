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
  let token = req.cookies[env.COOKIE_NAME] || req.cookies["accessToken"]

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]
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
