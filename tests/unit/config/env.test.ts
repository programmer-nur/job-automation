import { describe, it, expect } from "vitest";

describe("config env", () => {
  it("loads env vars with correct defaults", async () => {
    const { config } = await import("@/config/env.js");
    expect(config.NODE_ENV).toBe("test");
    expect(config.PORT).toBe(5000);
    expect(config.LOG_LEVEL).toBe("silent");
    expect(config.JWT_SECRET).toBeTruthy();
    expect(config.CORS_ORIGIN).toBe("http://localhost:3000");
  });
});
