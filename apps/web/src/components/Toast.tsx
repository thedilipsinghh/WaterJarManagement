"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const Icon = {
            success: CheckCircle,
            error: AlertTriangle,
            info: Info,
          }[toast.type]

          const colors = {
            success: {
              border: "border-green-300",
              bg: "bg-white",
              text: "text-slate-800",
              icon: "text-green-600",
            },
            error: {
              border: "border-red-300",
              bg: "bg-white",
              text: "text-slate-800",
              icon: "text-red-600",
            },
            info: {
              border: "border-slate-300",
              bg: "bg-white",
              text: "text-slate-800",
              icon: "text-slate-600",
            },
          }[toast.type]

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded bg-white border ${colors.border} shadow-md transition-all duration-300 transform translate-y-0`}
              role="alert"
            >
              <Icon size={18} className={`${colors.icon} shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className={`text-xs font-semibold ${colors.text}`}>{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
