"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

import { images } from "@/src/lib/images";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to reset password.");
      }

      setMessage("Password reset successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#031f18] text-white">
      {/* =========================================================
          BACKGROUND EFFECTS
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#00C833]/20 blur-[100px]" />
        <div className="absolute bottom-[-180px] left-[10%] h-[450px] w-[450px] rounded-full bg-[#00C833]/10 blur-[100px]" />
        <div className="absolute right-[-180px] top-[20%] h-[500px] w-[500px] rounded-full bg-[#16A34A]/10 blur-[120px]" />

        <div className="absolute -bottom-[300px] -left-[180px] h-[500px] w-[900px] rotate-[15deg] rounded-[50%] border-[80px] border-[#00C833]/20" />
        <div className="absolute -bottom-[330px] -left-[230px] h-[500px] w-[900px] rotate-[15deg] rounded-[50%] border-[35px] border-[#16A34A]/30" />
      </div>

      {/* =========================================================
          TOP BAR
      ========================================================= */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="GrowVest home"
        >
          <Image
            src={images.brandLogo}
            alt="GrowVest"
            width={76}
            height={76}
            priority
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
          />

          <div className="flex flex-col">
            <h1 className="text-2xl font-black leading-none tracking-tight text-[#35e889] sm:text-3xl">
              Grow<span className="text-[#35e889]">Vest</span>
            </h1>

            <div className="mt-1.5 flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.3em] text-[#8edbb0] sm:text-[9px]">
              <span>Invest</span>
              <span>•</span>
              <span>Grow</span>
              <span>•</span>
              <span>Together</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
          <span className="hidden text-white/75 sm:inline">Need help?</span>

          <Link
            href="/login"
            className="group flex items-center gap-1.5 font-semibold text-[#35e889] transition hover:text-[#69f5a9]"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Login
          </Link>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT — CENTERED CARD
      ========================================================= */}
      <div className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 pb-10 pt-4 sm:px-10">
        <div className="w-full max-w-[500px] overflow-hidden rounded-[22px] border border-[#76dca7]/35 bg-[#062c25]/80 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#00C833]/10 blur-[60px]" />

          <div className="relative">
            {!token ? (
              <>
                {/* INVALID TOKEN STATE */}
                <div className="mb-7 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-400">
                    <LockKeyhole size={26} strokeWidth={2.2} />
                  </div>
                </div>

                <h2 className="text-center text-3xl font-bold tracking-tight sm:text-[32px]">
                  Invalid Reset Link
                </h2>

                <p className="mt-2 text-center text-sm text-white/60">
                  This password reset link is missing or invalid.
                </p>

                <Link
                  href="/forgot-password"
                  className="mt-8 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#55ed96] via-[#20db76] to-[#00C833] text-base font-bold text-[#03291e] shadow-[0_10px_30px_rgba(0,200,51,0.2)] transition hover:brightness-110"
                >
                  Request a New Link
                  <ArrowRight size={20} strokeWidth={2.5} />
                </Link>
              </>
            ) : (
              <>
                {/* VALID TOKEN STATE */}
                <div className="mb-7 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#35e889]/30 bg-[#00C833]/10 text-[#35e889]">
                    <KeyRound size={26} strokeWidth={2.2} />
                  </div>
                </div>

                <h2 className="text-center text-3xl font-bold tracking-tight sm:text-[32px]">
                  Reset Password
                </h2>

                <p className="mt-2 text-center text-sm text-white/60">
                  Create a new password for your Grow Vest account.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      New Password
                    </label>

                    <div className="group flex h-[55px] items-center rounded-xl border border-white/35 bg-[#031f1a]/50 px-4 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30">
                      <LockKeyhole
                        size={21}
                        className="mr-4 shrink-0 text-white/65 transition group-focus-within:text-[#35e889]"
                      />

                      <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Confirm Password
                    </label>

                    <div className="group flex h-[55px] items-center rounded-xl border border-white/35 bg-[#031f1a]/50 px-4 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30">
                      <LockKeyhole
                        size={21}
                        className="mr-4 shrink-0 text-white/65 transition group-focus-within:text-[#35e889]"
                      />

                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="rounded-xl border border-[#35e889]/30 bg-[#00C833]/10 px-4 py-3 text-sm text-[#9ef2b0]">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#55ed96] via-[#20db76] to-[#00C833] text-base font-bold text-[#03291e] shadow-[0_10px_30px_rgba(0,200,51,0.2)] transition hover:brightness-110 hover:shadow-[0_12px_35px_rgba(0,200,51,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      "Updating..."
                    ) : (
                      <>
                        <ArrowRight
                          size={21}
                          strokeWidth={2.5}
                          className="transition-transform group-hover:translate-x-1"
                        />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Bottom trust row */}
            <div className="mt-8 flex items-center justify-center border-t border-white/10 pt-6">
              <SecurityItem
                icon={<ShieldCheck size={18} />}
                text="100% Secure"
              />

              <div className="mx-3 h-7 w-px bg-white/15" />

              <SecurityItem
                icon={<LockKeyhole size={17} />}
                text="SSL Encrypted"
              />

              <div className="mx-3 h-7 w-px bg-white/15" />

              <SecurityItem
                icon={<ShieldCheck size={18} />}
                text="Trusted Platform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <div className="relative z-10 hidden pb-5 text-center lg:block">
        <div className="mx-auto flex max-w-[500px] items-center justify-center gap-3 text-[9px] uppercase tracking-[0.3em] text-white/45">
          <span className="h-px w-8 bg-white/20" />
          Smart Investments for a Brighter Future
          <span className="h-px w-8 bg-white/20" />
        </div>

        <p className="mt-2 text-xs font-semibold tracking-[0.25em] text-[#35e889]">
          growvest.xyz
        </p>
      </div>
    </main>
  );
}

/* =============================================================
   SECURITY ITEM
============================================================= */

function SecurityItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-white/65">
      <span className="text-[#35e889]">{icon}</span>
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
}