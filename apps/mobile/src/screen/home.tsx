import React from "react"
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Linking 
} from "react-native"

export function DeveloperFooter() {
  return (
    <View className="py-6 border-t border-slate-200 items-center justify-center bg-white px-6">
      <Text className="text-[10px] text-slate-400 text-center font-medium">
        © 2026 WaterJar Pro. All rights reserved to thedilipsingh.
      </Text>
      <View className="flex-row gap-4 mt-2 justify-center">
        <TouchableOpacity onPress={() => Linking.openURL("https://www.linkedin.com/in/thedilipsinghh")}>
          <Text className="text-[11px] font-semibold text-slate-500 active:text-slate-800">LinkedIn</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://github.com/thedilipsinghh")}>
          <Text className="text-[11px] font-semibold text-slate-500 active:text-slate-800">GitHub</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://my-portfolio-client-lemon.vercel.app")}>
          <Text className="text-[11px] font-semibold text-slate-500 active:text-slate-800">Portfolio</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

interface HomeScreenProps {
  onNavigateToLogin: () => void
}

export default function HomeScreen({ onNavigateToLogin }: HomeScreenProps) {
  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* Hero Section */}
        <View className="px-6 pt-16 pb-12 bg-white border-b border-slate-200 items-center justify-center">
          <View className="w-16 h-16 bg-slate-900 rounded-2xl justify-center items-center mb-4">
            <Text className="text-white text-3xl font-bold">W.</Text>
          </View>
          <Text className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
            WaterJar Delivery Pro
          </Text>
          <Text className="text-sm text-slate-400 mt-2 text-center max-w-[280px] leading-5">
            Sleek, minimal, and high-performance management for routes and client water subscriptions
          </Text>
        </View>

        {/* Action / Features Grid */}
        <View className="px-6 py-8 gap-6 flex-1">
          <View className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs gap-4">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Capabilities</Text>
            
            {/* Vendor Feature */}
            <View className="flex-row gap-3 items-start">
              <View className="w-6 h-6 rounded-full bg-slate-100 items-center justify-center mt-0.5">
                <Text className="text-xs font-bold text-slate-700">V</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">For Logistics & Vendors</Text>
                <Text className="text-xs text-slate-500 mt-0.5 leading-4">
                  Manage active client subscriptions, toggle delivery services, and register instant billing invoices.
                </Text>
              </View>
            </View>

            {/* Customer Feature */}
            <View className="flex-row gap-3 items-start border-t border-slate-100 pt-4">
              <View className="w-6 h-6 rounded-full bg-slate-100 items-center justify-center mt-0.5">
                <Text className="text-xs font-bold text-slate-700">C</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">For Subscribed Clients</Text>
                <Text className="text-xs text-slate-500 mt-0.5 leading-4">
                  Track delivered water jars, request service suspensions, and view current monthly invoice details.
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View className="mt-auto pt-6 gap-3">
            <TouchableOpacity 
              onPress={onNavigateToLogin}
              className="bg-slate-900 py-4 rounded-xl items-center justify-center shadow-xs"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">Proceed to Portal Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <DeveloperFooter />
      </ScrollView>
    </View>
  )
}
