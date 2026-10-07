"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Gift,
  Users,
  Headphones,
  TrendingUp,
  Leaf,
} from "lucide-react";
import { images } from "@/src/lib/images";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresEmailVerification) {
          router.push(
            `/verify-email?email=${encodeURIComponent(
              data.email || email.trim().toLowerCase()
            )}`
          );

          return;
        }

        setError(data.message || "Login failed");
        return;
      }

      if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
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

        {/* Decorative green curves */}
        <div className="absolute -bottom-[300px] -left-[180px] h-[500px] w-[900px] rotate-[15deg] rounded-[50%] border-[80px] border-[#00C833]/20" />
        <div className="absolute -bottom-[330px] -left-[230px] h-[500px] w-[900px] rotate-[15deg] rounded-[50%] border-[35px] border-[#16A34A]/30" />
      </div>

      {/* =========================================================
          TOP BAR
      ========================================================= */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 md:px-10 lg:px-16">
        {/* Brand */}
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
          aria-label="GrowVest home"
        >
          <Image
            src={images.brandLogo}
            alt="GrowVest"
            width={76}
            height={76}
            priority
            className="h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14 lg:h-16 lg:w-16"
          />

          <div className="flex min-w-0 flex-col">
            <h1 className="text-lg font-black leading-none tracking-tight text-[#35e889] sm:text-2xl lg:text-3xl">
              Grow<span className="text-[#35e889]">Vest</span>
            </h1>

            <div className="mt-1 hidden items-center gap-1.5 text-[7px] font-medium uppercase tracking-[0.25em] text-[#8edbb0] xs:flex sm:gap-2 sm:text-[8px] sm:tracking-[0.3em] lg:text-[9px]">
              <span>Invest</span>
              <span>•</span>
              <span>Grow</span>
              <span>•</span>
              <span>Together</span>
            </div>
          </div>
        </Link>

        {/* Register — compact on mobile, full on sm+ */}
        <div className="flex shrink-0 items-center gap-2 text-xs sm:gap-3 sm:text-sm">
          <span className="hidden whitespace-nowrap text-white/75 md:inline">
            New here?
          </span>

          <Link
            href="/register"
            className="group inline-flex items-center gap-1 rounded-lg border border-[#35e889]/40 px-3 py-2 font-semibold text-[#35e889] transition hover:border-[#35e889] hover:bg-[#35e889]/10 hover:text-[#69f5a9] sm:gap-1.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
          >
            <span className="hidden xs:inline sm:hidden">
              Sign Up
            </span>
            <span className="hidden sm:inline">
              Create an Account
            </span>
            <span className="xs:hidden">
              Sign Up
            </span>

            <ArrowRight
              size={14}
              className="shrink-0 transition-transform group-hover:translate-x-1 sm:hidden"
            />
            <ArrowRight
              size={16}
              className="hidden shrink-0 transition-transform group-hover:translate-x-1 sm:block"
            />
          </Link>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1450px] flex-col px-4 pb-8 pt-2 sm:min-h-[calc(100vh-96px)] sm:px-6 sm:pt-4 md:px-10 lg:flex-row lg:items-center lg:gap-12 lg:px-16 lg:pt-0">
        {/* =======================================================
            LEFT SIDE
        ======================================================= */}
        <section className="flex w-full flex-1 flex-col justify-center pb-8 lg:min-h-[calc(100vh-120px)] lg:pb-0">
          {/* Eyebrow */}
          <div className="mb-4 flex items-center gap-3 sm:mb-5">
            <span className="h-px w-8 bg-[#00C833]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#35e889] sm:text-xs sm:tracking-[0.3em]">
              Smart Investment Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-[650px] text-3xl font-black leading-[1.05] tracking-[-0.03em] sm:text-4xl sm:leading-[1.02] sm:tracking-[-0.04em] md:text-5xl lg:text-[62px]">
            Grow Your Wealth
            <br />
            with{" "}
            <span className="bg-gradient-to-r from-[#35e889] via-[#00C833] to-[#8cffba] bg-clip-text text-transparent">
              GrowVest
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-[570px] text-sm leading-6 text-white/70 sm:mt-6 sm:text-base sm:leading-7">
            Trusted investment plans, attractive returns and a rewarding
            referral program. GrowVest helps you build wealth, one step at a
            time.
          </p>

          {/* =====================================================
              FEATURES
          ===================================================== */}
          <div className="mt-6 grid max-w-[600px] grid-cols-2 gap-x-4 gap-y-5 sm:mt-8 sm:grid-cols-4 sm:gap-x-0 sm:gap-y-0">
            <Feature
              icon={<TrendingUp size={21} strokeWidth={2.2} />}
              title="Secure & Trusted"
              description="Your funds, our priority"
              border
            />

            <Feature
              icon={<Gift size={21} strokeWidth={2.2} />}
              title="Attractive Returns"
              description="Grow your wealth"
              border
            />

            <Feature
              icon={<Users size={21} strokeWidth={2.2} />}
              title="Referral Rewards"
              description="Earn more together"
              border
            />

            <Feature
              icon={<Headphones size={21} strokeWidth={2.2} />}
              title="24/7 Support"
              description="We're always here"
            />
          </div>

          {/* =====================================================
              GROWTH VISUAL
          ===================================================== */}
          <div className="relative mt-6 w-full max-w-[650px] sm:mt-8 lg:mt-5">
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-end justify-center">
              <div className="h-32 w-56 rounded-full bg-[#00C833]/25 blur-[80px] sm:h-40 sm:w-72" />
            </div>

            <Image
              src={images.hero}
              alt="GrowVest — Invest, Grow, Together"
              width={900}
              height={600}
              priority
              className="h-auto w-full max-w-[620px] object-contain drop-shadow-[0_25px_60px_rgba(0,200,51,0.25)]"
            />
          </div>

          {/* Bottom trust strip */}
          <div className="hidden max-w-[520px] rounded-full border border-[#35e889]/30 bg-[#062c22]/90 px-5 py-3 backdrop-blur-md sm:flex sm:items-center sm:gap-5 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#35e889]/50 text-[#35e889]">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-xs font-bold">Your Security</p>
                <p className="text-xs text-white/65">Matters</p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center text-[#35e889]">
                <Leaf size={25} />
              </div>

              <div>
                <p className="text-xs font-bold">Grow Together</p>
                <p className="text-xs text-white/65">Build a Better Tomorrow</p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            RIGHT LOGIN CARD
        ======================================================= */}
        <section className="flex w-full justify-center lg:w-[500px] lg:shrink-0">
          <div className="relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-[#76dca7]/35 bg-[#062c25]/80 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[22px] sm:p-7 md:p-9 lg:p-10">
            {/* Card glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#00C833]/10 blur-[60px]" />

            <div className="relative">
              {/* Card Logo */}
              <div className="mb-5 flex justify-center sm:mb-8">
                <Link href="/">
                  <Image
                    src={images.brandLogo}
                    alt="GrowVest"
                    width={100}
                    height={100}
                    priority
                    className="h-14 w-14 object-contain sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]"
                  />
                </Link>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-[32px]">
                Welcome Back!
              </h2>

              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                Login to your GrowVest account
              </p>

              {/* =================================================
                  FORM
              ================================================= */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold text-white sm:mb-2 sm:text-sm"
                  >
                    Email Address or Username
                  </label>

                  <div className="group flex h-[50px] items-center rounded-xl border border-white/35 bg-[#031f1a]/50 px-3.5 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30 sm:h-[55px] sm:px-4">
                    <Mail
                      size={19}
                      className="mr-3 shrink-0 text-white/65 transition group-focus-within:text-[#35e889] sm:mr-4 sm:h-[21px] sm:w-[21px]"
                    />

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email or username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold text-white sm:mb-2 sm:text-sm"
                  >
                    Password
                  </label>

                  <div className="group flex h-[50px] items-center rounded-xl border border-white/35 bg-[#031f1a]/50 px-3.5 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30 sm:h-[55px] sm:px-4">
                    <LockKeyhole
                      size={19}
                      className="mr-3 shrink-0 text-white/65 transition group-focus-within:text-[#35e889] sm:mr-4 sm:h-[21px] sm:w-[21px]"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="-mr-1 ml-2 shrink-0 p-1 text-white/55 transition hover:text-[#35e889] sm:ml-3"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="sm:h-5 sm:w-5" />
                      ) : (
                        <Eye size={18} className="sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>

                  {/* Forgot / Verify — stacks on very small screens */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 sm:mt-3">
                    <Link
                      href="/verify-email"
                      className="text-[11px] font-semibold text-white/60 transition hover:text-[#35e889] sm:text-xs"
                    >
                      Haven&apos;t verified yet?
                    </Link>

                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-[#35e889] transition hover:text-[#7af5ac] sm:text-xs"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300 sm:px-4 sm:py-3 sm:text-sm">
                    {error}
                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55ed96] via-[#20db76] to-[#00C833] text-sm font-bold text-[#03291e] shadow-[0_10px_30px_rgba(0,200,51,0.2)] transition hover:brightness-110 hover:shadow-[0_12px_35px_rgba(0,200,51,0.35)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[58px] sm:gap-3 sm:text-base"
                >
                  {loading ? (
                    "Logging in..."
                  ) : (
                    <>
                      <ArrowRight
                        size={19}
                        strokeWidth={2.5}
                        className="transition-transform group-hover:translate-x-1 sm:h-[21px] sm:w-[21px]"
                      />
                      Login
                    </>
                  )}
                </button>
              </form>

              {/* =================================================
                  Register link — improved mobile layout
              ================================================= */}
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-center sm:mt-8 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                <p className="text-xs text-white/65 sm:text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="group inline-flex items-center font-semibold text-[#35e889] transition hover:text-[#7af5ac]"
                  >
                    <span>Create an Account</span>
                    <ArrowRight
                      size={13}
                      className="ml-1 inline-block shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5"
                    />
                  </Link>
                </p>
              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}
              <div className="mt-6 flex items-center justify-center border-t border-white/10 pt-5 sm:mt-8 sm:pt-6">
                <SecurityItem
                  icon={<ShieldCheck size={17} />}
                  text="100% Secure"
                />

                <div className="mx-2.5 h-6 w-px bg-white/15 sm:mx-3 sm:h-7" />

                <SecurityItem
                  icon={<LockKeyhole size={16} />}
                  text="SSL Encrypted"
                />

                <div className="mx-2.5 h-6 w-px bg-white/15 sm:mx-3 sm:h-7" />

                <SecurityItem
                  icon={<ShieldCheck size={17} />}
                  text="Trusted Platform"
                />
              </div>
            </div>
          </div>
        </section>
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
   FEATURE COMPONENT
============================================================= */

function Feature({
  icon,
  title,
  description,
  border = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 sm:flex-col sm:items-center sm:justify-center sm:text-center ${
        border ? "sm:border-r sm:border-white/20" : ""
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#00C833]/70 text-[#35e889] sm:h-12 sm:w-12">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold leading-tight text-white sm:mt-3 sm:text-xs">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-white/55 sm:mt-1">
          {description}
        </p>
      </div>
    </div>
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
    <div className="flex items-center gap-1.5 text-[8px] text-white/65 sm:text-[9px]">
      <span className="text-[#35e889]">{icon}</span>
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
}