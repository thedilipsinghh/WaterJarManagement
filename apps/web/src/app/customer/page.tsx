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
} from "../../store/api/customer.api"
import SidebarLayout from "../../components/SidebarLayout"
import { useToast } from "../../components/Toast"

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

  return (
    <SidebarLayout
      role="customer"
      userName={customerName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* Top Banner Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
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
          <button
            onClick={handleStopService}
            disabled={isStopping}
            className="rounded border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Request Stop Service
          </button>
        )}
      </div>

      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Delivery Orders History</h2>
              <p className="text-sm text-slate-500 font-sans">Track your delivery scheduling and status.</p>
            </div>
            {serviceStatus === "active" && (
              <button
                onClick={() => setShowAddOrder(true)}
                className="rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
              >
                Request Delivery
              </button>
            )}
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Delivery Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersData?.result?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
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
                  </tr>
                ))}
                {(!ordersData?.result || ordersData.result.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No delivery orders found. Request a jar delivery to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Order Modal */}
          {showAddOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Request Jar Delivery</h3>
                <form onSubmit={handleAddOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Quantity (Jars count)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                      className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                      placeholder="e.g. 2"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Preferred Delivery Date</label>
                    <input
                      type="text"
                      required
                      value={orderForm.deliveryDate}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                      className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddOrder(false)}
                      className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Submit Order
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
            <h2 className="text-xl font-bold text-slate-900">Invoices & Bills</h2>
            <p className="text-sm text-slate-500 font-sans">View your invoice amounts and outstanding balances.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Jars Quantity</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billsData?.result?.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{bill.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{bill.month}</td>
                    <td className="px-6 py-4">{bill.jarQuantity} jars</td>
                    <td className="px-6 py-4 font-semibold text-slate-950">₹{bill.amount}</td>
                    <td className="px-6 py-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
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
                {(!billsData?.result || billsData.result.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No invoices found. Outstanding bills will display here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "spending" && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-slate-900">Spending Analysis</h2>
            <p className="text-sm text-slate-500 font-sans">Monthly aggregation of jar consumption and payments.</p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Consumption History</h3>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b">
                <tr>
                  <th className="px-4 py-2">Billing Month</th>
                  <th className="px-4 py-2">Jars Consumed</th>
                  <th className="px-4 py-2">Total Amount Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {spendingData?.result?.map((s, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-semibold text-slate-700">{s.month}</td>
                    <td className="px-4 py-3 font-mono">{s.jarQuantity} Jars</td>
                    <td className="px-4 py-3 font-bold text-slate-900">₹{s.totalSpent}</td>
                  </tr>
                ))}
                {(!spendingData?.result || spendingData.result.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                      No spending records found. Consume and pay bills to generate report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
