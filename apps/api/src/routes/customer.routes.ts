import { Router } from "express"
import { customerController } from "../controllers/customer.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { customerMiddleware } from "../middleware/customer.middleware"

const router = Router()

router.use(authMiddleware, customerMiddleware)

router.get("/orders", customerController.listOrders.bind(customerController))
router.get("/orders/monthly", customerController.listMonthlyOrders.bind(customerController))
router.post("/orders", customerController.createOrder.bind(customerController))
router.get("/bills", customerController.listBills.bind(customerController))
router.post("/service-requests/stop", customerController.requestStopService.bind(customerController))
router.get("/spending", customerController.getSpending.bind(customerController))

export default router
