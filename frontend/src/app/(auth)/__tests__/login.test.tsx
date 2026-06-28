import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../login/page";

const mockPush = vi.fn();
const mockDispatch = vi.fn();
const mockLogin = vi.fn().mockReturnValue({
  unwrap: () => Promise.reject(new Error("not called")),
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock("@/store/api/slices/authApi", () => ({
  useLoginMutation: vi.fn(() => [mockLogin, { isLoading: false }]),
}));

function renderPage() {
  return render(<LoginPage />);
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the heading", () => {
    renderPage();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderPage();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders link to register page", () => {
    renderPage();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("shows validation error for empty email on submit", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("does not call mutation when validation fails", () => {
    renderPage();
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login mutation when validation passes", () => {
    renderPage();
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
    });
  });

  it("shows error alert when login fails", async () => {
    mockLogin.mockReturnValue({
      unwrap: () => Promise.reject({ data: { message: "Invalid credentials" } }),
    });

    renderPage();
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
