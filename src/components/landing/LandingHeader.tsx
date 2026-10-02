import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#052f20]/70 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-5">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center"
            aria-label="GrowVest — Home"
          >
            <Image
              src="/images/Brand Logo.png"
              alt="GrowVest"
              width={80}
              height={80}
              priority
              className="h-11 w-11 shrink-0 object-contain md:h-12 md:w-12"
            />

            <div className="flex h-11 flex-col justify-center md:h-12">
              <Image
                src="/images/Brand Name.png"
                alt="GrowVest"
                width={200}
                height={48}
                priority
                className="h-6 w-auto object-contain object-left md:h-7"
              />

              <span
                className="
                  mt-0.5
                  hidden
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-white/60
                  sm:block
                  md:text-[9px]
                  md:tracking-[0.28em]
                "
              >
                Invest · Grow · Together
              </span>
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