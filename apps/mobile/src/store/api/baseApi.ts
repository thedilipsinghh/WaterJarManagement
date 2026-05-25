import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ApiResponse, AuthResponse, User } from "@waterjar/types"
import { NativeModules, Platform } from "react-native"
import { setCredentials, clearCredentials } from "../authSlice"

const getBaseUrl = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL || ""
  const match = scriptURL.match(/^https?:\/\/([^:/]+)(:\d+)?/)
  let ip = "192.168.1.12" // Fallback to host LAN IP so both physical phones and emulators can connect
  if (match) {
    ip = match[1]
    if ((ip === "localhost" || ip === "127.0.0.1") && Platform.OS === "android") {
      ip = "10.0.2.2"
    }
  }
  const url = `http://${ip}:5000/api`
  console.log(`[MOBILE BASE URL]: ${url} (scriptURL: ${scriptURL})`)
  return url
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(clearCredentials())
        } catch (err) {
          console.error("Logout mutation error:", err)
        }
      },
    }),
    getMe: builder.query<ApiResponse<{ user: User; detail: any }>, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
} = baseApi
