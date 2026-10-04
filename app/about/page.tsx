import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { LandingHeader } from "@/src/components/landing/LandingHeader";
import { LandingFooter } from "@/src/components/landing/LandingFooter";

export const metadata = {
  title: "About",
  description:
    "Learn more about Grow Vest, our platform and the experience we are building for investors.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7fbf7]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#03291d]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#16a34a]/20 blur-[110px]" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#45a94a]/10 blur-[120px]" />
        </div>

        <LandingHeader />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70e990]">
            About Grow Vest
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Built to Make Your{" "}
            <span className="text-[#70e990]">Growth Journey</span> Simpler.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Grow Vest brings investment plans, account management, financial
            tracking and referral opportunities together in one straightforward
            platform.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
              Our Approach
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-[#173b20] sm:text-4xl">
              Investment should feel clear, organized and accessible.
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-500">
              Grow Vest is designed around a simple idea: your financial
              activity should be easy to understand and easy to manage. From
              exploring plans to monitoring investments and referrals, the
              platform keeps important information in one place.
            </p>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              We focus on a clean experience that helps users understand their
              available options and stay connected with their progress.
            </p>

            <Link
              href="/plans"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#45a94a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f7d32]"
            >
              Explore Plans
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-[30px] bg-gradient-to-br from-[#053d29] via-[#075c38] to-[#022c1e] p-7 text-white shadow-xl sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#45d86a]/15 text-[#70e990]">
              <Sparkles size={23} />
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Everything in One Place
            </h3>

            <div className="mt-7 space-y-5">
              <Feature
                icon={<BarChart3 size={18} />}
                title="Investment Tracking"
                text="Keep track of balances, investments and activity."
              />

              <Feature
                icon={<Users size={18} />}
                title="Referral Network"
                text="Build and monitor your referral network."
              />

              <Feature
                icon={<ShieldCheck size={18} />}
                title="Protected Access"
                text="Use your personal account with secure authentication."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-[#dceedd] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
              What Matters
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#173b20] sm:text-4xl">
              Built Around a Better Experience
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <ValueCard
              icon={<LockKeyhole size={21} />}
              title="Security"
              description="Your account experience is designed with protected access and clear account controls."
            />

            <ValueCard
              icon={<BarChart3 size={21} />}
              title="Transparency"
              description="Keep important investment information and activity visible from your account."
            />

            <ValueCard
              icon={<Headphones size={21} />}
              title="Support"
              description="A simple experience backed by support when you need help navigating the platform."
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[32px] bg-[#eff8f0] px-6 py-10 text-center sm:px-10 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
            Our Mission
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight text-[#173b20] sm:text-4xl">
            Help people make informed decisions while staying connected to
            their financial progress.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-500">
            Grow Vest is continuously evolving to provide a better platform
            experience for users who want to explore investment opportunities
            and manage their financial journey from one place.
          </p>

          <Link
            href="/learn-more"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#45a94a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f7d32]"
          >
            Learn How It Works
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#45a94a]/15 text-[#70e990]">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/45">{text}</p>
      </div>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#dceedd] bg-[#f8fbf8] p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black text-[#173b20]">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>

      <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#2f7d32]">
        <CheckCircle2 size={15} />
        Grow Vest principle
      </div>
    </div>
  );
}