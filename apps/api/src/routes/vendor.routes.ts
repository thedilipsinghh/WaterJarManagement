import { Router } from "express"
import { vendorController } from "../controllers/vendor.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { vendorMiddleware } from "../middleware/vendor.middleware"

const router = Router()

router.use(authMiddleware, vendorMiddleware)

router.get("/customers", vendorController.listCustomers.bind(vendorController))
router.post("/customers", vendorController.createCustomer.bind(vendorController))
router.put("/customers/:id", vendorController.updateCustomer.bind(vendorController))
router.delete("/customers/:id", vendorController.deleteCustomer.bind(vendorController))
router.patch("/customers/:id/status", vendorController.toggleCustomerStatus.bind(vendorController))
router.patch("/customers/:id/service", vendorController.toggleCustomerService.bind(vendorController))

router.post("/bills", vendorController.sendMonthlyBill.bind(vendorController))
router.get("/stats", vendorController.getStats.bind(vendorController))
router.get("/jar-usage", vendorController.getJarUsage.bind(vendorController))
router.get("/reports", vendorController.getReports.bind(vendorController))
router.get("/orders", vendorController.listOrders.bind(vendorController))
router.patch("/orders/:id/deliver", vendorController.deliverOrder.bind(vendorController))

export default router
