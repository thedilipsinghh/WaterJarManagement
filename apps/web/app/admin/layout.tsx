"use client"

import Link from "next/navigation"

import {
  Users,
  UserPlus,
  ShieldCheck,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent
} from "@/components/ui/card"

export default function AdminDashboard() {

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>

          <p className="text-slate-500 mt-2 text-base">
            Manage vendors, monitor platform activity and control system access.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <link href="/admin/register">

            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
            >

              <UserPlus className="mr-2 h-4 w-4" />

              Register Vendor

            </Button>

          </link>

          <link href="/admin/vendors">

            <Button variant="outline">

              <Users className="mr-2 h-4 w-4" />

              View Vendors

            </Button>

          </link>

        </div>

      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <Card className="border-0 shadow-sm">

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Vendors
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  120
                </h2>

              </div>

              <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">

                <Users className="h-6 w-6 text-cyan-600" />

              </div>

            </div>

          </CardContent>

        </Card>

        <Card className="border-0 shadow-sm">

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Active Vendors
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  95
                </h2>

              </div>

              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">

                <ShieldCheck className="h-6 w-6 text-green-600" />

              </div>

            </div>

          </CardContent>

        </Card>

        <Card className="border-0 shadow-sm">

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Blocked Vendors
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  25
                </h2>

              </div>

              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">

                <Activity className="h-6 w-6 text-red-600" />

              </div>

            </div>

          </CardContent>

        </Card>

        <Card className="border-0 shadow-sm">

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  New This Month
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  18
                </h2>

              </div>

              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">

                <UserPlus className="h-6 w-6 text-indigo-600" />

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">

        <CardContent className="p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-2xl font-semibold text-slate-900">
                Quick Actions
              </h2>

              <p className="text-slate-500 mt-1">
                Perform important admin operations quickly.
              </p>

            </div>

          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <link href="/admin/register">

              <div className="rounded-2xl border bg-slate-50 hover:bg-cyan-50 transition-all p-5 cursor-pointer">

                <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">

                  <UserPlus className="h-6 w-6 text-cyan-600" />

                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Create Vendor
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Register a new vendor account and assign access.
                </p>

              </div>

            </link>

            <link href="/admin/vendors">

              <div className="rounded-2xl border bg-slate-50 hover:bg-cyan-50 transition-all p-5 cursor-pointer">

                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">

                  <Users className="h-6 w-6 text-green-600" />

                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Manage Vendors
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  View, update, block or delete vendor accounts.
                </p>

              </div>

            </link>

            <div className="rounded-2xl border bg-slate-50 p-5">

              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">

                <ShieldCheck className="h-6 w-6 text-indigo-600" />

              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                System Security
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Monitor platform activity and secure admin controls.
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

    </div>
  )
}