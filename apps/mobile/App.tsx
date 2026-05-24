import React, { useState } from "react"
import { StatusBar } from "expo-status-bar"
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Provider } from "react-redux"
import { store } from "./src/store/store"
import { useLoginMutation } from "./src/store/api/baseApi"

import HomeScreen, { DeveloperFooter } from "./src/screen/home"
import VendorScreen from "./src/screen/vendor"
import CustomerScreen from "./src/screen/customer"

type Screen = "home" | "login" | "vendor" | "customer"

function MainApp() {
  const [screen, setScreen] = useState<Screen>("home")
  const [userName, setUserName] = useState<string>("")

  // Login inputs
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all credentials.")
      return
    }

    try {
      const response = await login({ email, password }).unwrap()
      if (response?.result) {
        const { user } = response.result

        if (user.role === "admin") {
          Alert.alert("Access Denied", "Administrators must log in via the web client dashboard.")
          return
        }

        setUserName(user.name)
        setScreen(user.role as Screen)
      }
    } catch (err: any) {
      console.error(err)
      Alert.alert("Error", err.data?.message || "Invalid credentials.")
    }
  }

  const handleLogout = () => {
    setScreen("home")
    setUserName("")
    setEmail("")
    setPassword("")
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      {/* 0. Home / Landing Screen */}
      {screen === "home" && (
        <HomeScreen onNavigateToLogin={() => setScreen("login")} />
      )}

      {/* 1. Login Screen */}
      {screen === "login" && (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} className="px-6">
          <View className="w-full max-w-sm mx-auto bg-white p-8 border border-slate-200 rounded-xl shadow-xs">
            {/* Header Branding */}
            <View className="items-center mb-8">
              <View className="w-12 h-12 bg-slate-900 rounded-lg justify-center items-center mb-3">
                <Text className="text-white text-xl font-bold">W.</Text>
              </View>
              <Text className="text-xl font-bold text-slate-900">
                WaterJar Mobile Portal
              </Text>
              <Text className="text-xs text-slate-400 mt-1">
                Enter your credentials to manage deliveries
              </Text>
            </View>

            <View className="gap-5">
              <View>
                <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 text-slate-900"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoggingIn}
                className="bg-slate-900 py-3.5 rounded-lg justify-center items-center mt-2"
                activeOpacity={0.8}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Home */}
            <TouchableOpacity
              onPress={() => setScreen("home")}
              className="mt-5 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-slate-400 text-xs font-semibold">← Back to Home</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-8">
            <DeveloperFooter />
          </View>
        </ScrollView>
      )}

      {/* 2. Vendor Dashboard */}
      {screen === "vendor" && (
        <VendorScreen userName={userName} onLogout={handleLogout} />
      )}

      {/* 3. Customer Dashboard */}
      {screen === "customer" && (
        <CustomerScreen userName={userName} onLogout={handleLogout} />
      )}
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  )
}
