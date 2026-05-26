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
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"

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
            <p className="text-sm text-slate-500 font-sans">Summary metrics for your delivery route.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Customers</span>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-2xl font-semibold text-slate-900">{statsData?.result?.totalCustomers || 0}</p>
              </CardContent>
            </Card>
            {/* Metric 2 */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-2xl font-semibold text-slate-900">{statsData?.result?.activeCustomers || 0}</p>
              </CardContent>
            </Card>
            {/* Metric 3 */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Orders</span>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-2xl font-semibold text-slate-900">{statsData?.result?.totalPendingOrders || 0}</p>
              </CardContent>
            </Card>
            {/* Metric 4 */}
            <Card className="border-slate-200 bg-white">
              <CardHeader className="p-5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue (Paid Bills)</span>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-2xl font-semibold text-slate-950">₹{statsData?.result?.totalRevenue || 0}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900 font-sans">Delivery Requests</h2>
            <p className="text-sm text-slate-500 font-sans font-sans">
              Manage incoming water jar delivery requests from your customers.
            </p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <tbody className="divide-y divide-slate-100">
                {ordersData?.result?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-slate-900">{order.customerName}</TableCell>
                    <TableCell>{order.phone || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.deliveryAddress}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{order.quantity} jars</TableCell>
                    <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "delivered" 
                          ? "bg-green-50 text-green-700" 
                          : order.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "pending" && (
                        <Button
                          onClick={() => handleDeliverOrder(order.id)}
                          disabled={isDelivering}
                          size="sm"
                        >
                          Deliver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!ordersData?.result || ordersData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No delivery requests found.
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">My Subscribed Customers</h2>
              <p className="text-sm text-slate-500 font-sans">Manage client profiles, service states, and invoice alerts.</p>
            </div>
            <Button onClick={() => setShowAddCustomer(true)}>
              Onboard Customer
            </Button>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Rate (₹)</TableHead>
                  <TableHead>Service Status</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData?.result?.map((cust) => (
                  <TableRow key={cust.id}>
                    <TableCell className="font-mono text-xs">{cust.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{cust.name}</TableCell>
                    <TableCell>{cust.phone || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{cust.deliveryAddress}</TableCell>
                    <TableCell>₹{cust.monthlyRate}/jar</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        cust.serviceStatus === "active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-orange-50 text-orange-700"
                      }`}>
                        {cust.serviceStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        cust.status === "active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {cust.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        onClick={() => setShowSendBill(cust.id)}
                        variant="outline"
                        size="sm"
                      >
                        Bill
                      </Button>
                      <Button
                        onClick={() => handleToggleService(cust.id, cust.serviceStatus)}
                        variant={cust.serviceStatus === "active" ? "destructive" : "default"}
                        size="sm"
                      >
                        {cust.serviceStatus === "active" ? "Suspend" : "Resume"}
                      </Button>
                      <Button
                        onClick={() => handleToggleStatus(cust.id, cust.status)}
                        variant="outline"
                        size="sm"
                      >
                        {cust.status === "active" ? "Block" : "Unblock"}
                      </Button>
                      <Button
                        onClick={() => handleDeleteCustomer(cust.id)}
                        variant="outline"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!customersData?.result || customersData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      No customers found. Click onboarding to add customers.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add Customer Dialog Modal */}
          <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Add Customer Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      required
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      required
                      value={customerForm.password}
                      onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      placeholder="+1 555-0155"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Rate per Jar (₹)</Label>
                    <Input
                      type="number"
                      value={customerForm.monthlyRate}
                      onChange={(e) => setCustomerForm({ ...customerForm, monthlyRate: e.target.value })}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Billing Address</Label>
                    <Input
                      type="text"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      placeholder="Suite 4B"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Address</Label>
                  <Input
                    type="text"
                    value={customerForm.deliveryAddress}
                    onChange={(e) => setCustomerForm({ ...customerForm, deliveryAddress: e.target.value })}
                    placeholder="Front Porch Gate"
                  />
                </div>
                <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCustomer(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Customer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Send Bill Dialog Modal */}
          <Dialog open={showSendBill !== null} onOpenChange={(open) => !open && setShowSendBill(null)}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Generate Monthly Billing Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendBillSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Billing Month</Label>
                    <Input
                      type="text"
                      required
                      value={billForm.month}
                      onChange={(e) => setBillForm({ ...billForm, month: e.target.value })}
                      placeholder="YYYY-MM"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due Date</Label>
                    <Input
                      type="text"
                      required
                      value={billForm.dueDate}
                      onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Delivered Jars Qty</Label>
                    <Input
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
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total Bill Amount (₹)</Label>
                    <Input
                      type="number"
                      required
                      value={billForm.amount}
                      onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                      placeholder="150"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSendBill(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Send & Register Bill</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activeTab === "bills" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900 font-sans">Billing Log & History</h2>
            <p className="text-sm text-slate-500 font-sans">Historic record of all registered client bills.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Jars Count</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportsData?.result?.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono text-xs">{bill.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{bill.customerName}</TableCell>
                    <TableCell>{bill.month}</TableCell>
                    <TableCell>{bill.jarQuantity} jars</TableCell>
                    <TableCell className="font-medium text-slate-950">₹{bill.amount}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        bill.status === "paid" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {bill.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!reportsData?.result || reportsData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No bills found. Create a bill from the customer menu first.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900 font-sans">Reports & Analytics</h2>
            <p className="text-sm text-slate-500 font-sans font-sans">Monthly aggregate reports of jar volume usage.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 font-sans">Delivered Volume Aggregation</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Billing Calendar Month</TableHead>
                    <TableHead className="px-4">Total Jars Count Delivered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageData?.result?.map((u, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-4 font-semibold text-slate-700">{u.month}</TableCell>
                      <TableCell className="px-4 font-mono">{u.quantity} Jars</TableCell>
                    </TableRow>
                  ))}
                  {(!usageData?.result || usageData.result.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={2} className="px-4 py-6 text-center text-slate-400">
                        No delivery data available. Log delivered orders in database.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
