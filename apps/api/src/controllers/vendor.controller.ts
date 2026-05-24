import { Request, Response } from "express"
import { eq, and, sql } from "drizzle-orm"
import bcrypt from "bcryptjs"
import db from "../config/db"
import { users } from "../models/auth.model"
import { vendors } from "../models/vendor.model"
import { customers, bills, monthlyUsage, orders } from "../models/customer.model"

export class VendorController {
  // Helper to get vendor by userId
  private async getVendorByUserId(userId: number) {
    const list = await db.select().from(vendors).where(eq(vendors.userId, userId)).limit(1)
    if (list.length === 0) {
      throw new Error("Vendor profile not found for this user.")
    }
    return list[0]
  }

  async listCustomers(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)

      const result = await db
        .select({
          id: customers.id,
          userId: customers.userId,
          name: users.name,
          email: users.email,
          phone: customers.phone,
          address: customers.address,
          deliveryAddress: customers.deliveryAddress,
          serviceStatus: customers.serviceStatus,
          monthlyRate: customers.monthlyRate,
          status: users.status,
          createdAt: customers.createdAt,
        })
        .from(customers)
        .innerJoin(users, eq(customers.userId, users.id))
        .where(eq(customers.vendorId, vendor.id))

      res.status(200).json({
        message: "Customers fetched success",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch customers" })
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)
      const { name, email, password, phone, address, deliveryAddress, monthlyRate } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." })
      }

      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User with this email already exists." })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await db.transaction(async (tx) => {
        const [insertedUser] = await tx
          .insert(users)
          .values({
            name,
            email,
            password: hashedPassword,
            role: "customer",
            status: "active",
          })
          .returning()

        const [insertedCustomer] = await tx
          .insert(customers)
          .values({
            userId: insertedUser.id,
            vendorId: vendor.id,
            phone: phone || "",
            address: address || "",
            deliveryAddress: deliveryAddress || address || "",
            monthlyRate: monthlyRate ? Number(monthlyRate) : 0,
            serviceStatus: "active",
          })
          .returning()

