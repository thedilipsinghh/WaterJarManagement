import { Router } from "express"
import { adminController } from "../controllers/admin.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { adminMiddleware } from "../middleware/admin.middleware"

const router = Router()

router.use(authMiddleware, adminMiddleware)

router.get("/vendors", adminController.listVendors.bind(adminController))
router.post("/vendors", adminController.createVendor.bind(adminController))
router.put("/vendors/:id", adminController.updateVendor.bind(adminController))
router.delete("/vendors/:id", adminController.deleteVendor.bind(adminController))

router.get("/customers", adminController.listCustomers.bind(adminController))
router.post("/customers", adminController.createCustomer.bind(adminController))
router.put("/customers/:id", adminController.updateCustomer.bind(adminController))
router.delete("/customers/:id", adminController.deleteCustomer.bind(adminController))

router.patch("/users/:id/status", adminController.toggleUserBlockStatus.bind(adminController))

export default router
