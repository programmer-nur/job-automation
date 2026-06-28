import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppSpinner } from "./AppSpinner";

describe("AppSpinner", () => {
  it("renders with role status and loading label", () => {
    render(<AppSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading");
  });

  it("applies default md size", () => {
    render(<AppSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("size-6");
  });

  it("applies size classes", () => {
    const { rerender } = render(<AppSpinner size="sm" />);
    expect(screen.getByRole("status").className).toContain("size-4");

    rerender(<AppSpinner size="lg" />);
    expect(screen.getByRole("status").className).toContain("size-8");

    rerender(<AppSpinner size="xl" />);
    expect(screen.getByRole("status").className).toContain("size-10");
  });

  it("applies custom className", () => {
    render(<AppSpinner className="custom-spinner" />);
    expect(screen.getByRole("status").className).toContain("custom-spinner");
  });

  it("has animate-spin class", () => {
    render(<AppSpinner />);
    expect(screen.getByRole("status").className).toContain("animate-spin");
  });
});
