import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#dceedd] bg-[#03291d] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <p className="text-2xl font-black tracking-tight">
                Grow<span className="text-[#45d86a]">Vest</span>
              </p>
            </Link>

            <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">
              A simple and transparent platform designed to help you explore
              investment opportunities, track your progress and grow together.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-white/45">
              <ShieldCheck size={15} className="text-[#45d86a]" />
              Secure · Simple · Transparent
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold text-white">Explore</h3>

            <div className="mt-4 space-y-3 text-sm text-white/50">
              <Link
                href="/plans"
                className="block transition hover:text-[#70e990]"
              >
                Investment Plans
              </Link>

              <Link
                href="/about"
                className="block transition hover:text-[#70e990]"
              >
                About Grow Vest
              </Link>

              <Link
                href="/referral"
                className="block transition hover:text-[#70e990]"
              >
                Referral Program
              </Link>

              <Link
                href="/faq"
                className="block transition hover:text-[#70e990]"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-bold text-white">Account</h3>

            <div className="mt-4 space-y-3 text-sm text-white/50">
              <Link
                href="/login"
                className="block transition hover:text-[#70e990]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="block transition hover:text-[#70e990]"
              >
                Create Account
              </Link>

              <Link
                href="/learn-more"
                className="flex items-center gap-1 transition hover:text-[#70e990]"
              >
                Learn More
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {/* Social / CTA */}
          <div>
            <h3 className="text-sm font-bold text-white">Stay Connected</h3>

            <p className="mt-4 text-sm leading-6 text-white/45">
              Start your journey with Grow Vest and take the next step toward
              your financial goals.
            </p>

            <div className="mt-5 flex gap-2">
              <a
    href="https://www.instagram.com/growvest.live?stkn=cW52MWJobzAzMDhi"
    target="_blank"
    rel="noopener noreferrer"
    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
    aria-label="Instagram"
  >
    <FaInstagram size={16} />
  </a>
  <a
                href="https://www.tiktok.com/@growvest.live?_r=1&_t=ZS-9AMHp9NhRI8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="TikTok"
              >
                <FaTiktok size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Grow Vest. All rights reserved.</p>

          <p>INVEST · GROW · TOGETHER</p>
        </div>
      </div>
    </footer>
  );
}