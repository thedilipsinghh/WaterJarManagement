import { Response, NextFunction } from "express"

export const customerMiddleware = (req: any, res: Response, next: NextFunction) => {
  console.log("[Customer Middleware] User payload:", req.user)
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({ message: "Forbidden. Customer role required." })
  }
  next()
}
