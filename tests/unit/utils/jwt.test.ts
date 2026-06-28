import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/jwt.js";

const payload = { userId: "user-1", role: "USER" };

describe("jwt utils", () => {
  it("signAccessToken creates a valid token", () => {
    const token = signAccessToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifyAccessToken decodes a valid token", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe("user-1");
    expect(decoded.role).toBe("USER");
  });

  it("signRefreshToken creates a different token", () => {
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    expect(refreshToken).not.toBe(accessToken);
  });

  it("verifyRefreshToken decodes a valid token", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe("user-1");
  });

  it("verifyAccessToken throws for invalid token", () => {
    expect(() => verifyAccessToken("invalid-token")).toThrow();
  });
});
