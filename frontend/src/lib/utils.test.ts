import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges Tailwind classes correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles conditional class expressions", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles clsx array syntax", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("handles clsx object syntax", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});
