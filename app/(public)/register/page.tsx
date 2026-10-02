"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  User,
  UserPlus,
  ShieldCheck,
  Gift,
  Users,
  Headphones,
  TrendingUp,
  Leaf,
  BadgeCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const referralFromUrl = searchParams.get("ref") || "";

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] =
    useState(referralFromUrl);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        referralCode: referralCode.trim()
          ? referralCode.trim().toUpperCase()
          : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors?.length) {
        setError(data.errors[0].message);
      } else {
        setError(data.message || "Registration failed.");
      }

      return;
    }

    setSuccess(
      data.emailSent === false
        ? "Account created. Please use the resend option to verify your email."
        : "Account created successfully. Redirecting to email verification..."
    );

    setTimeout(() => {
      router.push(
        `/verify-email?email=${encodeURIComponent(
          data.email || email.trim().toLowerCase()
        )}`
      );
    }, 800);
  } catch (error) {
    console.error("Registration error:", error);
    setError("Unable to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#031f18] text-white">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#00C833]/20 blur-[100px]" />

        <div className="absolute bottom-[-180px] left-[10%] h-[450px] w-[450px] rounded-full bg-[#00C833]/10 blur-[100px]" />

        <div className="absolute right-[-180px] top-[20%] h-[500px] w-[500px] rounded-full bg-[#16A34A]/10 blur-[120px]" />

        {/* Decorative curves */}
        <div className="absolute -bottom-[300px] -left-[180px] h-[500px] w-[900px] rotate-[15deg] rounded-[50%] border-[80px] border-[#00C833]/20" />

        <div className="absolute -bottom-[330px] -left-[230px] h-[500px] w-[900px] rotate-[15deg] rounded-[50%] border-[35px] border-[#16A34A]/30" />
      </div>

      {/* =========================================================
          TOP BAR
      ========================================================= */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        {/* Logo */}
        <Link
          href="/"
          aria-label="GrowVest home"
          className="group flex items-center gap-3"
        >
          <Image
            src="/images/Brand Logo.png"
            alt="GrowVest"
            width={76}
            height={76}
            priority
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
          />

          <div className="flex flex-col">
            <Image
              src="/images/Brand Name.png"
              alt="GrowVest"
              width={220}
              height={55}
              priority
              className="h-8 w-auto object-contain object-left sm:h-9"
            />

            <div className="mt-0.5 flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.3em] text-[#8edbb0] sm:text-[9px]">
              <span>Invest</span>
              <span>•</span>
              <span>Grow</span>
              <span>•</span>
              <span>Together</span>
            </div>
          </div>
        </Link>

        {/* Login */}
        <div className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
          <span className="hidden text-white/75 sm:inline">
            Already a member?
          </span>

          <Link
            href="/login"
            className="group flex items-center gap-1.5 font-semibold text-[#35e889] transition hover:text-[#69f5a9]"
          >
            Login
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1450px] flex-col px-6 pb-10 pt-4 sm:px-10 lg:min-h-[calc(100vh-96px)] lg:flex-row lg:items-center lg:gap-12 lg:px-16 lg:pt-0">
        {/* =======================================================
            LEFT SIDE
        ======================================================= */}
        <section className="flex w-full flex-1 flex-col justify-center pb-10 lg:min-h-[calc(100vh-120px)] lg:pb-0">
          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-[#00C833]" />

            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#35e889] sm:text-xs">
              Smart Investment Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-[650px] text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-[62px]">
            Start Growing
            <br />
            Your Wealth with{" "}
            <span className="bg-gradient-to-r from-[#35e889] via-[#00C833] to-[#8cffba] bg-clip-text text-transparent">
              GrowVest
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[570px] text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
            Create your GrowVest account and discover trusted
            investment plans, attractive returns and rewarding
            referral opportunities.
          </p>

          {/* Features */}
          <div className="mt-8 grid max-w-[600px] grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-0">
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

          {/* Growth illustration */}
          <div className="relative mt-8 h-[220px] w-full max-w-[650px] overflow-hidden sm:h-[280px] lg:mt-5 lg:h-[330px]">
            <div className="absolute bottom-0 left-[15%] h-32 w-72 rounded-full bg-[#00C833]/25 blur-[70px]" />

            <div className="absolute bottom-0 left-0 right-0 h-10 rounded-full bg-gradient-to-t from-[#071e18] to-transparent" />

            {/* Coins */}
            <div className="absolute bottom-0 left-[4%] flex items-end gap-2 sm:left-[8%] sm:gap-3">
              <CoinStack height="52px" />
              <CoinStack height="75px" />
              <CoinStack height="105px" />
              <CoinStack height="140px" />
              <CoinStack height="180px" large />
            </div>

            {/* Plants */}
            <Plant
              className="bottom-[45px] left-[7%]"
              size="small"
            />

            <Plant
              className="bottom-[68px] left-[25%]"
              size="medium"
            />

            <Plant
              className="bottom-[98px] left-[45%]"
              size="medium"
            />

            <Plant
              className="bottom-[138px] left-[66%]"
              size="large"
            />

            {/* Growth arrow */}
            <div className="absolute bottom-[100px] left-[12%] h-[160px] w-[430px] rotate-[-23deg] sm:left-[13%] sm:w-[500px]">
              <div className="absolute bottom-0 left-0 h-[4px] w-full rounded-full bg-gradient-to-r from-[#00C833] via-[#35e889] to-[#9affbf] shadow-[0_0_15px_rgba(0,200,51,0.8)]" />

              <ArrowUpRight
                size={78}
                strokeWidth={1.8}
                className="absolute -right-2 -top-7 text-[#54ed93] drop-shadow-[0_0_12px_rgba(53,232,137,0.8)]"
              />
            </div>
          </div>

          {/* Trust strip */}
          <div className="hidden max-w-[520px] rounded-full border border-[#35e889]/30 bg-[#062c22]/90 px-5 py-3 backdrop-blur-md sm:flex sm:items-center sm:gap-5 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#35e889]/50 text-[#35e889]">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Your Security
                </p>

                <p className="text-xs text-white/65">
                  Matters
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center text-[#35e889]">
                <Leaf size={25} />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Grow Together
                </p>

                <p className="text-xs text-white/65">
                  Build a Better Tomorrow
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            REGISTER CARD
        ======================================================= */}
        <section className="flex w-full justify-center lg:w-[500px] lg:shrink-0">
          <div className="relative w-full max-w-[500px] overflow-hidden rounded-[22px] border border-[#76dca7]/35 bg-[#062c25]/80 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-9">
            {/* Card glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#00C833]/10 blur-[60px]" />

            <div className="relative">
              {/* Logo */}
              <div className="mb-5 flex justify-center">
                <Link href="/">
                  <Image
                    src="/images/Brand Logo.png"
                    alt="GrowVest"
                    width={90}
                    height={90}
                    priority
                    className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                  />
                </Link>
              </div>

              {/* Heading */}
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">
                  Create Account
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  Join GrowVest and start growing your wealth
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-3.5"
              >
                {/* Full Name */}
                <FormField
                  id="fullName"
                  label="Full Name"
                  icon={<User size={19} />}
                >
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
                    className="form-input"
                  />
                </FormField>

                {/* Username */}
                <FormField
                  id="username"
                  label="Username"
                  icon={<UserPlus size={19} />}
                >
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
                    className="form-input"
                  />
                </FormField>

                <p className="-mt-2 pl-1 text-[10px] text-white/40">
                  Letters, numbers and underscores only.
                </p>

                {/* Email */}
                <FormField
                  id="email"
                  label="Email Address"
                  icon={<Mail size={19} />}
                >
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
                    className="form-input"
                  />
                </FormField>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold text-white"
                  >
                    Password
                  </label>

                  <div className="group flex h-[50px] items-center rounded-xl border border-white/30 bg-[#031f1a]/50 px-3.5 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30">
                    <LockKeyhole
                      size={19}
                      className="mr-3 shrink-0 text-white/60 transition group-focus-within:text-[#35e889]"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="ml-2 text-white/50 transition hover:text-[#35e889]"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  <p className="mt-1 text-[10px] text-white/40">
                    Minimum 8 characters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-semibold text-white"
                  >
                    Confirm Password
                  </label>

                  <div className="group flex h-[50px] items-center rounded-xl border border-white/30 bg-[#031f1a]/50 px-3.5 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30">
                    <LockKeyhole
                      size={19}
                      className="mr-3 shrink-0 text-white/60 transition group-focus-within:text-[#35e889]"
                    />

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
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="ml-2 text-white/50 transition hover:text-[#35e889]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Referral */}
                <div>
                  <label
                    htmlFor="referralCode"
                    className="mb-1.5 block text-xs font-semibold text-white"
                  >
                    Referral Code{" "}
                    <span className="font-normal text-white/40">
                      (Optional)
                    </span>
                  </label>

                  <div className="group flex h-[50px] items-center rounded-xl border border-white/30 bg-[#031f1a]/50 px-3.5 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30">
                    <Gift
                      size={19}
                      className="mr-3 shrink-0 text-white/60 transition group-focus-within:text-[#35e889]"
                    />

                    <input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(event) =>
                        setReferralCode(
                          event.target.value
                        )
                      }
                      className="h-full min-w-0 flex-1 bg-transparent text-sm uppercase text-white outline-none placeholder:text-white/35"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="rounded-xl border border-[#35e889]/30 bg-[#00C833]/10 px-4 py-3 text-xs text-[#69f5a9]">
                    {success}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-1 flex h-[53px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#55ed96] via-[#20db76] to-[#00C833] text-sm font-bold text-[#03291e] shadow-[0_10px_30px_rgba(0,200,51,0.2)] transition hover:brightness-110 hover:shadow-[0_12px_35px_rgba(0,200,51,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    "Creating Account..."
                  ) : (
                    <>
                      <UserPlus
                        size={19}
                        strokeWidth={2.5}
                        className="transition-transform group-hover:scale-110"
                      />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-5 text-center">
                <p className="text-xs text-white/60">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#35e889] transition hover:text-[#7af5ac]"
                  >
                    Login
                    <ArrowRight
                      size={13}
                      className="ml-1 inline-block"
                    />
                  </Link>
                </p>
              </div>

              {/* Security */}
              <div className="mt-5 flex items-center justify-center border-t border-white/10 pt-5">
                <SecurityItem
                  icon={<ShieldCheck size={17} />}
                  text="100% Secure"
                />

                <div className="mx-2.5 h-6 w-px bg-white/15" />

                <SecurityItem
                  icon={<LockKeyhole size={16} />}
                  text="SSL Encrypted"
                />

                <div className="mx-2.5 h-6 w-px bg-white/15" />

                <SecurityItem
                  icon={<BadgeCheck size={17} />}
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
   FEATURE
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
      className={`flex items-center gap-3 sm:flex-col sm:justify-center sm:text-center ${
        border
          ? "sm:border-r sm:border-white/20"
          : ""
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#00C833]/70 text-[#35e889]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-white sm:mt-3">
          {title}
        </p>

        <p className="mt-1 text-[10px] text-white/55">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   FORM FIELD
============================================================= */

function FormField({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-white"
      >
        {label}
      </label>

      <div className="group flex h-[50px] items-center rounded-xl border border-white/30 bg-[#031f1a]/50 px-3.5 transition focus-within:border-[#35e889] focus-within:ring-1 focus-within:ring-[#35e889]/30">
        <span className="mr-3 shrink-0 text-white/60 transition group-focus-within:text-[#35e889]">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}

/* =============================================================
   COIN STACK
============================================================= */

function CoinStack({
  height,
  large = false,
}: {
  height: string;
  large?: boolean;
}) {
  return (
    <div
      className={`relative w-12 rounded-[50%] border border-[#d9a72d] bg-gradient-to-b from-[#f6d76a] via-[#dca82d] to-[#9c6412] shadow-[inset_0_4px_5px_rgba(255,255,255,0.4),0_5px_12px_rgba(0,0,0,0.25)] sm:w-16 ${
        large ? "sm:w-20" : ""
      }`}
      style={{ height }}
    >
      <div className="absolute left-1/2 top-2 h-[2px] w-[75%] -translate-x-1/2 rounded-full bg-[#fff0a0]/70" />

      <div className="absolute left-1/2 top-1/2 h-[2px] w-[85%] -translate-x-1/2 bg-[#8d5a12]/50" />

      <div className="absolute bottom-2 left-1/2 h-[2px] w-[75%] -translate-x-1/2 rounded-full bg-[#fff0a0]/40" />
    </div>
  );
}

/* =============================================================
   PLANT
============================================================= */

function Plant({
  className,
  size = "medium",
}: {
  className: string;
  size?: "small" | "medium" | "large";
}) {
  const sizes = {
    small: {
      stem: "h-10",
      leaf: "h-6 w-10",
    },
    medium: {
      stem: "h-16",
      leaf: "h-8 w-14",
    },
    large: {
      stem: "h-24",
      leaf: "h-10 w-16",
    },
  };

  const current = sizes[size];

  return (
    <div className={`absolute ${className}`}>
      <div
        className={`absolute bottom-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-t from-[#2b8c28] to-[#65df51] ${current.stem}`}
      />

      <div
        className={`absolute bottom-[55%] left-[45%] -rotate-[30deg] rounded-[100%_0] bg-gradient-to-br from-[#8ce65b] to-[#2c9e35] ${current.leaf}`}
      />

      <div
        className={`absolute bottom-[70%] right-[20%] rotate-[25deg] rounded-[0_100%] bg-gradient-to-br from-[#a1ed6a] to-[#2b9632] ${current.leaf}`}
      />
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