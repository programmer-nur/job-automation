import { describe, it, expect } from "vitest";
import { AppError } from "@/common/errors.js";

describe("AppError", () => {
  it("creates an error with status and code", () => {
    const err = new AppError(400, "BAD_REQUEST", "Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Invalid input");
  });

  it("static notFound creates 404 error", () => {
    const err = AppError.notFound("User");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("User not found");
  });

  it("static badRequest creates 400 error", () => {
    const err = AppError.badRequest("Invalid data");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
  });

  it("static unauthorized creates 401 error", () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("static forbidden creates 403 error", () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("static conflict creates 409 error", () => {
    const err = AppError.conflict("Resource exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("static validation creates 422 error with details", () => {
    const details = [{ field: "email", message: "Invalid email" }];
    const err = AppError.validation(details);
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(details);
  });

  it("toJSON returns serialized error", () => {
    const err = AppError.notFound("User");
    const json = err.toJSON();
    expect(json).toEqual({
      success: false,
      message: "User not found",
      code: "NOT_FOUND",
    });
  });
});
