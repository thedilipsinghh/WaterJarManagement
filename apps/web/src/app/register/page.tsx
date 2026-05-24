"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRegisterMutation } from "../../store/api/baseApi"
import { useToast } from "../../components/Toast"
import Link from "next/link"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["vendor", "customer"]),

  // Vendor specific fields
  companyName: z.string().optional(),

  // Customer specific fields
  vendorId: z.string().optional(),
  deliveryAddress: z.string().optional(),
  monthlyRate: z.string().optional(),

  // Common details
  phone: z.string().min(6, "Phone must be at least 6 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
}).superRefine((data, ctx) => {
  if (data.role === "vendor" && !data.companyName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company name is required for vendors",
      path: ["companyName"],
    })
  }
  if (data.role === "customer" && !data.vendorId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vendor ID is required for customers",
      path: ["vendorId"],
    })
  }
})

type RegisterInputs = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const { showToast } = useToast()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "vendor",
    }
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: RegisterInputs) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    // Format numeric values
    const payload = {
      ...data,
      vendorId: data.vendorId ? Number(data.vendorId) : undefined,
      monthlyRate: data.monthlyRate ? Number(data.monthlyRate) : undefined,
    }

    try {
      await registerUser(payload).unwrap()
      const successMsg = "Registration successful! Redirecting to login..."
      setSuccessMessage(successMsg)
      showToast(successMsg, "success")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err: any) {
      console.error("Registration failed:", err)
      const msg = err.data?.message || "Registration failed. Please check inputs."
      setErrorMessage(msg)
      showToast(msg, "error")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Simple Header */}
      <header className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-slate-900 font-bold tracking-wider text-base">
            WATERJAR PRO
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8 bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
          <div>
            <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900">
              Create a new account
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-slate-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded text-sm text-center font-medium">
              {successMessage}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    placeholder="name@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    I want to register as
                  </label>
                  <select
                    id="role"
                    {...register("role")}
                    className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="vendor">Water Vendor / Company</option>
                    <option value="customer">Subscribed Customer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="text"
                    {...register("phone")}
                    className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Billing Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    {...register("address")}
                    className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Vendor Specific */}
              {selectedRole === "vendor" && (
                <div>
                  <label htmlFor="companyName" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Company / Agency Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    {...register("companyName")}
                    className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    placeholder="Spring Valley Jars Co."
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>
                  )}
                </div>
              )}

              {/* Customer Specific */}
              {selectedRole === "customer" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vendorId" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Vendor ID (Assigned Provider)
                      </label>
                      <input
                        id="vendorId"
                        type="text"
                        {...register("vendorId")}
                        className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                        placeholder="e.g. 1"
                      />
                      {errors.vendorId && (
                        <p className="mt-1 text-xs text-red-500">{errors.vendorId.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="monthlyRate" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Monthly Rate per Jar (₹)
                      </label>
                      <input
                        id="monthlyRate"
                        type="number"
                        {...register("monthlyRate")}
                        className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="deliveryAddress" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Delivery Address
                    </label>
                    <input
                      id="deliveryAddress"
                      type="text"
                      {...register("deliveryAddress")}
                      className="block w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      placeholder="Specific delivery gate or instructions"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Registering account..." : "Register Now"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Shared Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
        </div>
      </footer>
    </div>
  )
}
