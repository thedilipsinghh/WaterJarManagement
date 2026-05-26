"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetMeQuery } from "../../store/api/baseApi"
import {
  useGetCustomerOrdersQuery,
  useCreateCustomerOrderMutation,
  useGetCustomerBillsQuery,
  useGetCustomerSpendingQuery,
  useRequestStopServiceMutation,
  usePayBillMutation,
} from "../../store/api/customer.api"
import SidebarLayout from "../../components/SidebarLayout"
import { useToast } from "../../components/Toast"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"

export default function CustomerDashboard() {
  const router = useRouter()
  const { showToast } = useToast()
  const { data: meData, isLoading: meLoading, isError: meError } = useGetMeQuery()
  const [activeTab, setActiveTab] = useState("orders")

  // API Queries & Mutations
  const { data: ordersData, refetch: refetchOrders } = useGetCustomerOrdersQuery(undefined, {
    skip: activeTab !== "orders",
  })
  const { data: billsData, refetch: refetchBills } = useGetCustomerBillsQuery(undefined, {
    skip: activeTab !== "bills",
  })
  const { data: spendingData, refetch: refetchSpending } = useGetCustomerSpendingQuery(undefined, {
    skip: activeTab !== "spending",
  })

  const [createOrder] = useCreateCustomerOrderMutation()
  const [requestStopService, { isLoading: isStopping }] = useRequestStopServiceMutation()
  const [payBill, { isLoading: isPaying }] = usePayBillMutation()

  // Form state
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [orderForm, setOrderForm] = useState({
    quantity: "1",
    deliveryDate: "2026-05-24",
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

  if (meError || !meData?.result?.user || meData.result.user.role !== "customer") {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    return null
  }

  const customerName = meData.result.user.name
  const serviceStatus = meData.result.detail?.serviceStatus || "active"

  // Handlers
  const handleAddOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createOrder({
        quantity: Number(orderForm.quantity),
        deliveryDate: new Date(orderForm.deliveryDate).toISOString(),
      }).unwrap()
      setShowAddOrder(false)
      setOrderForm({ quantity: "1", deliveryDate: "2026-05-24" })
      refetchOrders()
      showToast("Order submitted to vendor successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to place order", "error")
    }
  }

  const handleStopService = async () => {
    if (!confirm("Are you sure you want to request service suspension? Deliveries will be paused and your vendor will be notified.")) return
    try {
      await requestStopService().unwrap()
      showToast("Service suspension request submitted successfully!", "success")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      showToast(err.data?.message || "Failed to submit request", "error")
    }
  }

  const handlePayBill = async (billId: number) => {
    try {
      await payBill(billId).unwrap()
      showToast("Payment completed successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to process payment", "error")
    }
  }

  return (
    <SidebarLayout
      role="customer"
      userName={customerName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* Top Banner Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subscription Status</span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              serviceStatus === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {serviceStatus === "active" ? "Active (Receiving Deliveries)" : "Suspended (Deliveries Paused)"}
            </span>
          </div>
        </div>
        {serviceStatus === "active" && (
          <Button
            onClick={handleStopService}
            disabled={isStopping}
            variant="destructive"
            size="sm"
          >
            Request Stop Service
          </Button>
        )}
      </div>

      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">Delivery Orders History</h2>
              <p className="text-sm text-slate-500 font-sans">Track your delivery scheduling and status.</p>
            </div>
            {serviceStatus === "active" && (
              <Button onClick={() => setShowAddOrder(true)}>
                Request Delivery
              </Button>
            )}
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersData?.result?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
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
                  </TableRow>
                ))}
                {(!ordersData?.result || ordersData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No delivery orders found. Request a jar delivery to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add Order Dialog Modal */}
          <Dialog open={showAddOrder} onOpenChange={setShowAddOrder}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Request Jar Delivery</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddOrderSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Quantity (Jars count)</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    placeholder="e.g. 2"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Preferred Delivery Date</Label>
                  <Input
                    type="text"
                    required
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddOrder(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Submit Order</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activeTab === "bills" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900 font-sans">Invoices & Bills</h2>
            <p className="text-sm text-slate-500 font-sans">View your invoice amounts and outstanding balances.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Jars Quantity</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billsData?.result?.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono text-xs">{bill.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{bill.month}</TableCell>
                    <TableCell>{bill.jarQuantity} jars</TableCell>
                    <TableCell className="font-semibold text-slate-950">₹{bill.amount}</TableCell>
                    <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        bill.status === "paid" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {bill.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {bill.status === "pending" && (
                        <Button
                          onClick={() => handlePayBill(bill.id)}
                          disabled={isPaying}
                          size="sm"
                        >
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!billsData?.result || billsData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No invoices found. Outstanding bills will display here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "spending" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900 font-sans">Spending Analysis</h2>
            <p className="text-sm text-slate-500 font-sans">Monthly aggregation of jar consumption and payments.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 font-sans">Consumption History</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Billing Month</TableHead>
                  <TableHead className="px-4">Jars Consumed</TableHead>
                  <TableHead className="px-4">Total Amount Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spendingData?.result?.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4 font-semibold text-slate-700">{s.month}</TableCell>
                    <TableCell className="px-4 font-mono">{s.jarQuantity} Jars</TableCell>
                    <TableCell className="px-4 font-bold text-slate-900">₹{s.totalSpent}</TableCell>
                  </TableRow>
                ))}
                {(!spendingData?.result || spendingData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="px-4 py-6 text-center text-slate-400">
                      No spending records found. Consume and pay bills to generate report.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
