"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/store/api/slices/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { AppText, AppButton, AppInput } from "@/components/shared";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);

    try {
      const result = await login({ email, password }).unwrap();
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
      setServerError(apiError?.data?.message ?? "Login failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <AppText variant="h2">Welcome back</AppText>
        <AppText variant="bodySm" color="muted">
          Sign in to your account
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
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <AppButton type="submit" loading={isLoading} className="w-full">
          Sign in
        </AppButton>
      </form>

      <div className="text-center">
        <AppText variant="small" color="muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </AppText>
      </div>
    </div>
  );
}
