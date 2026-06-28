import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { TAG_TYPES } from "./tagTypes";
import { RootState } from "../index";
import { tokenRefreshed, logout } from "../slices/authSlice";
import type { ApiResponse } from "@/store/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh-token",
          method: "POST",
          body: { refreshToken },
          credentials: "include",
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const response = refreshResult.data as ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>;
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        api.dispatch(tokenRefreshed({ accessToken, refreshToken: newRefreshToken }));

        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
