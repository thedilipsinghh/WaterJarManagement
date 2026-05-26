import { baseApi } from "./baseApi"
import { ApiResponse, CreateCustomerPayload, CreateBillPayload, DashboardStats } from "@waterjar/types"

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendorCustomers: builder.query<ApiResponse<any[]>, void>({
      query: () => "/vendor/customers",
      providesTags: ["Customers"],
    }),
    createVendorCustomer: builder.mutation<ApiResponse<any>, Omit<CreateCustomerPayload, "vendorId">>({
      query: (data) => ({
        url: "/vendor/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customers", "Stats"],
    }),
    updateVendorCustomer: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/vendor/customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteVendorCustomer: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/vendor/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers", "Stats"],
    }),
    toggleCustomerStatus: builder.mutation<ApiResponse<any>, { id: number; status: "active" | "blocked" }>({
      query: ({ id, status }) => ({
        url: `/vendor/customers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Customers"],
    }),
    toggleCustomerService: builder.mutation<ApiResponse<any>, { id: number; serviceStatus: "active" | "stopped" }>({
      query: ({ id, serviceStatus }) => ({
        url: `/vendor/customers/${id}/service`,
        method: "PATCH",
        body: { serviceStatus },
      }),
      invalidatesTags: ["Customers", "Stats"],
    }),
    sendBill: builder.mutation<ApiResponse<any>, CreateBillPayload>({
      query: (data) => ({
        url: "/vendor/bills",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bills", "Reports", "Stats"],
    }),
    getVendorStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => "/vendor/stats",
      providesTags: ["Stats"],
    }),
    getVendorJarUsage: builder.query<ApiResponse<{ month: string; quantity: number }[]>, void>({
      query: () => "/vendor/jar-usage",
      providesTags: ["Usage"],
    }),
    getVendorReports: builder.query<ApiResponse<any[]>, void>({
      query: () => "/vendor/reports",
      providesTags: ["Reports"],
    }),
    getVendorOrders: builder.query<ApiResponse<any[]>, void>({
      query: () => "/vendor/orders",
      providesTags: ["Orders"],
    }),
    deliverOrder: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/vendor/orders/${id}/deliver`,
        method: "PATCH",
      }),
      invalidatesTags: ["Orders", "Stats", "Usage"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetVendorCustomersQuery,
  useCreateVendorCustomerMutation,
  useUpdateVendorCustomerMutation,
  useDeleteVendorCustomerMutation,
  useToggleCustomerStatusMutation,
  useToggleCustomerServiceMutation,
  useSendBillMutation,
  useGetVendorStatsQuery,
  useGetVendorJarUsageQuery,
  useGetVendorReportsQuery,
  useGetVendorOrdersQuery,
  useDeliverOrderMutation,
} = vendorApi
