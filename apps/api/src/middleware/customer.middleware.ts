import { Response, NextFunction } from "express"

export const customerMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({ message: "Forbidden. Customer role required." })
  }
  next()
}
