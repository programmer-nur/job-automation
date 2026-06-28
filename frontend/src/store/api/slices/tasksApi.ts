import { api as rootApi } from "@/store/api/baseApi";
import type {
  ApiResponse,
  PaginatedResponse,
  Task,
  CreateTaskInput,
} from "@/store/types/api";

const updateCache = rootApi.util.updateQueryData as (
  endpoint: string,
  args: unknown,
  updater: (draft: unknown) => void,
) => ReturnType<ReturnType<typeof rootApi.util.updateQueryData>>;

type TaskDraft = { data: Task[]; meta: { total: number } };

export const tasksApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<
      PaginatedResponse<Task>,
      { page?: number; limit?: number; status?: string }
    >({
      query: (params) => ({
        url: "/tasks",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Task" as const,
                id,
              })),
              "Task",
            ]
          : ["Task"],
    }),

    getTask: builder.query<ApiResponse<Task>, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),

    createTask: builder.mutation<ApiResponse<Task>, CreateTaskInput>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Task"],
    }),

    updateTask: builder.mutation<
      ApiResponse<Task>,
      { id: string; data: Partial<CreateTaskInput> }
    >({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Task", id },
        "Task",
      ],
    }),

    completeTask: builder.mutation<ApiResponse<Task>, string>({
      query: (id) => ({
        url: `/tasks/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Task", id },
        "Task",
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          updateCache("getTasks", {}, (draft) => {
            const d = draft as TaskDraft;
            const task = d.data.find((t) => t.id === id);
            if (task) task.status = "COMPLETED" as Task["status"];
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    deleteTask: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Task", id },
        "Task",
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          updateCache("getTasks", {}, (draft) => {
            const d = draft as TaskDraft;
            const idx = d.data.findIndex((t) => t.id === id);
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
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCompleteTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
