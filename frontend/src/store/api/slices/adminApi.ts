import { api } from "@/store/api/baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  AdminUser,
  AdminJob,
  AdminAiUsage,
  AuditLog,
  HealthCheck,
  QueryParams,
} from "@/store/types/api";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<PaginatedResponse<AdminUser>, QueryParams>({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: ["Admin"],
    }),

    getAdminJobs: builder.query<PaginatedResponse<AdminJob>, QueryParams>({
      query: (params) => ({
        url: "/admin/jobs",
        params,
      }),
      providesTags: ["Admin"],
    }),

    getAdminAiUsage: builder.query<
      PaginatedResponse<AdminAiUsage>,
      QueryParams
    >({
      query: (params) => ({
        url: "/admin/ai",
        params,
      }),
      providesTags: ["Admin"],
    }),

    getAdminAuditLogs: builder.query<
      PaginatedResponse<AuditLog>,
      QueryParams
    >({
      query: (params) => ({
        url: "/admin/audit-logs",
        params,
      }),
      providesTags: ["Admin"],
    }),

    getHealth: builder.query<ApiResponse<HealthCheck>, void>({
      query: () => "/health",
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminJobsQuery,
  useGetAdminAiUsageQuery,
  useGetAdminAuditLogsQuery,
  useGetHealthQuery,
} = adminApi;
