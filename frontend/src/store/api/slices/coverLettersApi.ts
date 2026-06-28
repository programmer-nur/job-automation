import { api } from "@/store/api/baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  CoverLetter,
} from "@/store/types/api";

interface GenerateCoverLetterInput {
  jobId: string;
  resumeId?: string;
  applicationId?: string;
  additionalNotes?: string;
}

export const coverLettersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCoverLetters: builder.query<PaginatedResponse<CoverLetter>, void>({
      query: () => "/cover-letters",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "CoverLetter" as const,
                id,
              })),
              "CoverLetter",
            ]
          : ["CoverLetter"],
    }),

    getCoverLetter: builder.query<ApiResponse<CoverLetter>, string>({
      query: (id) => `/cover-letters/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CoverLetter", id }],
    }),

    generateCoverLetter: builder.mutation<
      ApiResponse<CoverLetter>,
      GenerateCoverLetterInput
    >({
      query: (body) => ({
        url: "/cover-letters/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CoverLetter"],
    }),

    updateCoverLetter: builder.mutation<
      ApiResponse<CoverLetter>,
      { id: string; data: Partial<{ content: string }> }
    >({
      query: ({ id, data }) => ({
        url: `/cover-letters/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CoverLetter", id },
        "CoverLetter",
      ],
    }),

    deleteCoverLetter: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/cover-letters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "CoverLetter", id },
        "CoverLetter",
      ],
    }),
  }),
});

export const {
  useGetCoverLettersQuery,
  useGetCoverLetterQuery,
  useGenerateCoverLetterMutation,
  useUpdateCoverLetterMutation,
  useDeleteCoverLetterMutation,
} = coverLettersApi;
