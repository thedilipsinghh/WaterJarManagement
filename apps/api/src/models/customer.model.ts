import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./auth.model"
import { vendors } from "./vendor.model"

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "cascade" }).notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  serviceStatus: text("service_status").default("active").notNull(), // 'active' | 'stopped'
  monthlyRate: integer("monthly_rate").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'delivered' | 'cancelled'
  deliveryDate: timestamp("delivery_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "cascade" }).notNull(),
  month: text("month").notNull(), // 'YYYY-MM'
  amount: integer("amount").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'paid'
  jarQuantity: integer("jar_quantity").notNull(),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const monthlyUsage = pgTable("monthly_usage", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
  month: text("month").notNull(), // 'YYYY-MM'
  jarQuantity: integer("jar_quantity").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [customers.vendorId],
    references: [vendors.id],
  }),
  orders: many(orders),
  bills: many(bills),
  monthlyUsage: many(monthlyUsage),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  vendor: one(vendors, {
    fields: [orders.vendorId],
    references: [vendors.id],
  }),
}))

export const billsRelations = relations(bills, ({ one }) => ({
  customer: one(customers, {
    fields: [bills.customerId],
    references: [customers.id],
  }),
  vendor: one(vendors, {
    fields: [bills.vendorId],
    references: [vendors.id],
  }),
}))

export const monthlyUsageRelations = relations(monthlyUsage, ({ one }) => ({
  customer: one(customers, {
    fields: [monthlyUsage.customerId],
    references: [customers.id],
  }),
}))
