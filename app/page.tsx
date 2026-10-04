import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Headphones,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import { db } from "@/src/prisma/db";
import { formatPKR } from "@/src/lib/money";

import { LandingHeader } from "@/src/components/landing/LandingHeader";
import { LandingFooter } from "@/src/components/landing/LandingFooter";

export default async function HomePage() {
  const plans = await db.orm.public.InvestmentPlan
    .where({
      isActive: true,
    })
    .orderBy((plan) => plan.createdAt.asc())
    .all();

  const featuredPlan = plans[0] ?? null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fbf7]">
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="relative overflow-hidden bg-[#03291d]">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#16a34a]/20 blur-[120px]" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#45a94a]/10 blur-[130px]" />
          <div className="absolute bottom-0 left-1/3 h-64 w-96 rounded-full bg-[#0d6b3d]/20 blur-[100px]" />
        </div>

        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:70px_70px]" />

        <LandingHeader />

        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-5 pb-20 pt-36 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-40">
          {/* Hero content */}
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#45d86a]/20 bg-[#45d86a]/10 px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-[#45d86a] shadow-[0_0_12px_#45d86a]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ef2b0]">
                Smart investing starts here
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              Build Your Future.
              <br />
              <span className="bg-gradient-to-r from-[#45d86a] via-[#21c45b] to-[#7df29a] bg-clip-text text-transparent">
                Grow With Us.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              Explore investment plans, track your financial activity and grow
              your network through a simple and modern platform built around
              your financial journey.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/plans"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#45d86a] to-[#16a34a] px-7 text-sm font-bold text-white shadow-xl shadow-green-950/30 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Explore Plans
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/learn-more"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Learn More
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-white/45">
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#45d86a]" />
                Secure Platform
              </span>

              <span className="flex items-center gap-2">
                <BadgeCheck size={15} className="text-[#45d86a]" />
                Clear Records
              </span>

              <span className="flex items-center gap-2">
                <Headphones size={15} className="text-[#45d86a]" />
                Dedicated Support
              </span>
            </div>
          </div>

          {/* Investment visual */}
          <div className="relative flex min-h-[390px] items-center justify-center lg:min-h-[500px]">
            <div className="absolute h-80 w-80 rounded-full bg-[#16a34a]/15 blur-[100px]" />

            {/* Main dashboard card */}
            <div className="relative z-10 w-full max-w-md rounded-[30px] border border-white/10 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[24px] border border-white/10 bg-[#062e21] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                      Portfolio Overview
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      Rs 42,350
                    </p>

                    <p className="mt-1 text-xs text-[#70e990]">
                      +12.8% growth
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#45a94a]/15 text-[#70e990]">
                    <TrendingUp size={22} />
                  </div>
                </div>

                <div className="mt-7 flex h-36 items-end gap-2">
                  {[28, 40, 34, 52, 47, 64, 55, 72, 66, 82, 76, 94].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-[#15803d] to-[#70e990]"
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <MiniStat label="Balance" value="Rs 42K" />
                  <MiniStat label="Profit" value="Rs 8K" />
                  <MiniStat label="Team" value="24" />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-1 left-0 z-20 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl sm:left-3">
              <p className="text-[9px] uppercase tracking-[0.12em] text-white/40">
                Growing Together
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                Invest · Grow · Together
              </p>
            </div>

            <div className="absolute right-0 top-8 z-20 hidden rounded-2xl border border-[#45d86a]/20 bg-[#45d86a]/10 px-4 py-3 backdrop-blur-xl sm:block">
              <p className="text-xs font-bold text-[#9ef2b0]">
                Smart Growth
              </p>
            </div>
          </div>
        </div>

        
      </section>

      {/* ============================================================
          TRUST
      ============================================================ */}
      <section className="border-b border-[#dceedd] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-5">
          <TrustItem
            icon={<ShieldCheck size={22} />}
            title="Secure"
            description="Protected access"
          />

          <TrustItem
            icon={<BarChart3 size={22} />}
            title="Growth"
            description="Track progress"
          />

          <TrustItem
            icon={<Users size={22} />}
            title="Referral"
            description="Grow together"
          />

          <TrustItem
            icon={<Zap size={22} />}
            title="Simple"
            description="Easy to use"
          />

          <TrustItem
            icon={<Headphones size={22} />}
            title="Support"
            description="We're here to help"
          />
        </div>
      </section>

      {/* ============================================================
          FEATURED PLAN
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
              Investment Plans
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#173b20] sm:text-4xl">
              Start With the Right Plan
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Explore our available plans and choose an option that fits your
              investment goals.
            </p>
          </div>

          <Link
            href="/plans"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#2f8f45] transition hover:text-[#1f7a3a]"
          >
            View All Plans
            <ChevronRight size={17} />
          </Link>
        </div>

        {featuredPlan ? (
          <FeaturedPlan plan={featuredPlan} />
        ) : (
          <div className="mt-7 rounded-[28px] border border-dashed border-[#cfe7d1] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
              <Wallet size={25} />
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#173b20]">
              Investment Plans Coming Soon
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              New plans will appear here as soon as they become available.
            </p>
          </div>
        )}
      </section>

      {/* ============================================================
          ABOUT PREVIEW
      ============================================================ */}
      <section className="border-y border-[#dceedd] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
              About Grow Vest
            </p>

            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight text-[#173b20] sm:text-4xl">
              A simpler way to stay connected with your financial journey.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-500">
              Grow Vest brings investment plans, account activity, financial
              tracking and referral opportunities together in one modern
              platform.
            </p>

            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#eff8f0] px-5 py-3 text-sm font-bold text-[#2f7d32] transition hover:bg-[#e2f3e3]"
            >
              Discover Grow Vest
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-[#053d29] via-[#075c38] to-[#022c1e] p-7 text-white shadow-xl sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#45d86a]/15 text-[#70e990]">
              <Sparkles size={23} />
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Designed Around Your Growth
            </h3>

            <div className="mt-6 space-y-4">
              <Benefit
                icon={<LockKeyhole size={17} />}
                title="Secure Access"
                description="Protected account access."
              />

              <Benefit
                icon={<BarChart3 size={17} />}
                title="Clear Tracking"
                description="Monitor your activity easily."
              />

              <Benefit
                icon={<MessageCircle size={17} />}
                title="Simple Support"
                description="Help when you need it."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          REFERRAL PREVIEW
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="overflow-hidden rounded-[32px] bg-[#eff8f0]">
          <div className="grid items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.75fr] lg:px-14 lg:py-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
                Referral Program
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight text-[#173b20] sm:text-4xl">
                Grow Your Network.
                <br />
                Grow Together.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600">
                Invite friends, build your network and keep track of your
                referral activity directly from your account.
              </p>

              <Link
                href="/referral"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#45a94a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#2f7d32]"
              >
                Explore Referral Program
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <ReferralPreview />
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ PREVIEW
      ============================================================ */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="rounded-[30px] border border-[#dceedd] bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
                FAQ
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#173b20]">
                Questions? We Have Answers.
              </h2>
            </div>

            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#2f8f45]"
            >
              View All FAQs
              <ChevronRight size={17} />
            </Link>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <FaqPreview
              question="How do I get started?"
              answer="Create your account and explore the available investment plans."
            />

            <FaqPreview
              question="Can I track my investments?"
              answer="Your dashboard gives you access to balances, investments and activity."
            />

            <FaqPreview
              question="How does referrals work?"
              answer="Invite people through your referral system and track your network."
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-r from-[#1f7a3a] via-[#45a94a] to-[#2f7d32] px-6 py-12 text-center text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
            Your next step starts here
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
            Ready to Start Growing?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/70">
            Explore the platform, review our plans and create your Grow Vest
            account today.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#2f7d32] transition hover:bg-[#f0fff2]"
            >
              Create Account
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/learn-more"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

/* ================================================================
   FEATURED PLAN
================================================================ */

function FeaturedPlan({
  plan,
}: {
  plan: {
    id: string;
    name: string;
    minAmountPaisa: number;
    maxAmountPaisa: number;
    profitRateBps: number;
    referralBonusBps: number;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    durationDays: number;
  };
}) {
  const profitRate = plan.profitRateBps / 100;
  const referralRate = plan.referralBonusBps / 100;

  const periods =
    plan.frequency === "DAILY"
      ? plan.durationDays
      : plan.frequency === "WEEKLY"
        ? Math.floor(plan.durationDays / 7)
        : Math.floor(plan.durationDays / 30);

  const profitPerPeriod = Math.floor(
    plan.minAmountPaisa * (plan.profitRateBps / 10_000)
  );

  const totalProfit = profitPerPeriod * periods;
  const isFixedPlan = plan.minAmountPaisa === plan.maxAmountPaisa;

  return (
    <article className="group relative mt-7 overflow-hidden rounded-[30px] border border-[#dceedd] bg-white shadow-[0_12px_40px_rgba(45,100,50,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(45,100,50,0.12)]">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#063b27] via-[#14733e] to-[#2f9b4b] p-7 text-white sm:p-9">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
              Featured Plan
            </span>

            <h3 className="mt-5 text-3xl font-black sm:text-4xl">
              {plan.name}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/60">
              A simple way to begin your Grow Vest investment journey.
            </p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-black/10 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Starting Investment
              </p>

              <p className="mt-1 text-3xl font-black">
                {formatPKR(plan.minAmountPaisa)}
              </p>

              {!isFixedPlan && (
                <p className="mt-1 text-xs text-white/50">
                  Up to {formatPKR(plan.maxAmountPaisa)}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <TrendingUp size={19} />
              </div>

              <div>
                <p className="text-xs text-white/45">Duration</p>
                <p className="text-sm font-bold">{plan.durationDays} Days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#45a94a]">
                Plan Details
              </p>

              <h4 className="mt-1 text-2xl font-black text-[#173b20]">
                Start Growing
              </h4>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
              <TrendingUp size={21} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <PlanValue
              label={`${getFrequencyLabel(plan.frequency)} Profit`}
              value={formatPKR(profitPerPeriod)}
            />

            <PlanValue
              label="Duration"
              value={`${plan.durationDays} Days`}
            />

            <PlanValue
              label="Profit Rate"
              value={`${profitRate}%`}
            />

            <PlanValue
              label="Referral Bonus"
              value={`${referralRate}%`}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-[#cfe7d1] bg-[#eff8f0] p-4">
            <p className="text-[11px] font-medium text-gray-500">
              Estimated Total Profit
            </p>

            <p className="mt-1 text-2xl font-black text-[#173b20]">
              {formatPKR(totalProfit)}
            </p>
          </div>

          <Link
            href="/plans"
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            View All Plans
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ================================================================
   MINI STAT
================================================================ */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2.5">
      <p className="text-[8px] uppercase tracking-[0.1em] text-white/30">
        {label}
      </p>
      <p className="mt-1 text-xs font-bold text-white/80">{value}</p>
    </div>
  );
}

/* ================================================================
   TRUST ITEM
================================================================ */

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#e7efe8] px-4 py-5 sm:flex-col sm:justify-center sm:border-b-0 sm:border-r sm:py-7 md:px-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f7ea] text-[#2f8f45]">
        {icon}
      </div>

      <div className="sm:text-center">
        <h3 className="text-xs font-bold text-[#173b20] sm:text-sm">
          {title}
        </h3>

        <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   BENEFIT
================================================================ */

function Benefit({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/45">{description}</p>
      </div>
    </div>
  );
}

/* ================================================================
   PLAN VALUE
================================================================ */

function PlanValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e4eee5] bg-[#f8fbf8] p-3">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#173b20]">{value}</p>
    </div>
  );
}

/* ================================================================
   REFERRAL PREVIEW
================================================================ */

function ReferralPreview() {
  return (
    <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center">
      <div className="absolute h-40 w-40 rounded-full bg-[#45a94a]/10 blur-2xl" />

      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#45a94a]/30 bg-white shadow-xl">
        <Users size={31} className="text-[#2f8f45]" />
      </div>

      <div className="absolute left-3 top-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#45a94a] text-white shadow-lg">
        <Users size={20} />
      </div>

      <div className="absolute right-3 top-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#2f7d32] text-white shadow-lg">
        <Users size={20} />
      </div>

      <div className="absolute bottom-3 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-[#15803d] text-white shadow-lg">
        <Users size={20} />
      </div>

      <div className="absolute left-16 top-14 h-px w-20 rotate-[25deg] bg-[#45a94a]/50" />
      <div className="absolute right-16 top-14 h-px w-20 -rotate-[25deg] bg-[#45a94a]/50" />
      <div className="absolute bottom-14 left-1/2 h-10 w-px bg-[#45a94a]/50" />
    </div>
  );
}

/* ================================================================
   FAQ PREVIEW
================================================================ */

function FaqPreview({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dceedd] bg-[#f8fbf8] p-5">
      <h3 className="text-sm font-bold text-[#173b20]">{question}</h3>

      <p className="mt-2 text-xs leading-5 text-gray-500">{answer}</p>
    </div>
  );
}

/* ================================================================
   HELPERS
================================================================ */

function getFrequencyLabel(
  frequency: "DAILY" | "WEEKLY" | "MONTHLY"
) {
  switch (frequency) {
    case "WEEKLY":
      return "Weekly";

    case "MONTHLY":
      return "Monthly";

    default:
      return "Daily";
  }
}