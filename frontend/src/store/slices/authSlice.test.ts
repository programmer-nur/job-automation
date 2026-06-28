import { describe, it, expect } from "vitest";
import reducer, {
  setCredentials,
  setUser,
  tokenRefreshed,
  logout,
  setLoading,
} from "./authSlice";
import type { User } from "@/store/types/api";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "USER",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("authSlice", () => {
  describe("initial state", () => {
    it("has loading true and no credentials", () => {
      const state = reducer(undefined, { type: "unknown" });
      expect(state).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: true,
      });
    });
  });

  describe("setCredentials", () => {
    it("sets user, tokens, isAuthenticated, and disables loading", () => {
      const state = reducer(
        undefined,
        setCredentials({
          accessToken: "access-123",
          refreshToken: "refresh-456",
          user: mockUser,
        }),
      );

      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe("access-123");
      expect(state.refreshToken).toBe("refresh-456");
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });
  });

  describe("setUser", () => {
    it("updates user without changing tokens", () => {
      const stateWithCreds = reducer(
        undefined,
        setCredentials({
          accessToken: "access-123",
          refreshToken: "refresh-456",
          user: mockUser,
        }),
      );

      const updatedUser = { ...mockUser, name: "Updated Name" };
      const state = reducer(stateWithCreds, setUser(updatedUser));

      expect(state.user?.name).toBe("Updated Name");
      expect(state.accessToken).toBe("access-123");
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe("tokenRefreshed", () => {
    it("updates tokens without changing user or auth status", () => {
      const stateWithCreds = reducer(
        undefined,
        setCredentials({
          accessToken: "access-123",
          refreshToken: "refresh-456",
          user: mockUser,
        }),
      );

      const state = reducer(
        stateWithCreds,
        tokenRefreshed({
          accessToken: "new-access",
          refreshToken: "new-refresh",
        }),
      );

      expect(state.accessToken).toBe("new-access");
      expect(state.refreshToken).toBe("new-refresh");
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe("logout", () => {
    it("clears all auth state", () => {
      const stateWithCreds = reducer(
        undefined,
        setCredentials({
          accessToken: "access-123",
          refreshToken: "refresh-456",
          user: mockUser,
        }),
      );

      const state = reducer(stateWithCreds, logout());

      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("sets loading to false", () => {
      const state = reducer(undefined, setLoading(false));
      expect(state.loading).toBe(false);
    });

    it("sets loading to true", () => {
      const state = reducer(
        { user: null, accessToken: null, refreshToken: null, isAuthenticated: false, loading: false },
        setLoading(true),
      );
      expect(state.loading).toBe(true);
    });
  });
});
