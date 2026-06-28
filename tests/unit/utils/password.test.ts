import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "@/utils/password.js";

describe("password utils", () => {
  it("hashPassword returns a hash", async () => {
    const hash = await hashPassword("testpassword");
    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe("testpassword");
  });

  it("comparePassword returns true for matching password", async () => {
    const password = "testpassword";
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);
    expect(result).toBe(true);
  });

  it("comparePassword returns false for wrong password", async () => {
    const hash = await hashPassword("correctpassword");
    const result = await comparePassword("wrongpassword", hash);
    expect(result).toBe(false);
  });
});
