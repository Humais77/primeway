"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { images } from "@/src/lib/images";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Plans", href: "/plans" },
  { label: "About", href: "/about" },
  { label: "Referral", href: "/referral" },
  { label: "FAQ", href: "/faq" },
];

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="relative rounded-2xl border border-white/10 bg-[#052f20]/75 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5">
            {/* Logo */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center"
              aria-label="GrowVest — Home"
            >
              <Image
                src={images.brandLogo}
                alt="GrowVest"
                width={80}
                height={80}
                priority
                className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11 md:h-12 md:w-12"
              />

              <div className="ml-2 flex h-10 flex-col justify-center sm:h-11 md:h-12">
                <Image
                  src={images.brandName}
                  alt="GrowVest"
                  width={200}
                  height={48}
                  priority
                  className="h-5.5 w-auto object-contain object-left sm:h-6 md:h-7"
                />

                <span className="mt-0.5 hidden text-[8px] font-semibold uppercase tracking-[0.22em] text-white/55 sm:block md:text-[9px] md:tracking-[0.28em]">
                  Invest · Grow · Together
                </span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-7 lg:flex">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium text-white/70 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="flex h-10 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#45d86a] to-[#16a34a] px-5 text-sm font-bold text-white shadow-lg shadow-green-950/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Sign Up
                <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* Mobile button */}
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/15 sm:hidden"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

          {/* Mobile navigation */}
          {mobileOpen && (
            <div className="border-t border-white/10 px-4 pb-4 pt-3 sm:hidden">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-xl border border-white/20 text-sm font-semibold text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-xl bg-[#45a94a] text-sm font-bold text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}