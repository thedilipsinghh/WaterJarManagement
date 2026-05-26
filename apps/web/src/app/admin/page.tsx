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
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"

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
  const [deleteVendor] = useDeleteVendorMutation()
  const [createCustomer] = useCreateAdminCustomerMutation()
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
              <h2 className="text-xl font-bold text-slate-900 font-sans">Vendors Registry</h2>
              <p className="text-sm text-slate-500 font-sans">Manage companies and delivery agencies.</p>
            </div>
            <Button onClick={() => setShowAddVendor(true)}>
              Add New Vendor
            </Button>
          </div>

          {/* Vendors Table */}
          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Representative</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorsData?.result?.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-mono text-xs">{vendor.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{vendor.companyName}</TableCell>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.phone || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        vendor.status === "active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {vendor.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant={vendor.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleBlock(vendor.userId, vendor.status)}
                      >
                        {vendor.status === "active" ? "Block" : "Unblock"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVendor(vendor.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!vendorsData?.result || vendorsData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No vendors found. Seed the database or add a new record.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add Vendor Dialog Modal */}
          <Dialog open={showAddVendor} onOpenChange={setShowAddVendor}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Add New Vendor Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddVendorSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Rep Name</Label>
                    <Input
                      type="text"
                      required
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                      placeholder="rep@agency.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    required
                    value={vendorForm.password}
                    onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Company Name</Label>
                  <Input
                    type="text"
                    required
                    value={vendorForm.companyName}
                    onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                    placeholder="Aquaflow Agency"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      placeholder="+1 555-0199"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input
                      type="text"
                      value={vendorForm.address}
                      onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                      placeholder="10 Main St"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddVendor(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Vendor</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">Customers Registry</h2>
              <p className="text-sm text-slate-500 font-sans">Track and link clients to delivery companies.</p>
            </div>
            <Button onClick={() => setShowAddCustomer(true)}>
              Add New Customer
            </Button>
          </div>

          {/* Customers Table */}
          <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Vendor</TableHead>
                  <TableHead>Rate (₹)</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData?.result?.map((cust) => (
                  <TableRow key={cust.id}>
                    <TableCell className="font-mono text-xs">{cust.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{cust.name}</TableCell>
                    <TableCell>{cust.email}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{cust.vendorCompanyName}</TableCell>
                    <TableCell>₹{cust.monthlyRate}/jar</TableCell>
                    <TableCell className="max-w-xs truncate">{cust.deliveryAddress}</TableCell>
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
                        variant={cust.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleBlock(cust.userId, cust.status)}
                      >
                        {cust.status === "active" ? "Block" : "Unblock"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCustomer(cust.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!customersData?.result || customersData.result.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      No customers found. Onboard new customer profiles.
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
                <DialogTitle>Add New Customer</DialogTitle>
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
                    <Label>Vendor ID</Label>
                    <Input
                      type="text"
                      required
                      value={customerForm.vendorId}
                      onChange={(e) => setCustomerForm({ ...customerForm, vendorId: e.target.value })}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      placeholder="+1 555-0155"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Rate per Jar (₹)</Label>
                    <Input
                      type="number"
                      value={customerForm.monthlyRate}
                      onChange={(e) => setCustomerForm({ ...customerForm, monthlyRate: e.target.value })}
                      placeholder="15"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Billing Address</Label>
                  <Input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="Apartment 4B, Blue Towers"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Address</Label>
                  <Input
                    type="text"
                    value={customerForm.deliveryAddress}
                    onChange={(e) => setCustomerForm({ ...customerForm, deliveryAddress: e.target.value })}
                    placeholder="Apartment 4B, Front Gate Dropoff"
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
        </div>
      )}
    </SidebarLayout>
  )
}
