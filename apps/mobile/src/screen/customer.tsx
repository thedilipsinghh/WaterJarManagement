import React, { useState } from "react"
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from "react-native"
import { 
  useGetCustomerOrdersQuery, 
  useGetCustomerBillsQuery,
  useRequestStopServiceMutation
} from "../store/api/customer.api"
import { DeveloperFooter } from "./home"

interface CustomerScreenProps {
  userName: string
  onLogout: () => void
}

export default function CustomerScreen({ userName, onLogout }: CustomerScreenProps) {
  const [activeTab, setActiveTab] = useState<"deliveries" | "bills">("deliveries")

  // Customer queries
  const { data: ordersData, refetch: refetchOrders, isLoading: isLoadingOrders } = useGetCustomerOrdersQuery(undefined)
  const { data: billsData, refetch: refetchBills, isLoading: isLoadingBills } = useGetCustomerBillsQuery(undefined)
  const [requestStop] = useRequestStopServiceMutation()

  // Request service pause
  const handleStopService = async () => {
    Alert.alert(
      "Confirm Request",
      "Do you want to request water jar service suspension?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Request", 
          onPress: async () => {
            try {
              await requestStop().unwrap()
              refetchOrders()
              Alert.alert("Submitted", "Deliveries suspended.")
            } catch (err: any) {
              Alert.alert("Error", err.data?.message || "Failed to process request.")
            }
          } 
        }
      ]
    )
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-base font-bold text-slate-900 truncate max-w-[200px]">{userName}</Text>
          <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subscribed Client</Text>
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
          className={`flex-1 py-4.5 items-center border-b-2 ${activeTab === "deliveries" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-xs font-bold ${activeTab === "deliveries" ? "text-slate-900" : "text-slate-400"}`}>Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("bills")} 
          className={`flex-1 py-4.5 items-center border-b-2 ${activeTab === "bills" ? "border-slate-900" : "border-transparent"}`}
          activeOpacity={0.8}
        >
          <Text className={`text-xs font-bold ${activeTab === "bills" ? "text-slate-900" : "text-slate-400"}`}>My Bills</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery log view */}
      {activeTab === "deliveries" && (
        <View className="flex-1">
          <ScrollView className="flex-1 px-4 py-4">
            <TouchableOpacity 
              onPress={handleStopService} 
              className="bg-rose-50 border border-rose-200 p-4 rounded-xl items-center mb-4"
              activeOpacity={0.8}
            >
              <Text className="text-rose-700 text-xs font-bold">Request Service Pause</Text>
            </TouchableOpacity>

            <View className="gap-3 mb-6">
              {isLoadingOrders && (
                <View className="py-8 justify-center items-center">
                  <ActivityIndicator color="#0f172a" size="small" />
                </View>
              )}

              {!isLoadingOrders && ordersData?.result?.map((order: any) => (
                <View key={order.id} className="bg-white border border-slate-200 p-4.5 rounded-xl flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm font-bold text-slate-900">{order.quantity} Jars</Text>
                    <Text className="text-[11px] text-slate-400 mt-1">{new Date(order.deliveryDate).toLocaleDateString()}</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full border ${
                    order.status === "delivered" 
                      ? "bg-emerald-50 border-emerald-100" 
                      : "bg-amber-50 border-amber-100"
                  }`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "delivered" ? "text-emerald-700" : "text-amber-700"
                    }`}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              ))}
              
              {!isLoadingOrders && (!ordersData?.result || ordersData.result.length === 0) && (
                <View className="bg-white border border-slate-200 p-8 rounded-xl items-center justify-center">
                  <Text className="text-slate-400 text-xs">No order logs found.</Text>
                </View>
              )}
            </View>
          </ScrollView>
          <DeveloperFooter />
        </View>
      )}

      {/* Bills log view */}
      {activeTab === "bills" && (
        <View className="flex-1">
          <ScrollView className="flex-1 px-4 py-4">
            <View className="gap-3 mb-6">
              {isLoadingBills && (
                <View className="py-8 justify-center items-center">
                  <ActivityIndicator color="#0f172a" size="small" />
                </View>
              )}

              {!isLoadingBills && billsData?.result?.map((bill: any) => (
                <View key={bill.id} className="bg-white border border-slate-200 p-5 rounded-xl flex-row justify-between items-center">
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
                <View className="bg-white border border-slate-200 p-8 rounded-xl items-center justify-center">
                  <Text className="text-slate-400 text-xs">No billing invoices found.</Text>
                </View>
              )}
            </View>
          </ScrollView>
          <DeveloperFooter />
        </View>
      )}
    </View>
  )
}
