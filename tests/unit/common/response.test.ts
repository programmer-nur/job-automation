import { describe, it, expect } from "vitest";
import { success, error } from "@/common/response.js";

describe("response helpers", () => {
  describe("success", () => {
    it("returns success response with data", () => {
      const res = success({ id: "1" });
      expect(res).toEqual({
        success: true,
        data: { id: "1" },
      });
    });

    it("includes message when provided", () => {
      const res = success(null, "Done");
      expect(res.message).toBe("Done");
    });

    it("includes meta when provided", () => {
      const meta = { page: 1, limit: 20, total: 100, totalPages: 5 };
      const res = success([], undefined, meta);
      expect(res.meta).toEqual(meta);
    });
  });

  describe("error", () => {
    it("returns error response with message", () => {
      const res = error("Something went wrong");
      expect(res).toEqual({
        success: false,
        message: "Something went wrong",
        data: null,
      });
    });

    it("includes errors when provided", () => {
      const errors = [{ field: "email", message: "Invalid" }];
      const res = error("Validation failed", errors);
      expect(res.errors).toEqual(errors);
    });
  });
});
