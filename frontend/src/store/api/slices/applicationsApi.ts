import { api as rootApi } from "@/store/api/baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  Application,
  CreateApplicationInput,
} from "@/store/types/api";

const updateCache = rootApi.util.updateQueryData as (
  endpoint: string,
  args: unknown,
  updater: (draft: unknown) => void,
) => ReturnType<ReturnType<typeof rootApi.util.updateQueryData>>;

type ApplicationDraft = { data: Application[]; meta: { total: number } };

export const applicationsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<
      PaginatedResponse<Application>,
      { page?: number; limit?: number; status?: string; jobId?: string }
    >({
      query: (params) => ({
        url: "/applications",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Application" as const,
                id,
              })),
              "Application",
            ]
          : ["Application"],
    }),

    getApplication: builder.query<ApiResponse<Application>, string>({
      query: (id) => `/applications/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Application", id }],
    }),

    createApplication: builder.mutation<
      ApiResponse<Application>,
      CreateApplicationInput
    >({
      query: (body) => ({
        url: "/applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Application", "Dashboard"],
    }),

    updateApplication: builder.mutation<
      ApiResponse<Application>,
      { id: string; data: Partial<CreateApplicationInput> }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Application", id },
        "Application",
      ],
    }),

    deleteApplication: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Application", id },
        "Application",
        "Dashboard",
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          updateCache("getApplications", {}, (draft) => {
            const d = draft as ApplicationDraft;
            const idx = d.data.findIndex((a) => a.id === id);
            if (idx !== -1) d.data.splice(idx, 1);
            d.meta.total = Math.max(0, d.meta.total - 1);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    updateApplicationStatus: builder.mutation<
      ApiResponse<Application>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/applications/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Application", id },
        "Application",
        "Dashboard",
      ],
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          updateCache("getApplications", {}, (draft) => {
            const d = draft as ApplicationDraft;
            const app = d.data.find((a) => a.id === id);
            if (app) app.status = status as Application["status"];
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    scheduleFollowUp: builder.mutation<
      ApiResponse<Application>,
      { id: string; followUpDate: string }
    >({
      query: ({ id, followUpDate }) => ({
        url: `/applications/${id}/follow-up`,
        method: "PATCH",
        body: { followUpDate },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Application", id },
        "Application",
      ],
    }),

    addApplicationNotes: builder.mutation<
      ApiResponse<Application>,
      { id: string; notes: string }
    >({
      query: ({ id, notes }) => ({
        url: `/applications/${id}/notes`,
        method: "PATCH",
        body: { notes },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Application", id },
        "Application",
      ],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useUpdateApplicationStatusMutation,
  useScheduleFollowUpMutation,
  useAddApplicationNotesMutation,
} = applicationsApi;
