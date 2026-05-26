"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetMeQuery } from "../../store/api/baseApi"
import {
  useGetVendorCustomersQuery,
  useCreateVendorCustomerMutation,
  useDeleteVendorCustomerMutation,
  useToggleCustomerStatusMutation,
  useToggleCustomerServiceMutation,
  useSendBillMutation,
  useGetVendorStatsQuery,
  useGetVendorJarUsageQuery,
  useGetVendorReportsQuery,
  useGetVendorOrdersQuery,
  useDeliverOrderMutation,
} from "../../store/api/vendor.api"
import SidebarLayout from "../../components/SidebarLayout"
import { useToast } from "../../components/Toast"

export default function VendorDashboard() {
  const router = useRouter()
  const { showToast } = useToast()
  const { data: meData, isLoading: meLoading, isError: meError } = useGetMeQuery()
  const [activeTab, setActiveTab] = useState("stats")

  // API Queries & Mutations
  const { data: statsData, refetch: refetchStats } = useGetVendorStatsQuery(undefined, {
    skip: activeTab !== "stats",
  })
  const { data: customersData, refetch: refetchCustomers } = useGetVendorCustomersQuery(undefined, {
    skip: activeTab !== "customers",
  })
  const { data: reportsData, refetch: refetchReports } = useGetVendorReportsQuery(undefined, {
    skip: activeTab !== "bills" && activeTab !== "reports",
  })
  const { data: usageData, refetch: refetchUsage } = useGetVendorJarUsageQuery(undefined, {
    skip: activeTab !== "reports",
  })
  const { data: ordersData, refetch: refetchOrders } = useGetVendorOrdersQuery(undefined, {
    skip: activeTab !== "orders",
  })

  const [createCustomer] = useCreateVendorCustomerMutation()
  const [deleteCustomer] = useDeleteVendorCustomerMutation()
  const [toggleStatus] = useToggleCustomerStatusMutation()
  const [toggleService] = useToggleCustomerServiceMutation()
  const [sendBill] = useSendBillMutation()
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation()

  // Modals state
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showSendBill, setShowSendBill] = useState<number | null>(null) // customerId

  // Forms state
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    deliveryAddress: "",
    monthlyRate: "15",
  })

  const [billForm, setBillForm] = useState({
    month: "2026-05",
    amount: "",
    jarQuantity: "",
    dueDate: "2026-06-05",
  })

  if (meLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Checking credentials...</p>
        </div>
      </div>
    )
  }

  if (meError || !meData?.result?.user || meData.result.user.role !== "vendor") {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    return null
  }

  const vendorName = meData.result.user.name

  // Handlers
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCustomer({
        ...customerForm,
        monthlyRate: Number(customerForm.monthlyRate),
      }).unwrap()
      setShowAddCustomer(false)
      setCustomerForm({ name: "", email: "", password: "", phone: "", address: "", deliveryAddress: "", monthlyRate: "15" })
      refetchCustomers()
      showToast("Customer profile created successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to add customer", "error")
    }
  }

  const handleSendBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showSendBill) return
    try {
      await sendBill({
        customerId: showSendBill,
        month: billForm.month,
        amount: Number(billForm.amount),
        jarQuantity: Number(billForm.jarQuantity),
        dueDate: billForm.dueDate,
      }).unwrap()
      setShowSendBill(null)
      setBillForm({ month: "2026-05", amount: "", jarQuantity: "", dueDate: "2026-06-05" })
      refetchReports()
      showToast("Billing invoice issued successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to create invoice", "error")
    }
  }

  const handleToggleStatus = async (customerId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "blocked" : "active"
    try {
      await toggleStatus({ id: customerId, status: nextStatus }).unwrap()
      refetchCustomers()
      showToast(`Customer account status updated to ${nextStatus}`, "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to change account status", "error")
    }
  }

  const handleToggleService = async (customerId: number, currentService: string) => {
    const nextService = currentService === "active" ? "stopped" : "active"
    try {
      await toggleService({ id: customerId, serviceStatus: nextService }).unwrap()
      refetchCustomers()
      showToast(`Service delivery status updated to ${nextService}`, "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to change service status", "error")
    }
  }

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    try {
      await deleteCustomer(id).unwrap()
      refetchCustomers()
      showToast("Customer deleted successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to delete customer", "error")
    }
  }

  const handleDeliverOrder = async (orderId: number) => {
    try {
      await deliverOrder(orderId).unwrap()
      showToast("Order marked as delivered successfully!", "success")
      refetchOrders()
    } catch (err: any) {
      showToast(err.data?.message || "Failed to mark order as delivered", "error")
    }
  }

  return (
    <SidebarLayout
      role="vendor"
      userName={vendorName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900 font-sans">Business Dashboard</h2>
            <p className="text-sm text-slate-500">Summary metrics for your delivery route.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Customers</span>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{statsData?.result?.totalCustomers || 0}</p>
            </div>
            {/* Metric 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{statsData?.result?.activeCustomers || 0}</p>
            </div>
            {/* Metric 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Orders</span>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{statsData?.result?.totalPendingOrders || 0}</p>
            </div>
            {/* Metric 4 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue (Paid Bills)</span>
              <p className="text-2xl font-semibold text-slate-950 mt-1">₹{statsData?.result?.totalRevenue || 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900 font-sans">Delivery Requests</h2>
            <p className="text-sm text-slate-500">
              Manage incoming water jar delivery requests from your customers.
            </p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Delivery Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersData?.result?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{order.customerName}</td>
                    <td className="px-6 py-4">{order.phone || "-"}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{order.deliveryAddress}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{order.quantity} jars</td>
                    <td className="px-6 py-4">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "delivered" 
                          ? "bg-green-50 text-green-700" 
                          : order.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleDeliverOrder(order.id)}
                          disabled={isDelivering}
                          className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          Deliver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!ordersData?.result || ordersData.result.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No delivery requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Subscribed Customers</h2>
              <p className="text-sm text-slate-500">Manage client profiles, service states, and invoice alerts.</p>
            </div>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
            >
              Onboard Customer
            </button>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Rate (₹)</th>
                  <th className="px-6 py-4">Service Status</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersData?.result?.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{cust.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{cust.name}</td>
                    <td className="px-6 py-4">{cust.phone || "-"}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{cust.deliveryAddress}</td>
                    <td className="px-6 py-4">₹{cust.monthlyRate}/jar</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        cust.serviceStatus === "active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-orange-50 text-orange-700"
                      }`}>
                        {cust.serviceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        cust.status === "active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setShowSendBill(cust.id)}
                        className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Bill
                      </button>
                      <button
                        onClick={() => handleToggleService(cust.id, cust.serviceStatus)}
                        className={`rounded px-2 py-1 text-xs font-medium border ${
                          cust.serviceStatus === "active"
                            ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {cust.serviceStatus === "active" ? "Suspend" : "Resume"}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cust.id, cust.status)}
                        className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        {cust.status === "active" ? "Block" : "Unblock"}
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(cust.id)}
                        className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(!customersData?.result || customersData.result.length === 0) && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      No customers found. Click onboarding to add customers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Customer Modal */}
          {showAddCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Add Customer Profile</h3>
                <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={customerForm.password}
                        onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone</label>
                      <input
                        type="text"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="+1 555-0155"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rate per Jar (₹)</label>
                      <input
                        type="number"
                        value={customerForm.monthlyRate}
                        onChange={(e) => setCustomerForm({ ...customerForm, monthlyRate: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Billing Address</label>
                      <input
                        type="text"
                        value={customerForm.address}
                        onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="Suite 4B"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={customerForm.deliveryAddress}
                      onChange={(e) => setCustomerForm({ ...customerForm, deliveryAddress: e.target.value })}
                      className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                      placeholder="Front Porch Gate"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddCustomer(false)}
                      className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Save Customer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Send Bill Modal */}
          {showSendBill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Generate Monthly Billing Invoice</h3>
                <form onSubmit={handleSendBillSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Billing Month</label>
                      <input
                        type="text"
                        required
                        value={billForm.month}
                        onChange={(e) => setBillForm({ ...billForm, month: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="YYYY-MM"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Due Date</label>
                      <input
                        type="text"
                        required
                        value={billForm.dueDate}
                        onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Delivered Jars Qty</label>
                      <input
                        type="number"
                        required
                        value={billForm.jarQuantity}
                        onChange={(e) => {
                          const qty = Number(e.target.value)
                          const rate = Number(customersData?.result?.find(c => c.id === showSendBill)?.monthlyRate || 15)
                          setBillForm({ 
                            ...billForm, 
                            jarQuantity: e.target.value,
                            amount: String(qty * rate)
                          })
                        }}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Bill Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={billForm.amount}
                        onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="150"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowSendBill(null)}
                      className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Send & Register Bill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "bills" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900">Billing Log & History</h2>
            <p className="text-sm text-slate-500 font-sans">Historic record of all registered client bills.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Bill ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Jars Count</th>
                  <th className="px-6 py-4">Amount Due</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportsData?.result?.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{bill.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{bill.customerName}</td>
                    <td className="px-6 py-4">{bill.month}</td>
                    <td className="px-6 py-4">{bill.jarQuantity} jars</td>
                    <td className="px-6 py-4 font-medium text-slate-950">₹{bill.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        bill.status === "paid" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!reportsData?.result || reportsData.result.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No bills found. Create a bill from the customer menu first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900">Reports & Analytics</h2>
            <p className="text-sm text-slate-500">Monthly aggregate reports of jar volume usage.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Delivered Volume Aggregation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b">
                  <tr>
                    <th className="px-4 py-2">Billing Calendar Month</th>
                    <th className="px-4 py-2">Total Jars Count Delivered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usageData?.result?.map((u, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-semibold text-slate-700">{u.month}</td>
                      <td className="px-4 py-3 font-mono">{u.quantity} Jars</td>
                    </tr>
                  ))}
                  {(!usageData?.result || usageData.result.length === 0) && (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                        No delivery data available. Log delivered orders in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
