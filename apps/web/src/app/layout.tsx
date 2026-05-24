import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { ReduxProvider } from "../store/ReduxProvider"
import { ToastProvider } from "../components/Toast"

export const metadata: Metadata = {
  title: "Water Jar Delivery Management System",
  description: "Enterprise portal for tracking water jar deliveries, customer subscriptions, and automated invoicing.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased text-slate-900">
        <ReduxProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
