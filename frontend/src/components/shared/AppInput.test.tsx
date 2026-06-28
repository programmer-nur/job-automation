import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppInput } from "./AppInput";

describe("AppInput", () => {
  it("renders an input element", () => {
    render(<AppInput />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders a label when provided", () => {
    render(<AppInput label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("uses label to generate id when no id is provided", () => {
    render(<AppInput label="Full Name" />);
    const input = screen.getByLabelText("Full Name");
    expect(input).toHaveAttribute("id", "full-name");
  });

  it("uses provided id over label-generated id", () => {
    render(<AppInput label="Email" id="custom-id" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("shows error message and sets aria-invalid", () => {
    render(<AppInput error="This field is required" />);

    expect(screen.getByRole("alert")).toHaveTextContent("This field is required");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows hint text when no error", () => {
    render(<AppInput hint="Enter your full name" />);

    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not show hint when error is present", () => {
    render(<AppInput error="Required" hint="Should not show" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.queryByText("Should not show")).not.toBeInTheDocument();
  });

  it("calls onChange when value changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<AppInput onChange={handleChange} />);
    await user.type(screen.getByRole("textbox"), "a");

    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards ref", () => {
    const ref = { current: null };

    render(<AppInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
