import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppButton } from "./AppButton";

describe("AppButton", () => {
  it("renders children", () => {
    render(<AppButton>Click me</AppButton>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<AppButton onClick={handleClick}>Click</AppButton>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies size classes", () => {
    const { rerender } = render(<AppButton size="lg">Large</AppButton>);

    const button = screen.getByRole("button");
    expect(button.className).toContain("h-10");

    rerender(<AppButton size="sm">Small</AppButton>);
    expect(screen.getByRole("button").className).toContain("h-7");
  });

  it("applies variant classes", () => {
    render(<AppButton variant="danger">Danger</AppButton>);

    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-destructive");
  });

  it("shows spinner and is disabled when loading", () => {
    render(<AppButton loading>Loading</AppButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<AppButton disabled onClick={handleClick}>Disabled</AppButton>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<AppButton className="custom-class">Styled</AppButton>);

    expect(screen.getByRole("button").className).toContain("custom-class");
  });

  it("forwards ref", () => {
    const ref = { current: null };

    render(<AppButton ref={ref}>Ref</AppButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
