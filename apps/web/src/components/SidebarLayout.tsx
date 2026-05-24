"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useLogoutMutation } from "../store/api/baseApi"
import { 
  Users, 
  Activity, 
  Layers, 
  LogOut, 
  FileText, 
  Calendar, 
  CreditCard,
  TrendingUp,
  Settings,
  Menu
} from "lucide-react"

interface SidebarLayoutProps {
  children: React.ReactNode
  role: "admin" | "vendor" | "customer"
  userName: string
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function SidebarLayout({
  children,
  role,
  userName,
  activeTab,
  setActiveTab,
}: SidebarLayoutProps) {
  const router = useRouter()
  const [logout] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      router.push("/login")
    } catch (err) {
      router.push("/login")
    }
  }

  // Navigation configuration
  const menuItems = {
    admin: [
      { id: "vendors", name: "Manage Vendors", icon: Layers },
      { id: "customers", name: "Manage Customers", icon: Users },
    ],
    vendor: [
      { id: "stats", name: "Overview", icon: Activity },
      { id: "customers", name: "My Customers", icon: Users },
      { id: "bills", name: "Billing / Invoices", icon: CreditCard },
      { id: "reports", name: "Reports & Usage", icon: FileText },
    ],
    customer: [
      { id: "orders", name: "My Deliveries", icon: Calendar },
      { id: "bills", name: "My Bills", icon: CreditCard },
      { id: "spending", name: "Spending Analysis", icon: TrendingUp },
    ]
  }[role] || []

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Panel */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-white text-lg font-semibold tracking-wider">WATERJAR PRO</span>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            )
          })}
        </nav>
        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="px-2">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-slate-500 text-xs capitalize">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600 hover:text-slate-900">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 capitalize">
              {menuItems.find((item) => item.id === activeTab)?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full font-medium text-slate-600 capitalize">
              Role: {role}
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto space-y-6 w-full">
            {children}
          </div>

          <footer className="mt-16 pt-6 border-t border-slate-200 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-slate-400">
              &copy; 2026 WaterJar Pro. All rights reserved to thedilipsingh.
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/thedilipsinghh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-900 transition-colors font-medium"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/thedilipsinghh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-900 transition-colors font-medium"
              >
                GitHub
              </a>
              <a
                href="https://my-portfolio-client-lemon.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-900 transition-colors font-medium"
              >
                Portfolio
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
