import { describe, it, expect } from "vitest";
import { getPaginationParams, getPaginationMeta } from "@/utils/pagination.js";

describe("pagination utils", () => {
  describe("getPaginationParams", () => {
    it("returns default skip/take for no params", () => {
      const result = getPaginationParams();
      expect(result.skip).toBe(0);
      expect(result.take).toBe(20);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("calculates skip correctly for page 2", () => {
      const result = getPaginationParams(2, 10);
      expect(result.skip).toBe(10);
      expect(result.take).toBe(10);
    });

    it("caps limit at 100", () => {
      const result = getPaginationParams(1, 200);
      expect(result.take).toBe(100);
    });

    it("enforces minimum page of 1", () => {
      const result = getPaginationParams(0, 20);
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });
  });

  describe("getPaginationMeta", () => {
    it("calculates totalPages correctly", () => {
      const meta = getPaginationMeta(50, 1, 20);
      expect(meta).toEqual({
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      });
    });

    it("handles empty results", () => {
      const meta = getPaginationMeta(0, 1, 20);
      expect(meta.totalPages).toBe(0);
    });
  });
});
