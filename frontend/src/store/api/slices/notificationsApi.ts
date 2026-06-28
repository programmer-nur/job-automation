import { api } from "@/store/api/baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  Notification,
  QueryParams,
} from "@/store/types/api";

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      PaginatedResponse<Notification>,
      QueryParams
    >({
      query: (params) => ({
        url: "/notifications",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Notification" as const,
                id,
              })),
              "Notification",
            ]
          : ["Notification"],
    }),

    markNotificationRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Notification", id },
        "Notification",
      ],
    }),

    markAllNotificationsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
