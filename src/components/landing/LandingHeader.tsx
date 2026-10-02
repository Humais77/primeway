import Link from "next/link";
import { ArrowUpRight, Menu, Sprout } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#052f20]/70 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-5">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="Grow Vest Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#45d86a] to-[#16a34a] shadow-lg shadow-green-950/30">
              <Sprout
                size={23}
                strokeWidth={2.5}
                className="text-white"
              />
            </div>

            <div className="leading-none">
              <p className="text-lg font-black tracking-tight text-white sm:text-xl">
                Grow<span className="text-[#45d86a]">Vest</span>
              </p>

              <p className="mt-1 hidden text-[8px] font-medium tracking-[0.2em] text-white/50 sm:block">
                INVEST TODAY · EARN TOMORROW
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a
              href="#home"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Home
            </a>

            <a
              href="#plans"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Plans
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              About
            </a>

            <a
              href="#referral"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Referral
            </a>

            <a
              href="#faq"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="flex h-10 items-center justify-center rounded-full border border-white/40 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#16a34a] px-5 text-sm font-bold text-white shadow-lg shadow-green-950/20 transition hover:bg-[#22b455]"
            >
              Sign Up
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Mobile */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white sm:hidden"
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>
        </div>
      </div>
    </header>
  );
}