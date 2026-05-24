"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetMeQuery } from "../../store/api/baseApi"
import { 
  useGetVendorsQuery, 
  useCreateVendorMutation, 
  useUpdateVendorMutation, 
  useDeleteVendorMutation, 
  useGetAdminCustomersQuery, 
  useCreateAdminCustomerMutation, 
  useUpdateAdminCustomerMutation, 
  useDeleteAdminCustomerMutation, 
  useToggleUserBlockMutation 
} from "../../store/api/admin.api"
import SidebarLayout from "../../components/SidebarLayout"
import { useToast } from "../../components/Toast"

export default function AdminDashboard() {
  const router = useRouter()
  const { showToast } = useToast()
  const { data: meData, isLoading: meLoading, isError: meError } = useGetMeQuery()
  const [activeTab, setActiveTab] = useState("vendors")

  // API Queries & Mutations
  const { data: vendorsData, refetch: refetchVendors } = useGetVendorsQuery(undefined, {
    skip: activeTab !== "vendors",
  })
  const { data: customersData, refetch: refetchCustomers } = useGetAdminCustomersQuery(undefined, {
    skip: activeTab !== "customers",
  })

  const [createVendor] = useCreateVendorMutation()
  const [updateVendor] = useUpdateVendorMutation()
  const [deleteVendor] = useDeleteVendorMutation()
  const [createCustomer] = useCreateAdminCustomerMutation()
  const [updateCustomer] = useUpdateAdminCustomerMutation()
  const [deleteCustomer] = useDeleteAdminCustomerMutation()
  const [toggleBlock] = useToggleUserBlockMutation()

  // Modals state
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  // Forms state
  const [vendorForm, setVendorForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
    address: "",
  })
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    password: "",
    vendorId: "",
    phone: "",
    address: "",
    deliveryAddress: "",
    monthlyRate: "",
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

  if (meError || !meData?.result?.user || meData.result.user.role !== "admin") {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    return null
  }

  const adminName = meData.result.user.name

  // Form Submit Handlers
  const handleAddVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createVendor(vendorForm).unwrap()
      setShowAddVendor(false)
      setVendorForm({ name: "", email: "", password: "", companyName: "", phone: "", address: "" })
      refetchVendors()
      showToast("Vendor company registered successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to create vendor", "error")
    }
  }

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCustomer({
        ...customerForm,
        vendorId: Number(customerForm.vendorId),
        monthlyRate: Number(customerForm.monthlyRate),
      }).unwrap()
      setShowAddCustomer(false)
      setCustomerForm({ name: "", email: "", password: "", vendorId: "", phone: "", address: "", deliveryAddress: "", monthlyRate: "" })
      refetchCustomers()
      showToast("Customer registered successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to create customer", "error")
    }
  }

  const handleToggleBlock = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "blocked" : "active"
    try {
      await toggleBlock({ id: userId, status: nextStatus }).unwrap()
      if (activeTab === "vendors") refetchVendors()
      else refetchCustomers()
      showToast(`User account status set to ${nextStatus}`, "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to update block status", "error")
    }
  }

  const handleDeleteVendor = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vendor? This will also cascade delete all their customers!")) return
    try {
      await deleteVendor(id).unwrap()
      refetchVendors()
      showToast("Vendor deleted successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to delete vendor", "error")
    }
  }

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    try {
      await deleteCustomer(id).unwrap()
      refetchCustomers()
      showToast("Customer profile deleted successfully!", "success")
    } catch (err: any) {
      showToast(err.data?.message || "Failed to delete customer", "error")
    }
  }

  return (
    <SidebarLayout 
      role="admin" 
      userName={adminName} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === "vendors" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Vendors Registry</h2>
              <p className="text-sm text-slate-500">Manage companies and delivery agencies.</p>
            </div>
            <button
              onClick={() => setShowAddVendor(true)}
              className="rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
            >
              Add New Vendor
            </button>
          </div>

          {/* Vendors Table */}
          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Representative</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorsData?.result?.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{vendor.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{vendor.companyName}</td>
                    <td className="px-6 py-4">{vendor.name}</td>
                    <td className="px-6 py-4">{vendor.email}</td>
                    <td className="px-6 py-4">{vendor.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        vendor.status === "active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleBlock(vendor.userId, vendor.status)}
                        className={`rounded px-2.5 py-1 text-xs font-medium border ${
                          vendor.status === "active"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {vendor.status === "active" ? "Block" : "Unblock"}
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(!vendorsData?.result || vendorsData.result.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No vendors found. Seed the database or add a new record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Vendor Modal */}
          {showAddVendor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Add New Vendor Company</h3>
                <form onSubmit={handleAddVendorSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rep Name</label>
                      <input
                        type="text"
                        required
                        value={vendorForm.name}
                        onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={vendorForm.email}
                        onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="rep@agency.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={vendorForm.password}
                      onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
                      className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={vendorForm.companyName}
                      onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                      className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                      placeholder="Aquaflow Agency"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone</label>
                      <input
                        type="text"
                        value={vendorForm.phone}
                        onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="+1 555-0199"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Address</label>
                      <input
                        type="text"
                        value={vendorForm.address}
                        onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="10 Main St"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddVendor(false)}
                      className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Save Vendor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Customers Registry</h2>
              <p className="text-sm text-slate-500">Track and link clients to delivery companies.</p>
            </div>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
            >
              Add New Customer
            </button>
          </div>

          {/* Customers Table */}
          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Assigned Vendor</th>
                  <th className="px-6 py-4">Rate (₹)</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersData?.result?.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{cust.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{cust.name}</td>
                    <td className="px-6 py-4">{cust.email}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{cust.vendorCompanyName}</td>
                    <td className="px-6 py-4">₹{cust.monthlyRate}/jar</td>
                    <td className="px-6 py-4 truncate max-w-xs">{cust.deliveryAddress}</td>
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
                        onClick={() => handleToggleBlock(cust.userId, cust.status)}
                        className={`rounded px-2.5 py-1 text-xs font-medium border ${
                          cust.status === "active"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {cust.status === "active" ? "Block" : "Unblock"}
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(cust.id)}
                        className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(!customersData?.result || customersData.result.length === 0) && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      No customers found. Onboard new customer profiles.
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
                <h3 className="text-base font-bold text-slate-900 mb-4">Add New Customer</h3>
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
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Vendor ID</label>
                      <input
                        type="text"
                        required
                        value={customerForm.vendorId}
                        onChange={(e) => setCustomerForm({ ...customerForm, vendorId: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                        placeholder="e.g. 1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Billing Address</label>
                    <input
                      type="text"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                      placeholder="Apartment 4B, Blue Towers"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={customerForm.deliveryAddress}
                      onChange={(e) => setCustomerForm({ ...customerForm, deliveryAddress: e.target.value })}
                      className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs focus:border-slate-500"
                      placeholder="Apartment 4B, Front Gate Dropoff"
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
        </div>
      )}
    </SidebarLayout>
  )
}
