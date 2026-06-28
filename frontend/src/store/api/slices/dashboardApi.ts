import { api } from "@/store/api/baseApi";
import type {
  ApiResponse,
  DashboardSummary,
  MonthlyAnalytics,
  MatchScoreAnalytics,
  ApplicationSource,
} from "@/store/types/api";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<ApiResponse<DashboardSummary>, void>({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),

    getMonthlyAnalytics: builder.query<
      ApiResponse<MonthlyAnalytics[]>,
      void
    >({
      query: () => "/dashboard/monthly",
      providesTags: ["Dashboard"],
    }),

    getMatchScores: builder.query<
      ApiResponse<MatchScoreAnalytics[]>,
      void
    >({
      query: () => "/dashboard/match-scores",
      providesTags: ["Dashboard"],
    }),

    getApplicationSources: builder.query<
      ApiResponse<ApplicationSource[]>,
      void
    >({
      query: () => "/dashboard/sources",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetMonthlyAnalyticsQuery,
  useGetMatchScoresQuery,
  useGetApplicationSourcesQuery,
} = dashboardApi;
