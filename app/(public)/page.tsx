"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const referralFromUrl = searchParams.get("ref") || "";

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [referralCode, setReferralCode] =
    useState(referralFromUrl);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors?.length) {
          setError(data.errors[0].message);
        } else {
          setError(
            data.message || "Registration failed."
          );
        }

        return;
      }

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#faf9ff] to-[#f0eeff] px-4 py-7">
      <div className="mx-auto flex w-full max-w-md flex-col">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#101b61] shadow-lg">
            <span className="text-xl font-extrabold text-white">
              PW
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-extrabold text-[#111b58]">
            Prime Way
          </h1>

          <p className="text-[8px] font-medium tracking-[0.28em] text-gray-500">
            INVEST TODAY, EARN TOMORROW
          </p>
        </div>

        {/* Register Card */}
        <section className="mt-7 rounded-3xl bg-white p-5 shadow-xl">
          <div className="mb-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>

            <h2 className="text-2xl font-bold text-[#111b58]">
              Create Account
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create your Prime Way account to get started.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
                autoComplete="name"
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
                autoComplete="username"
                pattern="[a-zA-Z0-9_]+"
                title="Only letters, numbers and underscores are allowed."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />

              <p className="mt-1 text-[11px] text-gray-400">
                Letters, numbers and underscores only.
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="mt-1 text-[11px] text-gray-400">
                Minimum 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Referral */}
            <div>
              <label
                htmlFor="referralCode"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Referral Code
                <span className="ml-1 text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(event) =>
                  setReferralCode(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm uppercase outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-5 border-t border-gray-100 pt-5 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-purple-600 hover:text-purple-700"
              >
                Login
              </Link>
            </p>
          </div>
        </section>

        {/* Back */}
        <Link
          href="/"
          className="mt-5 text-center text-xs text-gray-500 hover:text-purple-600"
        >
          ← Back to Prime Way
        </Link>
      </div>
    </main>
  );
}