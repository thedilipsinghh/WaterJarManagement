import React, { useState } from "react"
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from "react-native"
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
} from "../store/api/vendor.api"
import { DeveloperFooter } from "./home"

interface VendorScreenProps {
  userName: string
  onLogout: () => void
}

type Tab = "dashboard" | "customers" | "bills" | "billing"

export default function VendorScreen({ userName, onLogout }: VendorScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  // API Queries & Mutations
  const { data: statsData, refetch: refetchStats, isLoading: statsLoading } = useGetVendorStatsQuery(undefined, {
    skip: activeTab !== "dashboard"
  })
  const { data: usageData, refetch: refetchUsage, isLoading: usageLoading } = useGetVendorJarUsageQuery(undefined, {
    skip: activeTab !== "dashboard"
  })
  const { data: customersData, refetch: refetchCustomers, isLoading: customersLoading } = useGetVendorCustomersQuery(undefined, {
    skip: activeTab !== "customers"
  })
  const { data: reportsData, refetch: refetchReports, isLoading: reportsLoading } = useGetVendorReportsQuery(undefined, {
    skip: activeTab !== "bills"
  })

  const [createCustomer, { isLoading: isCreatingCustomer }] = useCreateVendorCustomerMutation()
  const [deleteCustomer] = useDeleteVendorCustomerMutation()
  const [toggleStatus] = useToggleCustomerStatusMutation()
  const [toggleService] = useToggleCustomerServiceMutation()
  const [sendBill] = useSendBillMutation()

  // Onboard customer form state
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPassword, setCustomerPassword] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerDeliveryAddress, setCustomerDeliveryAddress] = useState("")
  const [customerRate, setCustomerRate] = useState("15")

  // Billing forms state
  const [billCustomerId, setBillCustomerId] = useState<number | null>(null)
  const [billCustomerName, setBillCustomerName] = useState<string>("")
  const [billMonth, setBillMonth] = useState("2026-05")
  const [billQty, setBillQty] = useState("")
  const [billAmount, setBillAmount] = useState("")
  const [billDueDate, setBillDueDate] = useState("2026-06-05")

  // Handle Add Customer
  const handleAddCustomer = async () => {
    if (!customerName || !customerEmail || !customerPassword || !customerPhone || !customerAddress) {
      Alert.alert("Error", "Please fill in all required customer details.")
      return
    }

    try {
      await createCustomer({
        name: customerName,
        email: customerEmail,
        password: customerPassword,
        phone: customerPhone,
        address: customerAddress,
        deliveryAddress: customerDeliveryAddress || customerAddress,
        monthlyRate: Number(customerRate),
      }).unwrap()

      // Reset Form
      setCustomerName("")
      setCustomerEmail("")
      setCustomerPassword("")
      setCustomerPhone("")
      setCustomerAddress("")
      setCustomerDeliveryAddress("")
      setCustomerRate("15")
      setShowAddCustomer(false)

      refetchCustomers()
      Alert.alert("Success", "Customer onboarded successfully!")
    } catch (err: any) {
      Alert.alert("Error", err.data?.message || "Failed to onboard customer.")
    }
  }

  // Handle Toggle status (Block/Unblock)
  const handleToggleStatus = async (id: number, current: string) => {
    const nextStatus = current === "active" ? "blocked" : "active"
    try {
      await toggleStatus({ id, status: nextStatus }).unwrap()
      refetchCustomers()
      Alert.alert("Success", `Customer status updated to ${nextStatus}`)
    } catch (err: any) {
      Alert.alert("Error", err.data?.message || "Failed to update account status.")
    }
  }

  // Handle Toggle service (Suspend/Resume)
  const handleToggleService = async (id: number, current: string) => {
    const nextService = current === "active" ? "stopped" : "active"
    try {
      await toggleService({ id, serviceStatus: nextService }).unwrap()
      refetchCustomers()
      Alert.alert("Success", `Service status updated to ${nextService}`)
    } catch (err: any) {
      Alert.alert("Error", err.data?.message || "Failed to update service status.")
    }
  }

  // Handle Delete customer
  const handleDeleteCustomer = (id: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this customer registry permanently?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomer(id).unwrap()
              refetchCustomers()
              Alert.alert("Success", "Customer deleted successfully.")
            } catch (err: any) {
              Alert.alert("Error", err.data?.message || "Failed to delete customer.")
            }
          }
        }
      ]
    )
  }

  // Issue monthly invoice
  const handleSendBill = async () => {
    if (!billCustomerId || !billQty || !billAmount) {
      Alert.alert("Error", "Please provide jar quantities and total price.")
      return
    }

    try {
      await sendBill({
        customerId: billCustomerId,
        month: billMonth,
        amount: Number(billAmount),
        jarQuantity: Number(billQty),
        dueDate: billDueDate,
      }).unwrap()
      setBillCustomerId(null)
      setBillQty("")
      setBillAmount("")
      setActiveTab("customers")
      refetchCustomers()
      Alert.alert("Success", "Bill issued to customer successfully.")
    } catch (err: any) {
      Alert.alert("Error", err.data?.message || "Failed to send bill.")
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row justify-between items-center shadow-xs">
        <View>
          <Text className="text-base font-bold text-slate-900 truncate max-w-[200px]">{userName}</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Router</Text>
        </View>
        <TouchableOpacity 
          onPress={onLogout} 
          className="border border-slate-200 px-3.5 py-1.5 rounded-lg"
          activeOpacity={0.8}
        >
          <Text className="text-slate-600 text-xs font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row bg-white border-b border-slate-200">
        <TouchableOpacity 
          onPress={() => setActiveTab("dashboard")} 
          className={`flex-1 py-3.5 items-center border-b-2 ${activeTab === "dashboard" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-[11px] font-bold ${activeTab === "dashboard" ? "text-slate-900" : "text-slate-400"}`}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("customers")} 
          className={`flex-1 py-3.5 items-center border-b-2 ${activeTab === "customers" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-[11px] font-bold ${activeTab === "customers" ? "text-slate-900" : "text-slate-400"}`}>Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("bills")} 
          className={`flex-1 py-3.5 items-center border-b-2 ${activeTab === "bills" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-[11px] font-bold ${activeTab === "bills" ? "text-slate-900" : "text-slate-400"}`}>Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("billing")} 
          disabled={!billCustomerId}
          className={`flex-1 py-3.5 items-center border-b-2 ${activeTab === "billing" ? "border-slate-900" : "border-transparent"} ${!billCustomerId ? "opacity-30" : ""}`}
          activeOpacity={0.8}
        >
          <Text className={`text-[11px] font-bold ${activeTab === "billing" ? "text-slate-900" : "text-slate-400"}`}>Generate Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Views */}
      <View className="flex-1">
        {/* 1. Dashboard Tab */}
        {activeTab === "dashboard" && (
          <ScrollView className="flex-1 px-4 py-4">
            {statsLoading ? (
              <ActivityIndicator color="#0f172a" size="small" className="py-8" />
            ) : (
              <View className="gap-4">
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <Text className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Clients</Text>
                    <Text className="text-xl font-bold text-slate-900 mt-1">{statsData?.result?.totalCustomers || 0}</Text>
                  </View>
                  <View className="flex-1 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <Text className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Active Subs</Text>
                    <Text className="text-xl font-bold text-slate-900 mt-1">{statsData?.result?.activeCustomers || 0}</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <Text className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pending Orders</Text>
                    <Text className="text-xl font-bold text-slate-900 mt-1">{statsData?.result?.totalPendingOrders || 0}</Text>
                  </View>
                  <View className="flex-1 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                    <Text className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Revenue Paid</Text>
                    <Text className="text-xl font-bold text-slate-900 mt-1">₹{statsData?.result?.totalRevenue || 0}</Text>
                  </View>
                </View>

                {/* Monthly Volume Aggregation */}
                <View className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs mt-2">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Delivered Volume History</Text>
                  {usageLoading ? (
                    <ActivityIndicator color="#0f172a" size="small" className="py-4" />
                  ) : (
                    <View className="gap-2.5">
                      {usageData?.result?.map((usage, idx) => (
                        <View key={idx} className="flex-row justify-between items-center py-2 border-b border-slate-100 last:border-0">
                          <Text className="text-xs font-bold text-slate-700">{usage.month}</Text>
                          <Text className="text-xs font-semibold text-slate-900">{usage.quantity} Jars</Text>
                        </View>
                      ))}
                      {(!usageData?.result || usageData.result.length === 0) && (
                        <Text className="text-xs text-slate-400 text-center py-4">No aggregate volume logs found.</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}
            <View className="mt-8">
              <DeveloperFooter />
            </View>
          </ScrollView>
        )}

        {/* 2. Customers Tab */}
        {activeTab === "customers" && (
          <View className="flex-1">
            <ScrollView className="flex-1 px-4 py-4">
              {showAddCustomer ? (
                // Add Customer Inline Form
                <View className="bg-white border border-slate-200 p-5 rounded-xl gap-4 mb-6 shadow-xs">
                  <View className="pb-2 border-b border-slate-100 flex-row justify-between items-center">
                    <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Onboarding New Client</Text>
                    <TouchableOpacity onPress={() => setShowAddCustomer(false)}>
                      <Text className="text-rose-600 text-xs font-bold">Cancel</Text>
                    </TouchableOpacity>
                  </View>                  <View className="gap-3.5">
                    <View>
                      <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name *</Text>
                      <TextInput 
                        value={customerName} 
                        onChangeText={setCustomerName}
                        className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                        placeholder="John Doe"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address *</Text>
                      <TextInput 
                        value={customerEmail} 
                        onChangeText={setCustomerEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                        placeholder="john@example.com"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password *</Text>
                      <TextInput 
                        value={customerPassword} 
                        onChangeText={setCustomerPassword}
                        secureTextEntry
                        className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number *</Text>
                      <TextInput 
                        value={customerPhone} 
                        onChangeText={setCustomerPhone}
                        className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                        placeholder="+91 9988776655"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Billing Address *</Text>
                      <TextInput 
                        value={customerAddress} 
                        onChangeText={setCustomerAddress}
                        className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                        placeholder="123 Main St, Apartment 4B"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Delivery Instructions Address</Text>
                      <TextInput 
                        value={customerDeliveryAddress} 
                        onChangeText={setCustomerDeliveryAddress}
                        className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                        placeholder="Leave at main gate drop-box"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cost Rate per Jar (₹) *</Text>
                      <TextInput 
                        value={customerRate} 
                        onChangeText={setCustomerRate}
                        keyboardType="numeric"
                        className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                        placeholder="15"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
 
                    <TouchableOpacity 
                      onPress={handleAddCustomer} 
                      disabled={isCreatingCustomer}
                      className="bg-slate-900 py-3.5 rounded-lg items-center mt-2"
                      activeOpacity={0.8}
                    >
                      {isCreatingCustomer ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text className="text-white font-bold text-xs">Save and Activate Client</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setShowAddCustomer(true)}
                  className="bg-slate-900 p-3.5 rounded-xl items-center mb-4"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs font-bold">+ Onboard Customer</Text>
                </TouchableOpacity>
              )}

              {/* Customer cards */}
              <View className="gap-3 mb-6">
                {customersLoading && !showAddCustomer && (
                  <ActivityIndicator color="#0f172a" size="small" className="py-8" />
                )}
                
                {!customersLoading && customersData?.result?.map((cust: any) => (
                  <View key={cust.id} className="bg-white border border-slate-200 p-5 rounded-xl flex-col gap-3 shadow-xs">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-bold text-slate-900 mb-0.5">{cust.name}</Text>
                        <Text className="text-[10px] text-slate-400 font-mono mb-1.5">ID: {cust.id} | Email: {cust.email}</Text>
                        <Text className="text-xs text-slate-500 leading-4">{cust.deliveryAddress}</Text>
                        <Text className="text-[11px] font-semibold text-slate-400 mt-2">Rate: ₹{cust.monthlyRate}/jar | Phone: {cust.phone || "-"}</Text>
                      </View>
                      
                      <View className="items-end gap-1.5">
                        {/* Service Status */}
                        <View className={`px-2 py-0.5 rounded-full border ${
                          cust.serviceStatus === "active" 
                            ? "bg-emerald-50 border-emerald-100" 
                            : "bg-amber-50 border-amber-100"
                        }`}>
                          <Text className={`text-[8px] font-bold uppercase tracking-wider ${
                            cust.serviceStatus === "active" ? "text-emerald-700" : "text-amber-700"
                          }`}>
                            Service: {cust.serviceStatus}
                          </Text>
                        </View>
                        {/* Account Status */}
                        <View className={`px-2 py-0.5 rounded-full border ${
                          cust.status === "active" 
                            ? "bg-green-50 border-green-100" 
                            : "bg-red-50 border-red-100"
                        }`}>
                          <Text className={`text-[8px] font-bold uppercase tracking-wider ${
                            cust.status === "active" ? "text-green-700" : "text-red-700"
                          }`}>
                            Acct: {cust.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View className="flex-row gap-2 mt-2">
                      <TouchableOpacity 
                        onPress={() => {
                          setBillCustomerId(cust.id)
                          setBillCustomerName(cust.name)
                          setActiveTab("billing")
                        }}
                        className="bg-slate-900 px-3 py-2 rounded-lg flex-1 items-center"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white text-[10px] font-bold">Issue Bill</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleToggleService(cust.id, cust.serviceStatus)}
                        className={`border px-3 py-2 rounded-lg flex-1 items-center ${
                          cust.serviceStatus === "active" 
                            ? "border-amber-200 bg-amber-50/20" 
                            : "border-emerald-200 bg-emerald-50/20"
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-[10px] font-bold ${
                          cust.serviceStatus === "active" ? "text-amber-700" : "text-emerald-700"
                        }`}>
                          {cust.serviceStatus === "active" ? "Suspend" : "Resume"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleToggleStatus(cust.id, cust.status)}
                        className={`border px-3 py-2 rounded-lg flex-1 items-center border-slate-200 bg-white`}
                        activeOpacity={0.8}
                      >
                        <Text className="text-slate-600 text-[10px] font-bold">
                          {cust.status === "active" ? "Block" : "Unblock"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteCustomer(cust.id)}
                        className="border border-red-100 bg-red-50/10 px-3 py-2 rounded-lg flex-1 items-center"
                        activeOpacity={0.8}
                      >
                        <Text className="text-red-600 text-[10px] font-bold">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                {!customersLoading && (!customersData?.result || customersData.result.length === 0) && !showAddCustomer && (
                  <View className="bg-white border border-slate-200 p-8 rounded-xl items-center justify-center shadow-xs">
                    <Text className="text-slate-400 text-xs">No assigned customers found.</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <DeveloperFooter />
          </View>
        )}

        {/* 3. Bills Tab (History) */}
        {activeTab === "bills" && (
          <ScrollView className="flex-1 px-4 py-4">
            {reportsLoading ? (
              <ActivityIndicator color="#0f172a" size="small" className="py-8" />
            ) : (
              <View className="gap-3 mb-6">
                {reportsData?.result?.map((bill: any) => (
                  <View key={bill.id} className="bg-white border border-slate-200 p-4.5 rounded-xl flex-row justify-between items-center shadow-xs">
                    <View className="flex-1 pr-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice ID: {bill.id}</Text>
                      <Text className="text-sm font-bold text-slate-800 mt-1">{bill.customerName}</Text>
                      <Text className="text-[11px] text-slate-400 leading-4 mt-1">
                        Month: {bill.month} | Jars Count: {bill.jarQuantity}
                      </Text>
                    </View>
                    <View className="items-end gap-1.5">
                      <Text className="text-sm font-extrabold text-slate-900">₹{bill.amount}</Text>
                      <View className={`px-2 py-0.5 rounded-full border ${
                        bill.status === "paid" 
                          ? "bg-green-50 border-green-100" 
                          : "bg-red-50 border-red-100"
                      }`}>
                        <Text className={`text-[8px] font-bold uppercase tracking-wider ${
                          bill.status === "paid" ? "text-green-700" : "text-red-700"
                        }`}>
                          {bill.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                {(!reportsData?.result || reportsData.result.length === 0) && (
                  <View className="bg-white border border-slate-200 p-8 rounded-xl items-center justify-center shadow-xs">
                    <Text className="text-slate-400 text-xs">No billing logs found.</Text>
                  </View>
                )}
              </View>
            )}
            <View className="mt-8">
              <DeveloperFooter />
            </View>
          </ScrollView>
        )}

        {/* 4. Generate Bill Tab */}
        {activeTab === "billing" && billCustomerId && (
          <ScrollView className="flex-1 px-4 py-4">
            <View className="bg-white border border-slate-200 p-6 rounded-xl gap-4 mb-6 shadow-xs">
              <View className="pb-3 border-b border-slate-100">
                <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Generating Invoice</Text>
                <Text className="text-base font-bold text-slate-800 mt-1">{billCustomerName}</Text>
              </View>
              
              <View className="gap-3.5">
                <View>
                  <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Billing Month</Text>
                  <TextInput 
                    value={billMonth} 
                    onChangeText={setBillMonth} 
                    className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                    placeholder="YYYY-MM"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Jars Count Delivered</Text>
                  <TextInput 
                    value={billQty} 
                    onChangeText={(val) => {
                      setBillQty(val)
                      const q = Number(val)
                      // Auto calculate amount from user rate
                      const cRate = customersData?.result?.find((c: any) => c.id === billCustomerId)?.monthlyRate || 15
                      setBillAmount(String(q * cRate))
                    }} 
                    keyboardType="numeric"
                    className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                    placeholder="10"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Total Bill Amount (₹)</Text>
                  <TextInput 
                    value={billAmount} 
                    onChangeText={setBillAmount} 
                    keyboardType="numeric"
                    className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900 font-bold" 
                    placeholder="150"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Due Date</Text>
                  <TextInput 
                    value={billDueDate} 
                    onChangeText={setBillDueDate} 
                    className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <TouchableOpacity 
                  onPress={handleSendBill} 
                  className="bg-slate-900 py-3.5 rounded-lg items-center mt-2"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-xs">Send & Register Invoice</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    setBillCustomerId(null)
                    setActiveTab("customers")
                  }} 
                  className="border border-slate-200 py-3.5 rounded-lg items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-slate-600 font-bold text-xs">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="mt-8">
              <DeveloperFooter />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  )
}
