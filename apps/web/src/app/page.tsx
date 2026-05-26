"use client"

import React from "react"
import Link from "next/link"
import { useGetMeQuery } from "../store/api/baseApi"
import { Calendar, CreditCard, Users, Shield, ArrowRight, Github, Linkedin, ExternalLink } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card"

export default function HomePage() {
  const { data, isLoading } = useGetMeQuery()
  const user = data?.result?.user

  // Resolve dashboard URL based on role
  const getDashboardUrl = () => {
    if (!user) return "/login"
    if (user.role === "admin") return "/admin"
    if (user.role === "vendor") return "/vendor"
    if (user.role === "customer") return "/customer"
    return "/login"
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-slate-900 font-bold tracking-wider text-base">
            WATERJAR PRO
          </Link>
          
          <nav className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <Button asChild size="sm" className="gap-1.5">
                <Link href={getDashboardUrl()}>
                  Go to Dashboard <ArrowRight size={14} />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="link" asChild size="sm" className="text-slate-600 hover:text-slate-900">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Streamlined Water Jar Deliveries & Invoicing
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            An enterprise management platform built to coordinate admins, route vendors, and subscribed customers. Automatically calculate jar counts, suspend delivery routes, and issue monthly invoices.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            {user ? (
              <Button asChild size="lg" className="gap-2 text-xs font-bold px-5">
                <Link href={getDashboardUrl()}>
                  Access Dashboard <ArrowRight size={14} />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-xs font-bold px-5">
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-xs font-bold px-5">
                  <Link href="/login">Explore Portal Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 flex-1">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Unified Portal Configurations</h2>
            <p className="text-xs text-slate-400">Specially designed dashboard interfaces built for three core user groups.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Card: Admin */}
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="space-y-4">
                <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-800">
                  <Shield size={20} />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900">1. Administrative Controls</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Add, manage, and verify vendor companies and subscription routes. Inspect status, toggle account restrictions, and delete outdated registries.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card: Vendor */}
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="space-y-4">
                <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-800">
                  <Users size={20} />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900">2. Vendor Delivery System</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Onboard new customers, track route delivery schedules, suspend customer deliveries instantly, and generate monthly jar billing invoices in one click.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card: Customer */}
            <Card className="border-slate-200/80 bg-white">
              <CardHeader className="space-y-4">
                <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-800">
                  <Calendar size={20} />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900">3. Customer Subscriptions</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Submit delivery requests, query monthly billing histories, check invoice statuses, and submit stop service pauses when going out of town.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <p className="text-xs font-semibold text-slate-900">WATERJAR PRO</p>
            <p className="text-[11px] text-slate-400">
              &copy; 2026 WaterJar Pro. All rights reserved to thedilipsingh.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/thedilipsinghh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Linkedin size={14} /> <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a
              href="https://github.com/thedilipsinghh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Github size={14} /> <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://my-portfolio-client-lemon.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <ExternalLink size={14} /> <span className="hidden sm:inline">Portfolio</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
