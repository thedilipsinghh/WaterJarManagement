import { baseApi } from "./baseApi"
import { ApiResponse, CreateVendorPayload, CreateCustomerPayload } from "@waterjar/types"

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<ApiResponse<any[]>, void>({
      query: () => "/admin/vendors",
      providesTags: ["Vendors"],
    }),
    createVendor: builder.mutation<ApiResponse<any>, CreateVendorPayload>({
      query: (data) => ({
        url: "/admin/vendors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vendors"],
    }),
    updateVendor: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/vendors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Vendors"],
    }),
    deleteVendor: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/admin/vendors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vendors"],
    }),
    getAdminCustomers: builder.query<ApiResponse<any[]>, void>({
      query: () => "/admin/customers",
      providesTags: ["Customers"],
    }),
    createAdminCustomer: builder.mutation<ApiResponse<any>, CreateCustomerPayload>({
      query: (data) => ({
        url: "/admin/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    updateAdminCustomer: builder.mutation<ApiResponse<any>, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteAdminCustomer: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/admin/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
    toggleUserBlock: builder.mutation<ApiResponse<any>, { id: number; status: "active" | "blocked" }>({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Vendors", "Customers"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetAdminCustomersQuery,
  useCreateAdminCustomerMutation,
  useUpdateAdminCustomerMutation,
  useDeleteAdminCustomerMutation,
  useToggleUserBlockMutation,
} = adminApi
