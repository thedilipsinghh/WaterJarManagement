"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRegisterMutation } from "../../store/api/baseApi"
import { useToast } from "../../components/Toast"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"

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
        <Card className="w-full max-w-lg border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900">
              Create a new account
            </CardTitle>
            <CardDescription className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-slate-900 hover:underline">
                Sign in
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
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

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      {...register("name")}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="name@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role">I want to register as</Label>
                    <select
                      id="role"
                      {...register("role")}
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1.5 text-sm text-slate-900 shadow-xs focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    >
                      <option value="vendor">Water Vendor / Company</option>
                      <option value="customer">Subscribed Customer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="text"
                      {...register("phone")}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address">Billing Address</Label>
                    <Input
                      id="address"
                      type="text"
                      {...register("address")}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                </div>

                {/* Vendor Specific */}
                {selectedRole === "vendor" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName">Company / Agency Name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      {...register("companyName")}
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
                      <div className="space-y-1.5">
                        <Label htmlFor="vendorId">Vendor ID (Assigned Provider)</Label>
                        <Input
                          id="vendorId"
                          type="text"
                          {...register("vendorId")}
                          placeholder="e.g. 1"
                        />
                        {errors.vendorId && (
                          <p className="mt-1 text-xs text-red-500">{errors.vendorId.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="monthlyRate">Monthly Rate per Jar (₹)</Label>
                        <Input
                          id="monthlyRate"
                          type="number"
                          {...register("monthlyRate")}
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="deliveryAddress">Delivery Address</Label>
                      <Input
                        id="deliveryAddress"
                        type="text"
                        {...register("deliveryAddress")}
                        placeholder="Specific delivery gate or instructions"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Registering account..." : "Register Now"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
