"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegisterMutation } from "@/store/api/slices/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { AppText, AppButton, AppInput } from "@/components/shared";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  function validate() {
    const errs: typeof errors = {};
    if (!name) errs.name = "Name is required";
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);

    try {
      const result = await register({ name, email, password }).unwrap();
      dispatch(
        setCredentials({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          user: result.data.user,
        }),
      );
      router.push("/");
    } catch (err) {
      const apiError = err as { data?: { message?: string } };
      setServerError(apiError?.data?.message ?? "Registration failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <AppText variant="h2">Create account</AppText>
        <AppText variant="bodySm" color="muted">
          Start managing your job applications
        </AppText>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AppText variant="small" color="destructive">
              {serverError}
            </AppText>
          </div>
        )}

        <AppInput
          label="Name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <AppInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <AppInput
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <AppButton type="submit" loading={isLoading} className="w-full">
          Create account
        </AppButton>
      </form>

      <div className="text-center">
        <AppText variant="small" color="muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </AppText>
      </div>
    </div>
  );
}