        return { ...insertedCustomer, name: insertedUser.name, email: insertedUser.email }
      })

      res.status(201).json({
        message: "Customer created successfully",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to create customer" })
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)
      const { id } = req.params
      const { name, phone, address, deliveryAddress, monthlyRate, serviceStatus } = req.body

      const customerRecord = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, Number(id)), eq(customers.vendorId, vendor.id)))
        .limit(1)

      if (customerRecord.length === 0) {
        return res.status(404).json({ message: "Customer not found or access denied" })
      }

      const customer = customerRecord[0]

      await db.transaction(async (tx) => {
        if (name) {
          await tx.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, customer.userId))
        }

        await tx
          .update(customers)
          .set({
            ...(phone && { phone }),
            ...(address && { address }),
            ...(deliveryAddress && { deliveryAddress }),
            ...(monthlyRate !== undefined && { monthlyRate: Number(monthlyRate) }),
            ...(serviceStatus && { serviceStatus }),
            updatedAt: new Date(),
          })
          .where(eq(customers.id, customer.id))
      })

      res.status(200).json({
        message: "Customer updated successfully",
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to update customer" })
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)
      const { id } = req.params

      const customerRecord = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, Number(id)), eq(customers.vendorId, vendor.id)))
        .limit(1)

      if (customerRecord.length === 0) {
        return res.status(404).json({ message: "Customer not found or access denied" })
      }

      const customer = customerRecord[0]

      await db.delete(users).where(eq(users.id, customer.userId))

      res.status(200).json({
        message: "Customer deleted successfully",
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to delete customer" })
    }
  }

  async toggleCustomerStatus(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)
      const { id } = req.params // customer.id
      const { status } = req.body // 'active' | 'blocked'

      if (status !== "active" && status !== "blocked") {
        return res.status(400).json({ message: "Invalid status value." })
      }

      const customerRecord = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, Number(id)), eq(customers.vendorId, vendor.id)))
        .limit(1)

      if (customerRecord.length === 0) {
        return res.status(404).json({ message: "Customer not found" })
      }

      const customer = customerRecord[0]
      await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, customer.userId))

      res.status(200).json({
        message: `Customer account status updated to ${status}`,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to change status" })
    }
  }

  async toggleCustomerService(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)
      const { id } = req.params // customer.id
      const { serviceStatus } = req.body // 'active' | 'stopped'

      if (serviceStatus !== "active" && serviceStatus !== "stopped") {
        return res.status(400).json({ message: "Invalid service status." })
      }

      const customerRecord = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, Number(id)), eq(customers.vendorId, vendor.id)))
        .limit(1)

      if (customerRecord.length === 0) {
        return res.status(404).json({ message: "Customer not found" })
      }

      await db
        .update(customers)
        .set({ serviceStatus, updatedAt: new Date() })
        .where(eq(customers.id, Number(id)))

      res.status(200).json({
        message: `Customer service status set to ${serviceStatus}`,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to update service status" })
    }
  }

  async sendMonthlyBill(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)
      const { customerId, month, amount, jarQuantity, dueDate } = req.body

      if (!customerId || !month || !amount || !jarQuantity || !dueDate) {
        return res.status(400).json({ message: "Missing required billing details." })
      }

      // Check customer belongs to this vendor
      const customerRecord = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, Number(customerId)), eq(customers.vendorId, vendor.id)))
        .limit(1)

      if (customerRecord.length === 0) {
        return res.status(404).json({ message: "Customer not found or access denied" })
      }

      const billResult = await db.transaction(async (tx) => {
        const [insertedBill] = await tx
          .insert(bills)
          .values({
            customerId: Number(customerId),
            vendorId: vendor.id,
            month,
            amount: Number(amount),
            jarQuantity: Number(jarQuantity),
            dueDate: new Date(dueDate),
            status: "pending",
          })
          .returning()

        // Sync to monthly usage
        const usageRecord = await tx
          .select()
          .from(monthlyUsage)
          .where(and(eq(monthlyUsage.customerId, Number(customerId)), eq(monthlyUsage.month, month)))
          .limit(1)

        if (usageRecord.length > 0) {
          await tx
            .update(monthlyUsage)
            .set({
              jarQuantity: Number(jarQuantity),
              totalSpent: Number(amount),
              updatedAt: new Date(),
            })
            .where(eq(monthlyUsage.id, usageRecord[0].id))
        } else {
          await tx.insert(monthlyUsage).values({
            customerId: Number(customerId),
            month,
            jarQuantity: Number(jarQuantity),
            totalSpent: Number(amount),
          })
        }

        return insertedBill
      })

      res.status(201).json({
        message: "Monthly bill created and registered successfully",
        result: billResult,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to send monthly bill" })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)

      // Total customers count
      const customersCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(eq(customers.vendorId, vendor.id))

      // Active service customers
      const activeCustomersCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(and(eq(customers.vendorId, vendor.id), eq(customers.serviceStatus, "active")))

      // Stopped service customers
      const stoppedCustomersCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(and(eq(customers.vendorId, vendor.id), eq(customers.serviceStatus, "stopped")))

      // Total orders pending/delivered
      const ordersCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.vendorId, vendor.id))

      const pendingOrdersCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(and(eq(orders.vendorId, vendor.id), eq(orders.status, "pending")))

      // Sum revenue from paid bills
      const revenueSum = await db
        .select({ total: sql<number>`sum(${bills.amount})::int` })
        .from(bills)
        .where(and(eq(bills.vendorId, vendor.id), eq(bills.status, "paid")))

      res.status(200).json({
        message: "Stats fetched success",
        result: {
          totalCustomers: customersCount[0]?.count || 0,
          activeCustomers: activeCustomersCount[0]?.count || 0,
          stoppedCustomers: stoppedCustomersCount[0]?.count || 0,
          totalOrders: ordersCount[0]?.count || 0,
          totalPendingOrders: pendingOrdersCount[0]?.count || 0,
          totalRevenue: revenueSum[0]?.total || 0,
        },
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch stats" })
    }
  }

  async getJarUsage(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)

      // Aggregate delivery counts of orders by status and date
      const result = await db
        .select({
          month: sql<string>`to_char(${orders.deliveryDate}, 'YYYY-MM')`,
          quantity: sql<number>`sum(${orders.quantity})::int`,
        })
        .from(orders)
        .where(and(eq(orders.vendorId, vendor.id), eq(orders.status, "delivered")))
        .groupBy(sql`to_char(${orders.deliveryDate}, 'YYYY-MM')`)

      res.status(200).json({
        message: "Jar usage report fetched success",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch jar usage" })
    }
  }

  async getReports(req: Request, res: Response) {
    try {
      const authUser = (req as any).user
      const vendor = await this.getVendorByUserId(authUser.id)

      // Fetch all bills with customer join info
      const billsReport = await db
        .select({
          id: bills.id,
          month: bills.month,
          amount: bills.amount,
          status: bills.status,
          jarQuantity: bills.jarQuantity,
          customerName: users.name,
        })
        .from(bills)
        .innerJoin(customers, eq(bills.customerId, customers.id))
        .innerJoin(users, eq(customers.userId, users.id))
        .where(eq(bills.vendorId, vendor.id))

      res.status(200).json({
        message: "Billing reports fetched success",
        result: billsReport,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to fetch billing reports" })
    }
  }
}

export const vendorController = new VendorController()
export default vendorController
