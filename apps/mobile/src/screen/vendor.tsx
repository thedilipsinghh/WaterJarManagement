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
  useToggleCustomerServiceMutation,
  useSendBillMutation
} from "../store/api/vendor.api"
import { DeveloperFooter } from "./home"

interface VendorScreenProps {
  userName: string
  onLogout: () => void
}

export default function VendorScreen({ userName, onLogout }: VendorScreenProps) {
  const [activeTab, setActiveTab] = useState<"list" | "billing">("list")

  // Vendor queries
  const { data: customersData, refetch: refetchCustomers, isLoading } = useGetVendorCustomersQuery(undefined)
  const [toggleService] = useToggleCustomerServiceMutation()
  const [sendBill] = useSendBillMutation()

  // Billing forms state
  const [billCustomerId, setBillCustomerId] = useState<number | null>(null)
  const [billCustomerName, setBillCustomerName] = useState<string>("")
  const [billMonth, setBillMonth] = useState("2026-05")
  const [billQty, setBillQty] = useState("")
  const [billAmount, setBillAmount] = useState("")
  const [billDueDate, setBillDueDate] = useState("2026-06-05")

  // Toggle service status
  const handleToggleService = async (id: number, current: string) => {
    const nextService = current === "active" ? "stopped" : "active"
    try {
      await toggleService({ id, serviceStatus: nextService }).unwrap()
      refetchCustomers()
      Alert.alert("Success", `Service status updated to ${nextService}`)
    } catch (err: any) {
      Alert.alert("Error", err.data?.message || "Failed to update service status")
    }
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
      setActiveTab("list")
      refetchCustomers()
      Alert.alert("Success", "Bill issued to customer successfully.")
    } catch (err: any) {
      Alert.alert("Error", err.data?.message || "Failed to send bill.")
    }
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-base font-bold text-slate-900 truncate max-w-[200px]">{userName}</Text>
          <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vendor Route</Text>
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
          onPress={() => setActiveTab("list")} 
          className={`flex-1 py-4.5 items-center border-b-2 ${activeTab === "list" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-xs font-bold ${activeTab === "list" ? "text-slate-900" : "text-slate-400"}`}>My Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("billing")} 
          disabled={!billCustomerId}
          className={`flex-1 py-4.5 items-center border-b-2 ${activeTab === "billing" ? "border-slate-900" : "border-transparent"} ${!billCustomerId ? "opacity-35" : ""}`}
          activeOpacity={0.8}
        >
          <Text className={`text-xs font-bold ${activeTab === "billing" ? "text-slate-900" : "text-slate-400"}`}>Generate Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Views */}
      {activeTab === "list" && (
        <View className="flex-1">
          <ScrollView className="flex-1 px-4 py-4">
            <View className="gap-3 mb-6">
              {isLoading && (
                <View className="py-8 justify-center items-center">
                  <ActivityIndicator color="#0f172a" size="small" />
                </View>
              )}
              
              {!isLoading && customersData?.result?.map((cust: any) => (
                <View key={cust.id} className="bg-white border border-slate-200 p-5 rounded-xl flex-col gap-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-bold text-slate-900 mb-0.5">{cust.name}</Text>
                      <Text className="text-xs text-slate-500 leading-4">{cust.deliveryAddress}</Text>
                      <Text className="text-[11px] font-semibold text-slate-400 mt-2">Rate: ₹{cust.monthlyRate}/jar</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full border ${
                      cust.serviceStatus === "active" 
                        ? "bg-emerald-50 border-emerald-100" 
                        : "bg-amber-50 border-amber-100"
                    }`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                        cust.serviceStatus === "active" ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        {cust.serviceStatus}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity 
                      onPress={() => {
                        setBillCustomerId(cust.id)
                        setBillCustomerName(cust.name)
                        setActiveTab("billing")
                      }}
                      className="bg-slate-900 px-4 py-2.5 rounded-lg flex-1 items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-xs font-bold">Issue Bill</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleToggleService(cust.id, cust.serviceStatus)}
                      className={`border px-4 py-2.5 rounded-lg flex-1 items-center ${
                        cust.serviceStatus === "active" 
                          ? "border-rose-200 bg-rose-50/20" 
                          : "border-emerald-200 bg-emerald-50/20"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs font-bold ${
                        cust.serviceStatus === "active" ? "text-rose-600" : "text-emerald-600"
                      }`}>
                        {cust.serviceStatus === "active" ? "Suspend" : "Resume"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {!isLoading && (!customersData?.result || customersData.result.length === 0) && (
                <View className="bg-white border border-slate-200 p-8 rounded-xl items-center justify-center">
                  <Text className="text-slate-400 text-xs">No assigned customers found.</Text>
                </View>
              )}
            </View>
          </ScrollView>
          <DeveloperFooter />
        </View>
      )}

      {activeTab === "billing" && billCustomerId && (
        <View className="flex-1">
          <ScrollView className="flex-1 px-6 py-6">
            <View className="bg-white border border-slate-200 p-6 rounded-xl gap-5 mb-6">
              <View className="pb-3 border-b border-slate-100">
                <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Generating Invoice</Text>
                <Text className="text-base font-bold text-slate-800 mt-1">{billCustomerName}</Text>
              </View>
              
              <View className="gap-4">
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
                    className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900 font-semibold" 
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
                  <Text className="text-white font-bold text-sm">Send & Register Invoice</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    setBillCustomerId(null)
                    setActiveTab("list")
                  }} 
                  className="border border-slate-200 py-3.5 rounded-lg items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-slate-600 font-bold text-sm">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <DeveloperFooter />
        </View>
      )}
    </View>
  )
}
