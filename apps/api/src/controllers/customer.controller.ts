import { Request, Response } from "express"
import { eq, and, sql } from "drizzle-orm"
import db from "../config/db"
import { notifications } from "../models/auth.model"
import { vendors } from "../models/vendor.model"
import { customers, orders, bills, monthlyUsage } from "../models/customer.model"

export class CustomerController {
  private async getCustomerByUserId(userId: number) {
    const list = await db.select().from(customers).where(eq(customers.userId, userId)).limit(1)
    if (list.length === 0) {
      throw new Error("Customer profile not found.")
    }
    return list[0]
  }

  async listOrders(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const customer = await this.getCustomerByUserId(authUser.id)

      const result = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, customer.id))
        .orderBy(sql`${orders.deliveryDate} desc`)

      res.status(200).json({
        message: "Orders fetched success",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch orders" })
    }
  }

  async listMonthlyOrders(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const customer = await this.getCustomerByUserId(authUser.id)

      // Get current month dates
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const endOfMonth = new Date(startOfMonth)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)

      const result = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.customerId, customer.id),
            sql`${orders.deliveryDate} >= ${startOfMonth}::timestamp`,
            sql`${orders.deliveryDate} < ${endOfMonth}::timestamp`
          )
        )
        .orderBy(sql`${orders.deliveryDate} desc`)

      res.status(200).json({
        message: "Monthly orders fetched success",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch monthly orders" })
    }
  }

  async listBills(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const customer = await this.getCustomerByUserId(authUser.id)

      const result = await db
        .select()
        .from(bills)
        .where(eq(bills.customerId, customer.id))
        .orderBy(sql`${bills.createdAt} desc`)

      res.status(200).json({
        message: "Bills fetched success",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch bills" })
    }
  }

  async requestStopService(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const customer = await this.getCustomerByUserId(authUser.id)

      // Get Vendor user ID to send notification
      const vendorRecord = await db.select().from(vendors).where(eq(vendors.id, customer.vendorId)).limit(1)
      if (vendorRecord.length === 0) {
        return res.status(404).json({ message: "Associated vendor profile not found." })
      }

      const vendor = vendorRecord[0]

      await db.transaction(async (tx) => {
        // Stop service status
        await tx
          .update(customers)
          .set({ serviceStatus: "stopped", updatedAt: new Date() })
          .where(eq(customers.id, customer.id))

        // Create alert for vendor
        await tx.insert(notifications).values({
          userId: vendor.userId,
          title: "Service Cancellation Alert",
          message: `Customer ${authUser.name} has requested to stop service deliveries.`,
          read: false,
        })
      })

      res.status(200).json({
        message: "Service cancellation request filed. deliveries have been suspended.",
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to request service suspension" })
    }
  }

  async getSpending(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const customer = await this.getCustomerByUserId(authUser.id)

      const result = await db
        .select({
          month: monthlyUsage.month,
          jarQuantity: monthlyUsage.jarQuantity,
          totalSpent: monthlyUsage.totalSpent,
        })
        .from(monthlyUsage)
        .where(eq(monthlyUsage.customerId, customer.id))
        .orderBy(sql`${monthlyUsage.month} desc`)

      res.status(200).json({
        message: "Monthly spending fetched success",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch spending details" })
    }
  }

  async payBill(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const customer = await this.getCustomerByUserId(authUser.id)
      const { id } = req.params // bill.id

      const billRecord = await db
        .select()
        .from(bills)
        .where(and(eq(bills.id, Number(id)), eq(bills.customerId, customer.id)))
        .limit(1)

      if (billRecord.length === 0) {
        return res.status(404).json({ message: "Bill not found or access denied." })
      }

      const bill = billRecord[0]

      if (bill.status === "paid") {
        return res.status(400).json({ message: "Bill is already paid." })
      }

      // Get Vendor user ID to send notification
      const vendorRecord = await db.select().from(vendors).where(eq(vendors.id, bill.vendorId)).limit(1)
      if (vendorRecord.length === 0) {
        return res.status(404).json({ message: "Associated vendor profile not found." })
      }
      const vendor = vendorRecord[0]

      await db.transaction(async (tx) => {
        await tx
          .update(bills)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(bills.id, bill.id))

        // Create alert for vendor
        await tx.insert(notifications).values({
          userId: vendor.userId,
          title: "Payment Received Alert",
          message: `Customer ${authUser.name} has paid the bill for ${bill.month} of amount ₹${bill.amount}.`,
          read: false,
        })
      })

      res.status(200).json({
        message: "Payment successful. Invoice updated to Paid.",
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to complete payment" })
    }
  }

  // Create order function (useful for customer app to request a delivery)
  async createOrder(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const customer = await this.getCustomerByUserId(authUser.id)
      const { quantity, deliveryDate } = req.body

      if (!quantity || !deliveryDate) {
        return res.status(400).json({ message: "Quantity and delivery date are required." })
      }

      if (customer.serviceStatus === "stopped") {
        return res.status(400).json({ message: "Your delivery service is suspended. Please resume service first." })
      }

      const [newOrder] = await db
        .insert(orders)
        .values({
          customerId: customer.id,
          vendorId: customer.vendorId,
          quantity: Number(quantity),
          deliveryDate: new Date(deliveryDate),
          status: "pending",
        })
        .returning()

      res.status(201).json({
        message: "Delivery order created successfully",
        result: newOrder,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to create order" })
    }
  }
}

export const customerController = new CustomerController()
export default customerController
