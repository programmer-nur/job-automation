import { api } from "@/store/api/baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  Resume,
} from "@/store/types/api";

export const resumesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getResumes: builder.query<PaginatedResponse<Resume>, void>({
      query: () => "/resumes",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Resume" as const,
                id,
              })),
              "Resume",
            ]
          : ["Resume"],
    }),

    getResume: builder.query<ApiResponse<Resume>, string>({
      query: (id) => `/resumes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Resume", id }],
    }),

    uploadResume: builder.mutation<
      ApiResponse<Resume>,
      FormData
    >({
      query: (body) => ({
        url: "/resumes",
        method: "POST",
        body,
        formData: true,
      }),
      invalidatesTags: ["Resume"],
    }),

    updateResume: builder.mutation<
      ApiResponse<Resume>,
      { id: string; data: Partial<{ fileName: string }> }
    >({
      query: ({ id, data }) => ({
        url: `/resumes/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Resume", id },
        "Resume",
      ],
    }),

    deleteResume: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/resumes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Resume", id },
        "Resume",
      ],
    }),

    setDefaultResume: builder.mutation<ApiResponse<Resume>, string>({
      query: (id) => ({
        url: `/resumes/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Resume", id },
        "Resume",
      ],
    }),

    tailorResume: builder.mutation<
      ApiResponse<Resume>,
      { id: string; jobId: string }
    >({
      query: ({ id, jobId }) => ({
        url: `/resumes/${id}/tailor`,
        method: "POST",
        body: { jobId },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Resume", id },
        "Resume",
      ],
    }),
  }),
});

export const {
  useGetResumesQuery,
  useGetResumeQuery,
  useUploadResumeMutation,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useSetDefaultResumeMutation,
  useTailorResumeMutation,
} = resumesApi;
