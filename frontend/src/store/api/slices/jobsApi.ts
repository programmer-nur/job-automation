import { api as rootApi } from "@/store/api/baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  Job,
  CreateJobInput,
  ImportJobInput,
} from "@/store/types/api";

const updateCache = rootApi.util.updateQueryData as (
  endpoint: string,
  args: unknown,
  updater: (draft: unknown) => void,
) => ReturnType<ReturnType<typeof rootApi.util.updateQueryData>>;

type JobDraft = { data: Job[]; meta: { total: number } };

interface MatchScoreResponse {
  score: number;
}

export const jobsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<
      PaginatedResponse<Job>,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: (params) => ({
        url: "/jobs",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Job" as const, id })),
              "Job",
            ]
          : ["Job"],
    }),

    getJob: builder.query<ApiResponse<Job>, string>({
      query: (id) => `/jobs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Job", id }],
    }),

    createJob: builder.mutation<ApiResponse<Job>, CreateJobInput>({
      query: (body) => ({
        url: "/jobs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Job"],
    }),

    importJob: builder.mutation<ApiResponse<Job>, ImportJobInput>({
      query: (body) => ({
        url: "/jobs/import",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Job"],
    }),

    updateJob: builder.mutation<
      ApiResponse<Job>,
      { id: string; data: Partial<CreateJobInput> }
    >({
      query: ({ id, data }) => ({
        url: `/jobs/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Job", id },
        "Job",
      ],
    }),

    deleteJob: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Job", id },
        "Job",
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          updateCache("getJobs", {}, (draft) => {
            const d = draft as JobDraft;
            const idx = d.data.findIndex((j) => j.id === id);
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

    favoriteJob: builder.mutation<
      ApiResponse<Job>,
      { id: string; isFavorite: boolean }
    >({
      query: ({ id, isFavorite }) => ({
        url: `/jobs/${id}/favorite`,
        method: "PATCH",
        body: { isFavorite },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Job", id },
        "Job",
      ],
      async onQueryStarted({ id, isFavorite }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          updateCache("getJobs", {}, (draft) => {
            const d = draft as JobDraft;
            const job = d.data.find((j) => j.id === id);
            if (job) job.isFavorite = isFavorite;
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    updateJobStatus: builder.mutation<
      ApiResponse<Job>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/jobs/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Job", id },
        "Job",
      ],
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          updateCache("getJobs", {}, (draft) => {
            const d = draft as JobDraft;
            const job = d.data.find((j) => j.id === id);
            if (job) job.status = status as Job["status"];
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    scoreJob: builder.mutation<ApiResponse<MatchScoreResponse>, string>({
      query: (id) => ({
        url: `/jobs/${id}/score`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Job", id },
        "Job",
      ],
    }),

    parseJobDescription: builder.mutation<ApiResponse<Job>, string>({
      query: (id) => ({
        url: `/jobs/${id}/parse`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Job", id },
        "Job",
      ],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useImportJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useFavoriteJobMutation,
  useUpdateJobStatusMutation,
  useScoreJobMutation,
  useParseJobDescriptionMutation,
} = jobsApi;
