"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token") || "";

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to reset password."
        );
      }

      setMessage(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">
            Invalid Reset Link
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This password reset link is missing or invalid.
          </p>

          <Link
            href="/forgot-password"
            className="mt-5 inline-block font-medium text-[#16c784]"
          >
            Request a new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">
          Reset Password
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new password for your Grow Vest
          account.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#16c784]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#16c784]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#16c784] px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}