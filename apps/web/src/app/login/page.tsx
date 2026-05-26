"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useLoginMutation } from "../../store/api/baseApi"
import { useToast } from "../../components/Toast"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginInputs = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()
  const { showToast } = useToast()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInputs) => {
    setErrorMessage(null)
    try {
      const response = await login(data).unwrap()
      if (response.result) {
        const { user } = response.result
        showToast(`Welcome back, ${user.name}!`, "success")

        // Redirect based on role
        if (user.role === "admin") {
          router.push("/admin")
        } else if (user.role === "vendor") {
          router.push("/vendor")
        } else if (user.role === "customer") {
          router.push("/customer")
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err)
      const msg = err.data?.message || "Invalid email or password."
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
        <Card className="w-full max-w-md border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900">
              Sign in to WaterJar
            </CardTitle>
            <CardDescription className="text-center text-sm text-slate-500">
              Or{" "}
              <Link href="/register" className="font-semibold text-slate-900 hover:underline">
                register a new account
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center font-medium">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled={isLoading}
                    {...register("email")}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    {...register("password")}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
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
