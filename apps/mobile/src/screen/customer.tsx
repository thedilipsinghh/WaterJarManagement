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
  useGetCustomerOrdersQuery, 
  useCreateCustomerOrderMutation,
  useGetCustomerBillsQuery,
  useGetCustomerSpendingQuery,
  useRequestStopServiceMutation
} from "../store/api/customer.api"
import { DeveloperFooter } from "./home"

interface CustomerScreenProps {
  userName: string
  onLogout: () => void
}

type Tab = "deliveries" | "bills" | "spending"

export default function CustomerScreen({ userName, onLogout }: CustomerScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>("deliveries")
  const [showAddOrder, setShowAddOrder] = useState(false)

  // Customer Queries & Mutations
  const { data: ordersData, refetch: refetchOrders, isLoading: isLoadingOrders } = useGetCustomerOrdersQuery(undefined, {
    skip: activeTab !== "deliveries"
  })
  const { data: billsData, refetch: refetchBills, isLoading: isLoadingBills } = useGetCustomerBillsQuery(undefined, {
    skip: activeTab !== "bills"
  })
  const { data: spendingData, refetch: refetchSpending, isLoading: isLoadingSpending } = useGetCustomerSpendingQuery(undefined, {
    skip: activeTab !== "spending"
  })

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCustomerOrderMutation()
  const [requestStop, { isLoading: isRequestingStop }] = useRequestStopServiceMutation()

  // Order form state
  const [orderQty, setOrderQty] = useState("1")
  const [orderDeliveryDate, setOrderDeliveryDate] = useState("2026-05-24")

  // Request service pause
  const handleStopService = async () => {
    Alert.alert(
      "Confirm Request",
      "Do you want to request water jar service suspension? Deliveries will be paused and your vendor will be notified.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Request", 
          onPress: async () => {
            try {
              await requestStop().unwrap()
              Alert.alert("Submitted", "Deliveries suspended request sent.")
            } catch (err: any) {
              Alert.alert("Error", err.data?.message || "Failed to process request.")
            }
          } 
        }
      ]
    )
  }

  // Handle Request Delivery Submit
  const handleAddOrder = async () => {
    if (!orderQty || !orderDeliveryDate) {
      Alert.alert("Error", "Please provide jar quantities and a delivery date.")
      return
    }

    try {
      await createOrder({
        quantity: Number(orderQty),
        deliveryDate: new Date(orderDeliveryDate).toISOString(),
      }).unwrap()

      setOrderQty("1")
      setOrderDeliveryDate("2026-05-24")
      setShowAddOrder(false)
      refetchOrders()

      Alert.alert("Success", "Delivery order requested successfully!")
    } catch (err: any) {
      Alert.alert("Error", err.data?.message || "Failed to submit delivery request.")
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row justify-between items-center shadow-xs">
        <View>
          <Text className="text-base font-bold text-slate-900 truncate max-w-[200px]">{userName}</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribed Client</Text>
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
          onPress={() => setActiveTab("deliveries")} 
          className={`flex-1 py-3.5 items-center border-b-2 ${activeTab === "deliveries" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-[11px] font-bold ${activeTab === "deliveries" ? "text-slate-900" : "text-slate-400"}`}>Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("bills")} 
          className={`flex-1 py-3.5 items-center border-b-2 ${activeTab === "bills" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-[11px] font-bold ${activeTab === "bills" ? "text-slate-900" : "text-slate-400"}`}>My Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("spending")} 
          className={`flex-1 py-3.5 items-center border-b-2 ${activeTab === "spending" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-[11px] font-bold ${activeTab === "spending" ? "text-slate-900" : "text-slate-400"}`}>Spending</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Views */}
      <View className="flex-1">
        {/* 1. Deliveries Tab */}
        {activeTab === "deliveries" && (
          <ScrollView className="flex-1 px-4 py-4">
            <TouchableOpacity 
              onPress={handleStopService} 
              disabled={isRequestingStop}
              className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl items-center mb-4"
              activeOpacity={0.8}
            >
              <Text className="text-rose-700 text-xs font-bold">Request Service Pause (Pause Deliveries)</Text>
            </TouchableOpacity>

            {showAddOrder ? (
              // Add Order Inline Form
              <View className="bg-white border border-slate-200 p-5 rounded-xl gap-4 mb-6 shadow-xs">
                <View className="pb-2 border-b border-slate-100 flex-row justify-between items-center">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Request New Jar Delivery</Text>
                  <TouchableOpacity onPress={() => setShowAddOrder(false)}>
                    <Text className="text-rose-600 text-xs font-bold">Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View className="gap-3.5">
                  <View>
                    <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Quantity (Jars count)</Text>
                    <TextInput 
                      value={orderQty} 
                      onChangeText={setOrderQty}
                      keyboardType="numeric"
                      className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                      placeholder="2"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Preferred Delivery Date</Text>
                    <TextInput 
                      value={orderDeliveryDate} 
                      onChangeText={setOrderDeliveryDate}
                      className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900" 
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={handleAddOrder} 
                    disabled={isCreatingOrder}
                    className="bg-slate-900 py-3.5 rounded-lg items-center mt-2"
                    activeOpacity={0.8}
                  >
                    {isCreatingOrder ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text className="text-white font-bold text-xs">Request Delivery</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => setShowAddOrder(true)}
                className="bg-slate-900 p-3.5 rounded-xl items-center mb-4"
                activeOpacity={0.8}
              >
                <Text className="text-white text-xs font-bold">+ Request Delivery</Text>
              </TouchableOpacity>
            )}

            <View className="gap-3 mb-6">
              {isLoadingOrders && (
                <ActivityIndicator color="#0f172a" size="small" className="py-8" />
              )}

              {!isLoadingOrders && ordersData?.result?.map((order: any) => (
                <View key={order.id} className="bg-white border border-slate-200 p-4.5 rounded-xl flex-row justify-between items-center shadow-xs">
                  <View>
                    <Text className="text-sm font-bold text-slate-900">{order.quantity} Jars</Text>
                    <Text className="text-[11px] text-slate-400 mt-1">{new Date(order.deliveryDate).toLocaleDateString()}</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full border ${
                    order.status === "delivered" 
                      ? "bg-emerald-50 border-emerald-100" 
                      : order.status === "pending"
                      ? "bg-yellow-50 border-yellow-100"
                      : "bg-red-50 border-red-100"
                  }`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "delivered" ? "text-emerald-700" : order.status === "pending" ? "text-yellow-700" : "text-red-700"
                    }`}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              ))}
              
              {!isLoadingOrders && (!ordersData?.result || ordersData.result.length === 0) && (
                <View className="bg-white border border-slate-200 p-8 rounded-xl items-center justify-center shadow-xs">
                  <Text className="text-slate-400 text-xs">No order logs found.</Text>
                </View>
              )}
            </View>
            <View className="mt-8">
              <DeveloperFooter />
            </View>
          </ScrollView>
        )}

        {/* 2. Bills Tab */}
        {activeTab === "bills" && (
          <ScrollView className="flex-1 px-4 py-4">
            <View className="gap-3 mb-6">
              {isLoadingBills && (
                <ActivityIndicator color="#0f172a" size="small" className="py-8" />
              )}

              {!isLoadingBills && billsData?.result?.map((bill: any) => (
                <View key={bill.id} className="bg-white border border-slate-200 p-5 rounded-xl flex-row justify-between items-center shadow-xs">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-slate-900">{bill.month} Invoice</Text>
                    <Text className="text-[11px] text-slate-400 leading-4 mt-1.5">
                      Jars: {bill.jarQuantity} | Due: {new Date(bill.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="items-end gap-2">
                    <Text className="text-base font-extrabold text-slate-900">₹{bill.amount}</Text>
                    <View className={`px-2.5 py-0.5 rounded-full border ${
                      bill.status === "paid" 
                        ? "bg-emerald-50 border-emerald-100" 
                        : "bg-rose-50 border-rose-100"
                    }`}>
                      <Text className={`text-[9px] font-bold uppercase tracking-wider ${
                        bill.status === "paid" ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        {bill.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {!isLoadingBills && (!billsData?.result || billsData.result.length === 0) && (
                <View className="bg-white border border-slate-200 p-8 rounded-xl items-center justify-center shadow-xs">
                  <Text className="text-slate-400 text-xs">No billing invoices found.</Text>
                </View>
              )}
            </View>
            <View className="mt-8">
              <DeveloperFooter />
            </View>
          </ScrollView>
        )}

        {/* 3. Spending Tab */}
        {activeTab === "spending" && (
          <ScrollView className="flex-1 px-4 py-4">
            {isLoadingSpending ? (
              <ActivityIndicator color="#0f172a" size="small" className="py-8" />
            ) : (
              <View className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Jar Consumption & Spending</Text>
                <View className="gap-2.5">
                  {spendingData?.result?.map((spend, idx) => (
                    <View key={idx} className="flex-row justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                      <View>
                        <Text className="text-xs font-bold text-slate-700">{spend.month}</Text>
                        <Text className="text-[10px] text-slate-400 mt-0.5">{spend.jarQuantity} Jars Consumed</Text>
                      </View>
                      <Text className="text-xs font-extrabold text-slate-900">₹{spend.totalSpent}</Text>
                    </View>
                  ))}
                  {(!spendingData?.result || spendingData.result.length === 0) && (
                    <Text className="text-xs text-slate-400 text-center py-4">No spending logs found.</Text>
                  )}
                </View>
              </View>
            )}
            <View className="mt-8">
              <DeveloperFooter />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  )
}
