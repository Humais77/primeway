import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { LandingHeader } from "@/src/components/landing/LandingHeader";
import { LandingFooter } from "@/src/components/landing/LandingFooter";

export const metadata = {
  title: "Learn More",
  description:
    "Learn how Grow Vest works, explore investment plans and understand the platform experience.",
};

export default function LearnMorePage() {
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
            Learn More
          </p>

          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Understand How{" "}
            <span className="text-[#70e990]">Grow Vest</span> Works.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Explore the platform, understand the main features and learn how
            you can use Grow Vest to manage your investment journey.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          <InfoCard
            icon={<Wallet size={22} />}
            title="Explore Plans"
            text="Review available investment plans, amounts, durations, profit rates and referral bonuses."
          />

          <InfoCard
            icon={<BarChart3 size={22} />}
            title="Track Activity"
            text="Use your dashboard to monitor balances, investments, profits, transactions and other activity."
          />

          <InfoCard
            icon={<Users size={22} />}
            title="Grow Your Network"
            text="Use the referral system to invite people and keep track of your referral network."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[#dceedd] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
              The Journey
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#173b20] sm:text-4xl">
              From Registration to Tracking
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              Grow Vest is structured around a simple account journey that
              keeps your main financial activity organized.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Journey
              number="01"
              icon={<ClipboardList size={20} />}
              title="Create Account"
              text="Register and set up your Grow Vest account."
            />

            <Journey
              number="02"
              icon={<TrendingUp size={20} />}
              title="Explore Plans"
              text="Review active investment plans and their terms."
            />

            <Journey
              number="03"
              icon={<Wallet size={20} />}
              title="Manage Investments"
              text="Use your dashboard to monitor your investments."
            />

            <Journey
              number="04"
              icon={<BarChart3 size={20} />}
              title="Track Growth"
              text="Follow your balance, activity and referral network."
            />
          </div>
        </div>
      </section>

      {/* Platform */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] bg-gradient-to-br from-[#053d29] via-[#075c38] to-[#022c1e] p-7 text-white shadow-xl sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#45d86a]/15 text-[#70e990]">
              <ShieldCheck size={24} />
            </div>

            <h2 className="mt-6 text-3xl font-black">
              A Platform Built Around Clarity
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Your account brings important information together so you can
              spend less time searching and more time understanding your
              financial activity.
            </p>

            <div className="mt-7 space-y-4">
              <DarkBenefit text="Personal dashboard" />
              <DarkBenefit text="Investment activity tracking" />
              <DarkBenefit text="Deposit and withdrawal management" />
              <DarkBenefit text="Referral network visibility" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
              Platform Features
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#173b20] sm:text-4xl">
              Everything You Need in One Place
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              Grow Vest is designed to make your account experience easy to
              navigate while keeping the most important information close at
              hand.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Feature
                icon={<LockKeyhole size={18} />}
                title="Secure Access"
              />

              <Feature
                icon={<TrendingUp size={18} />}
                title="Investment Tracking"
              />

              <Feature
                icon={<Wallet size={18} />}
                title="Balance Management"
              />

              <Feature
                icon={<Users size={18} />}
                title="Referral Network"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-[#eff8f0] px-6 py-12 text-center sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
            Ready to Begin?
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#173b20] sm:text-4xl">
            Take the Next Step With Grow Vest
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500">
            Explore our investment plans or create your account to get started.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/plans"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#45a94a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f7d32]"
            >
              Explore Plans
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#2f7d32] shadow-sm transition hover:bg-[#f5fff6]"
            >
              Create Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#dceedd] bg-white p-7 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black text-[#173b20]">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">{text}</p>

      <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#2f7d32]">
        <CheckCircle2 size={15} />
        Built into your experience
      </div>
    </div>
  );
}

function Journey({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[25px] border border-[#dceedd] bg-[#f8fbf8] p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-[#45a94a]">{number}</span>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#45a94a] shadow-sm">
          {icon}
        </div>
      </div>

      <h3 className="mt-6 text-lg font-black text-[#173b20]">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-gray-500">{text}</p>
    </div>
  );
}

function DarkBenefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/70">
      <CheckCircle2 size={16} className="text-[#70e990]" />
      {text}
    </div>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#dceedd] bg-[#f8fbf8] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
        {icon}
      </div>

      <span className="text-sm font-bold text-[#173b20]">{title}</span>
    </div>
  );
}