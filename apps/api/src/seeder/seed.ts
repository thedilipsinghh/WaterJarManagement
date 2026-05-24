import { db, pool } from "../config/db"
import { users } from "../models/auth.model"
import { vendors } from "../models/vendor.model"
import { customers } from "../models/customer.model"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"

const seed = async () => {
  console.log("Seeding database...")
  try {
    // 1. Seed Admin
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@gmail.com"
    const adminName = process.env.SEED_ADMIN_NAME || "System Admin"
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin@123"

    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)
    if (existingAdmin.length === 0) {
      const adminPass = await bcrypt.hash(adminPassword, 10)
      await db.insert(users).values({
        name: adminName,
        email: adminEmail,
        password: adminPass,
        role: "admin",
        status: "active",
      })
      console.log(`Admin account seeded successfully: ${adminEmail} / ${adminPassword}`)
    } else {
      console.log("Admin account already exists.")
    }

    // 2. Seed Vendor
    const existingVendor = await db.select().from(users).where(eq(users.email, "vendor@waterjar.com")).limit(1)
    let vendorId = 0
    if (existingVendor.length === 0) {
      const vendorPass = await bcrypt.hash("VendorPass123!", 10)
      const [newVendorUser] = await db.insert(users).values({
        name: "Aquaflow Deliveries",
        email: "vendor@waterjar.com",
        password: vendorPass,
        role: "vendor",
        status: "active",
      }).returning()

      const [newVendor] = await db.insert(vendors).values({
        userId: newVendorUser.id,
        companyName: "Aquaflow Springs Ltd.",
        phone: "+1234567890",
        address: "123 Spring Valley Road",
      }).returning()
      vendorId = newVendor.id
      console.log("Vendor account seeded successfully: vendor@waterjar.com / VendorPass123!")
    } else {
      const v = await db.select().from(vendors).where(eq(vendors.userId, existingVendor[0].id)).limit(1)
      if (v.length > 0) vendorId = v[0].id
      console.log("Vendor account already exists.")
    }

    // 3. Seed Customer
    if (vendorId > 0) {
      const existingCustomer = await db.select().from(users).where(eq(users.email, "customer@waterjar.com")).limit(1)
      if (existingCustomer.length === 0) {
        const customerPass = await bcrypt.hash("CustomerPass123!", 10)
        const [newCustomerUser] = await db.insert(users).values({
          name: "John Doe",
          email: "customer@waterjar.com",
          password: customerPass,
          role: "customer",
          status: "active",
        }).returning()

        await db.insert(customers).values({
          userId: newCustomerUser.id,
          vendorId: vendorId,
          phone: "+1987654321",
          address: "Apartment 4B, Blue Towers",
          deliveryAddress: "Apartment 4B, Blue Towers (Front Gate)",
          monthlyRate: 15, // Cost per jar
          serviceStatus: "active",
        })
        console.log("Customer account seeded successfully: customer@waterjar.com / CustomerPass123!")
      } else {
        console.log("Customer account already exists.")
      }
    }

    console.log("Seeding process completed!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await pool.end()
  }
}

seed()
