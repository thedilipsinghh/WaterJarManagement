import { Response, NextFunction } from "express"

export const vendorMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "vendor") {
    return res.status(403).json({ message: "Forbidden. Vendor role required." })
  }
  next()
}
