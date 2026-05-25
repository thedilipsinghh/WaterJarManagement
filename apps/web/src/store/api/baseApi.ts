import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ApiResponse, AuthResponse, User } from "@waterjar/types"
import { setCredentials, clearCredentials } from "../authSlice"

const getBaseUrl = () => {
  const isReactNative = typeof navigator !== "undefined" && navigator.product === "ReactNative"
  if (isReactNative) {
    return "http://10.0.2.2:5000/api"
  }
  const nextPublicUrl = process.env.NEXT_PUBLIC_API_URL
  return nextPublicUrl || "http://localhost:5000/api"
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as any).auth?.token
      let role = (getState() as any).auth?.user?.role

      let activeRole = ""
      if (typeof window !== "undefined") {
        const path = window.location.pathname
        if (path.startsWith("/admin")) activeRole = "admin"
        else if (path.startsWith("/vendor")) activeRole = "vendor"
        else if (path.startsWith("/customer")) activeRole = "customer"
      }

      if (!token && typeof window !== "undefined") {
        const key = activeRole ? `accessToken_${activeRole}` : "accessToken"
        token = localStorage.getItem(key)
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }

      const finalRole = activeRole || role
      if (finalRole) {
        headers.set("X-User-Role", finalRole)
      }

      return headers
    },
    credentials: "include",
  }),
  tagTypes: ["User", "Vendors", "Customers", "Orders", "Bills", "Stats", "Reports", "Usage"],
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponse>, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Stats"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data?.result) {
            const { user, accessToken } = data.result
            dispatch(setCredentials({ user, token: accessToken }))
            if (typeof window !== "undefined") {
              localStorage.setItem(`accessToken_${user.role}`, accessToken)
              localStorage.setItem("accessToken", accessToken) // fallback
            }
          }
        } catch (err) {
          console.error("Login mutation error:", err)
        }
      },
    }),
    register: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const role = (getState() as any).auth?.user?.role
          await queryFulfilled
          dispatch(clearCredentials())
          if (typeof window !== "undefined") {
            if (role) {
              localStorage.removeItem(`accessToken_${role}`)
            }
            localStorage.removeItem("accessToken")
          }
        } catch (err) {
          console.error("Logout mutation error:", err)
        }
      },
    }),
    getMe: builder.query<ApiResponse<{ user: User; detail: any }>, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data?.result) {
            const { user } = data.result
            let token = typeof window !== "undefined" ? localStorage.getItem(`accessToken_${user.role}`) : null
            if (!token && typeof window !== "undefined") {
              token = localStorage.getItem("accessToken")
            }
            if (token) {
              dispatch(setCredentials({ user, token }))
            }
          }
        } catch (err) {
          console.error("GetMe query error:", err)
        }
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
} = baseApi
