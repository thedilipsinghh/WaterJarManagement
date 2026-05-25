import { Request, Response } from "express"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import db from "../config/db"
import { users } from "../models/auth.model"
import { vendors } from "../models/vendor.model"
import { customers } from "../models/customer.model"

export class AdminController {
  // Vendors CRUD
  async listVendors(req: Request, res: Response) {
    try {
      const result = await db.select({
        id: vendors.id,
        userId: vendors.userId,
        name: users.name,
        email: users.email,
        companyName: vendors.companyName,
        phone: vendors.phone,
        address: vendors.address,
        status: users.status,
        createdAt: vendors.createdAt,
      }).from(vendors).innerJoin(users, eq(vendors.userId, users.id))

      res.status(200).json({ message: "Vendors list fetched success", result, })

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Unable to fetch vendors" })
    }
  }

  async createVendor(req: Request, res: Response) {
    try {
      const { name, email, password, companyName, phone, address } = req.body

      if (!name || !email || !password || !companyName) {
        return res.status(400).json({ message: "Name, email, password and company name are required." })
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
            role: "vendor",
            status: "active",
          })
          .returning()

        const [insertedVendor] = await tx
          .insert(vendors)
          .values({
            userId: insertedUser.id,
            companyName,
            phone: phone || "",
            address: address || "",
          })
          .returning()

        return { ...insertedVendor, name: insertedUser.name, email: insertedUser.email }
      })

      res.status(201).json({
        message: "Vendor created successfully",
        result,
      })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: error.message || "Unable to create vendor" })
    }
  }

  async updateVendor(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { name, companyName, phone, address, status } = req.body

      const vendorRecord = await db.select().from(vendors).where(eq(vendors.id, Number(id))).limit(1)
      if (vendorRecord.length === 0) {
        return res.status(404).json({ message: "Vendor not found" })
      }

      const vendor = vendorRecord[0]

      await db.transaction(async (tx) => {
        if (name || status) {
          await tx
            .update(users)
            .set({
              ...(name && { name }),
              ...(status && { status }),
              updatedAt: new Date(),
            })
            .where(eq(users.id, vendor.userId))
        }

        await tx
          .update(vendors)
          .set({
            ...(companyName && { companyName }),
            ...(phone && { phone }),
            ...(address && { address }),
            updatedAt: new Date(),
          })
          .where(eq(vendors.id, vendor.id))
      })

      res.status(200).json({
        message: "Vendor updated successfully",
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Unable to update vendor" })
    }
  }

  async deleteVendor(req: Request, res: Response) {
    try {
      const { id } = req.params

      const vendorRecord = await db.select().from(vendors).where(eq(vendors.id, Number(id))).limit(1)
      if (vendorRecord.length === 0) {
        return res.status(404).json({ message: "Vendor not found" })
      }

      const vendor = vendorRecord[0]

      // Delete user which will cascade delete vendor
      await db.delete(users).where(eq(users.id, vendor.userId))

      res.status(200).json({
        message: "Vendor deleted successfully",
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Unable to delete vendor" })
    }
  }

  // Customers CRUD
  async listCustomers(req: Request, res: Response) {
    try {
      const result = await db
        .select({
          id: customers.id,
          userId: customers.userId,
          vendorId: customers.vendorId,
          name: users.name,
          email: users.email,
          phone: customers.phone,
          address: customers.address,
          deliveryAddress: customers.deliveryAddress,
          serviceStatus: customers.serviceStatus,
          monthlyRate: customers.monthlyRate,
          status: users.status,
          vendorCompanyName: vendors.companyName,
          createdAt: customers.createdAt,
        })
        .from(customers)
        .innerJoin(users, eq(customers.userId, users.id))
        .innerJoin(vendors, eq(customers.vendorId, vendors.id))

      res.status(200).json({
        message: "Customers list fetched success",
        result,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Unable to fetch customers" })
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      const { name, email, password, vendorId, phone, address, deliveryAddress, monthlyRate } = req.body

      if (!name || !email || !password || !vendorId) {
        return res.status(400).json({ message: "Name, email, password and vendor ID are required." })
      }

      // Check if vendor exists
      const vendorRecord = await db.select().from(vendors).where(eq(vendors.id, Number(vendorId))).limit(1)
      if (vendorRecord.length === 0) {
        return res.status(400).json({ message: "Invalid vendor ID." })
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
            vendorId: Number(vendorId),
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
      const { id } = req.params
      const { name, phone, address, deliveryAddress, monthlyRate, serviceStatus, status } = req.body

      const customerRecord = await db.select().from(customers).where(eq(customers.id, Number(id))).limit(1)
      if (customerRecord.length === 0) {
        return res.status(404).json({ message: "Customer not found" })
      }

      const customer = customerRecord[0]

      await db.transaction(async (tx) => {
        if (name || status) {
          await tx
            .update(users)
            .set({
              ...(name && { name }),
              ...(status && { status }),
              updatedAt: new Date(),
            })
            .where(eq(users.id, customer.userId))
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
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Unable to update customer" })
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params

      const customerRecord = await db.select().from(customers).where(eq(customers.id, Number(id))).limit(1)
      if (customerRecord.length === 0) {
        return res.status(404).json({ message: "Customer not found" })
      }

      const customer = customerRecord[0]

      // Delete user which will cascade delete customer
      await db.delete(users).where(eq(users.id, customer.userId))

      res.status(200).json({
        message: "Customer deleted successfully",
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Unable to delete customer" })
    }
  }

  // Toggle Block/Unblock Status for User
  async toggleUserBlockStatus(req: Request, res: Response) {
    try {
      const { id } = req.params // This is userId
      const { status } = req.body // 'active' | 'blocked'

      if (status !== "active" && status !== "blocked") {
        return res.status(400).json({ message: "Invalid status value. Use 'active' or 'blocked'." })
      }

      const userRecord = await db.select().from(users).where(eq(users.id, Number(id))).limit(1)
      if (userRecord.length === 0) {
        return res.status(404).json({ message: "User not found" })
      }

      await db
        .update(users)
        .set({ status, updatedAt: new Date() })
        .where(eq(users.id, Number(id)))

      res.status(200).json({
        message: `User status changed to ${status}`,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Unable to change user status" })
    }
  }
}

export const adminController = new AdminController()
export default adminController
