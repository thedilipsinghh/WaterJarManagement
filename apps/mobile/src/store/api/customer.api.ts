import { baseApi } from "./baseApi"
import { ApiResponse, Order, CreateOrderPayload, Bill, MonthlyUsage } from "@waterjar/types"

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => "/customer/orders",
      providesTags: ["Orders"],
    }),
    getCustomerMonthlyOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => "/customer/orders/monthly",
      providesTags: ["Orders"],
    }),
    createCustomerOrder: builder.mutation<ApiResponse<Order>, Omit<CreateOrderPayload, "customerId">>({
      query: (data) => ({
        url: "/customer/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders", "Stats"],
    }),
    getCustomerBills: builder.query<ApiResponse<Bill[]>, void>({
      query: () => "/customer/bills",
      providesTags: ["Bills"],
    }),
    getCustomerSpending: builder.query<ApiResponse<MonthlyUsage[]>, void>({
      query: () => "/customer/spending",
      providesTags: ["Usage"],
    }),
    requestStopService: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: "/customer/service-requests/stop",
        method: "POST",
      }),
      invalidatesTags: ["Customers", "Stats"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetCustomerOrdersQuery,
  useGetCustomerMonthlyOrdersQuery,
  useCreateCustomerOrderMutation,
  useGetCustomerBillsQuery,
  useGetCustomerSpendingQuery,
  useRequestStopServiceMutation,
} = customerApi
