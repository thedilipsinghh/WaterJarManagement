export type UserRole = "admin" | "vendor" | "customer";
export type UserStatus = "active" | "blocked";
export type ServiceStatus = "active" | "stopped";
export type OrderStatus = "pending" | "delivered" | "cancelled";
export type BillStatus = "pending" | "paid";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: number;
  userId: number;
  companyName: string;
  phone: string;
  address: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  userId: number;
  vendorId: number;
  phone: string;
  address: string;
  deliveryAddress: string;
  serviceStatus: ServiceStatus;
  monthlyRate: number;
  user?: User;
  vendor?: Vendor;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  customerId: number;
  vendorId: number;
  quantity: number;
  status: OrderStatus;
  deliveryDate: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: number;
  customerId: number;
  vendorId: number;
  month: string;
  amount: number;
  status: BillStatus;
  jarQuantity: number;
  dueDate: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyUsage {
  id: number;
  customerId: number;
  month: string;
  jarQuantity: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// API Response Wrappers
export interface ApiResponse<T = any> {
  message: string;
  result?: T;
}

// Authentication DTOs
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Admin / Vendor CRUD Payloads
export interface CreateVendorPayload {
  name: string;
  email: string;
  password?: string;
  companyName: string;
  phone: string;
  address: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  password?: string;
  vendorId: number;
  phone: string;
  address: string;
  deliveryAddress: string;
  monthlyRate: number;
}

export interface CreateOrderPayload {
  customerId: number;
  quantity: number;
  deliveryDate: string;
}

export interface CreateBillPayload {
  customerId: number;
  month: string; // YYYY-MM
  amount: number;
  jarQuantity: number;
  dueDate: string;
}

export interface DashboardStats {
  totalVendors?: number;
  totalCustomers: number;
  totalOrders: number;
  totalPendingOrders: number;
  totalRevenue?: number;
  activeCustomers?: number;
  stoppedCustomers?: number;
}
