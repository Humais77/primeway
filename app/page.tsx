import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
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
      <section
        id="home"
        className="relative min-h-[680px] overflow-hidden bg-[#03291d]"
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#16a34a]/20 blur-[120px]" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#45a94a]/10 blur-[130px]" />
          <div className="absolute bottom-0 left-1/3 h-64 w-96 rounded-full bg-[#0d6b3d]/20 blur-[100px]" />
        </div>

        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:70px_70px]" />

        <LandingHeader />

        <div className="relative mx-auto grid min-h-[680px] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-32 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-20 lg:pt-36">
          {/* Hero content */}
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#45d86a]/25 bg-[#45d86a]/10 px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-[#45d86a] shadow-[0_0_12px_#45d86a]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ef2b0]">
                Smart investing starts here
              </span>
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Your Future
              <br />
              <span className="bg-gradient-to-r from-[#45d86a] via-[#21c45b] to-[#7df29a] bg-clip-text text-transparent">
                Grows Here
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              Smart investment plans, steady returns and a trusted platform.
              Grow Vest helps you build wealth, one step at a time.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#plans"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#45d86a] to-[#16a34a] px-6 text-sm font-bold text-white shadow-xl shadow-green-950/30 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Get Started
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </a>

              <a
                href="#about"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30">
                  <ArrowRight size={13} />
                </span>
                Learn More
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-white/50">
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
                24/7 Support
              </span>
            </div>
          </div>

          {/* Investment visual */}
          <div className="relative flex min-h-[430px] items-end justify-center lg:min-h-[500px]">
            {/* Glow */}
            <div className="absolute bottom-12 h-72 w-72 rounded-full bg-[#16a34a]/20 blur-[90px]" />

            {/* Growth arrow */}
            <div className="absolute right-[13%] top-[12%] hidden h-64 w-64 rotate-[-25deg] md:block">
              <div className="absolute bottom-4 left-2 h-1 w-52 rounded-full bg-gradient-to-r from-transparent via-[#45d86a] to-[#7df29a] shadow-[0_0_18px_#45d86a]" />
              <div className="absolute right-0 top-0 h-0 w-0 border-b-[22px] border-l-[11px] border-r-[11px] border-b-[#7df29a] border-l-transparent border-r-transparent" />
            </div>

            {/* Coin stacks */}
            <div className="relative z-10 flex items-end gap-3 sm:gap-5">
              <CoinStack
                height="h-28"
                amount="Rs 10K"
                plantHeight="h-24"
                delay="0s"
              />

              <CoinStack
                height="h-40"
                amount="Rs 25K"
                plantHeight="h-32"
                delay="0.2s"
              />

              <CoinStack
                height="h-52"
                amount="Rs 50K"
                plantHeight="h-40"
                delay="0.4s"
              />

              <CoinStack
                height="h-64"
                amount="Rs 100K"
                plantHeight="h-48"
                delay="0.6s"
              />
            </div>

            {/* Side message */}
            <div className="absolute right-0 top-[48%] hidden w-32 lg:block">
              <p className="font-serif text-xl italic leading-7 text-[#45d86a]">
                Better
                <br />
                Investments
                <br />
                Brighter
                <br />
                Tomorrow
              </p>

              <div className="mt-3 h-px w-20 rotate-[-8deg] bg-[#45d86a]" />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f7fbf7] to-transparent" />
      </section>

      {/* ============================================================
          TRUST STRIP
      ============================================================ */}
      <section className="relative border-b border-[#dceedd] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-5">
          <TrustItem
            icon={<ShieldCheck size={24} />}
            title="Secure & Trusted"
            description="Your funds, our priority"
          />

          <TrustItem
            icon={<BarChart3 size={24} />}
            title="Attractive Returns"
            description="Grow your wealth"
          />

          <TrustItem
            icon={<Users size={24} />}
            title="Referral Rewards"
            description="Earn more together"
          />

          <TrustItem
            icon={<Zap size={24} />}
            title="Easy & Fast"
            description="Simple onboarding"
          />

          <TrustItem
            icon={<Headphones size={24} />}
            title="24/7 Support"
            description="We're always here"
          />
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/* Investment plan */}
        <div id="plans" className="scroll-mt-24">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2f8f45]">
                Our Investment Plan
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#173b20] sm:text-4xl">
                Choose Your Plan,
                <br className="sm:hidden" /> Start Growing
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                A simple investment experience designed to help you start
                building your financial future.
              </p>
            </div>
          </div>

          {featuredPlan ? (
            <FeaturedInvestmentCard plan={featuredPlan} />
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#cfe7d1] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
                <Wallet size={25} />
              </div>

              <h3 className="mt-4 text-xl font-bold text-[#173b20]">
                Investment Plans Coming Soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                New investment plans will appear here when they become
                available.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================
            REFERRAL
        ======================================================== */}
        <section
          id="referral"
          className="mt-16 scroll-mt-24 overflow-hidden rounded-[30px] bg-[#eff8f0]"
        >
          <div className="grid items-center gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_0.8fr] lg:px-14">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2f8f45]">
                Referral Program
              </p>

              <h2 className="mt-2 text-3xl font-black leading-tight text-[#173b20] sm:text-4xl">
                Refer & Earn
                <br />
                Together
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-gray-600">
                Invite your friends and grow together. Build your network
                while earning attractive referral rewards.
              </p>

              <Link
                href="/register"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#45a94a] px-5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#2f7d32]"
              >
                Start Referring
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <ReferralVisual />
          </div>
        </section>

        {/* ========================================================
            ABOUT / GROWTH
        ======================================================== */}
        <section
          id="about"
          className="mt-6 grid scroll-mt-24 gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#053d29] via-[#075c38] to-[#022c1e] p-7 text-white sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#45d86a]/15 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold text-[#70e990]">
                Track Your Growth
              </p>

              <h2 className="mt-2 max-w-md text-3xl font-black leading-tight">
                Stay connected with your investments.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
                Monitor your balance, investments, profits, deposits,
                withdrawals and referral activity from your personal
                dashboard.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#70e990] transition hover:text-white"
              >
                View Dashboard
                <ArrowRight size={16} />
              </Link>

              {/* Dashboard preview */}
              <div className="relative mt-10 ml-auto max-w-md rounded-2xl border border-white/10 bg-[#031f17] p-3 shadow-2xl">
                <div className="rounded-xl border border-white/5 bg-[#073b2a] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-white/40">
                        Total Balance
                      </p>

                      <p className="mt-1 text-xl font-black">
                        Rs 42,350.00
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#45a94a]/15 text-[#45d86a]">
                      <Wallet size={17} />
                    </div>
                  </div>

                  <div className="mt-5 flex h-24 items-end gap-1.5">
                    {[25, 38, 30, 48, 43, 58, 52, 70, 62, 78, 72, 92].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-[#15803d] to-[#45d86a]"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#dceedd] bg-white p-7 shadow-sm sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
              <Sparkles size={23} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-[#173b20]">
              Invest Today
              <br />
              for a Stronger Tomorrow
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              Grow Vest gives you a straightforward way to explore investment
              plans, monitor your activity and stay connected with your
              financial journey.
            </p>

            <div className="mt-7 space-y-4">
              <Benefit
                icon={<LockKeyhole size={17} />}
                title="Secure Access"
                description="Your account is protected."
              />

              <Benefit
                icon={<BarChart3 size={17} />}
                title="Clear Tracking"
                description="Follow your financial activity."
              />

              <Benefit
                icon={<MessageCircle size={17} />}
                title="Simple Support"
                description="Help when you need it."
              />
            </div>
          </div>
        </section>

        {/* ========================================================
            FAQ
        ======================================================== */}
        <section id="faq" className="mt-20 scroll-mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2f8f45]">
              FAQ
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#173b20]">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Everything you need to know about getting started with Grow
              Vest.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            <FaqItem
              question="How do I get started?"
              answer="Create your Grow Vest account, complete the required account information and explore the available investment plans."
            />

            <FaqItem
              question="Can I track my investments?"
              answer="Yes. Your dashboard provides access to your balance, running investments, profits and transaction activity."
            />

            <FaqItem
              question="How does the referral program work?"
              answer="You can invite people through your referral system and track your referral activity from your dashboard."
            />
          </div>
        </section>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="border-t border-[#dceedd] bg-[#03291d] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xl font-black">
              Grow<span className="text-[#45d86a]">Vest</span>
            </p>

            <p className="mt-1 text-xs text-white/40">
              INVEST TODAY · EARN TOMORROW
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-white/50">
            <a href="#home" className="transition hover:text-white">
              Home
            </a>

            <a href="#plans" className="transition hover:text-white">
              Plans
            </a>

            <a href="#about" className="transition hover:text-white">
              About
            </a>

            <a href="#referral" className="transition hover:text-white">
              Referral
            </a>

            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </div>

          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Grow Vest. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ================================================================
   FEATURED INVESTMENT CARD
================================================================ */

function FeaturedInvestmentCard({
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

  const isFixedPlan =
    plan.minAmountPaisa === plan.maxAmountPaisa;

  return (
    <article className="relative overflow-hidden rounded-[30px] border border-[#dceedd] bg-white shadow-[0_12px_40px_rgba(45,100,50,0.08)]">
      <div className="grid lg:grid-cols-[1fr_0.85fr]">
        {/* Green side */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#063b27] via-[#14733e] to-[#2f9b4b] p-7 text-white sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-20 h-52 w-52 rounded-full bg-[#45d86a]/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
              Featured Investment
            </span>

            <h3 className="mt-5 text-3xl font-black sm:text-4xl">
              {plan.name}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/60">
              A simple way to start your Grow Vest investment journey.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/10 p-5 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Starting Investment
              </p>

              <p className="mt-1 text-4xl font-black">
                {formatPKR(plan.minAmountPaisa)}
              </p>

              {!isFixedPlan && (
                <p className="mt-1 text-xs text-white/50">
                  Up to {formatPKR(plan.maxAmountPaisa)}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <TrendingUp size={21} />
              </div>

              <div>
                <p className="text-xs text-white/50">Investment Duration</p>
                <p className="text-sm font-bold">
                  {plan.durationDays} Days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-7 sm:p-10">
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

          <div className="mt-7 grid grid-cols-2 gap-3">
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium text-gray-500">
                  Estimated Total Profit
                </p>

                <p className="mt-1 text-2xl font-black text-[#173b20]">
                  {formatPKR(totalProfit)}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#45a94a] shadow-sm">
                <TrendingUp size={19} />
              </div>
            </div>
          </div>

          <Link
            href={`/invest?planId=${encodeURIComponent(plan.id)}`}
            className="group mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Invest Now

            <ArrowRight
              size={17}
              className="transition group-hover:translate-x-1"
            />
          </Link>

          <p className="mt-3 text-center text-[10px] text-gray-400">
            Login is required before starting an investment.
          </p>
        </div>
      </div>
    </article>
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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f7ea] text-[#2f8f45]">
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
    <div className="rounded-2xl border border-[#e4eee5] bg-[#f8fbf8] p-3.5">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff8f0] text-[#45a94a]">
        <TrendingUp size={16} />
      </div>

      <p className="text-[10px] text-gray-500">{label}</p>

      <p className="mt-0.5 text-sm font-bold text-[#173b20]">
        {value}
      </p>
    </div>
  );
}

/* ================================================================
   REFERRAL VISUAL
================================================================ */

function ReferralVisual() {
  return (
    <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center">
      <div className="absolute h-40 w-40 rounded-full bg-[#45a94a]/10 blur-2xl" />

      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#45a94a]/30 bg-white shadow-xl">
        <Users size={31} className="text-[#2f8f45]" />
      </div>

      <div className="absolute left-3 top-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#45a94a] text-white shadow-lg">
        <Users size={20} />
      </div>

      <div className="absolute right-3 top-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#2f8f45] text-white shadow-lg">
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
        <p className="text-sm font-bold text-[#173b20]">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

/* ================================================================
   FAQ
================================================================ */

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-2xl border border-[#dceedd] bg-white px-5 py-4 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#173b20]">
        {question}

        <ChevronDown
          size={18}
          className="shrink-0 text-[#45a94a] transition group-open:rotate-180"
        />
      </summary>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
        {answer}
      </p>
    </details>
  );
}

/* ================================================================
   COIN STACK
================================================================ */

function CoinStack({
  height,
  amount,
  plantHeight,
  delay,
}: {
  height: string;
  amount: string;
  plantHeight: string;
  delay: string;
}) {
  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        animation: `float 4s ease-in-out ${delay} infinite`,
      }}
    >
      {/* Plant */}
      <div className={`relative ${plantHeight} w-16`}>
        <div className="absolute bottom-0 left-1/2 h-[90%] w-1 -translate-x-1/2 rounded-full bg-[#45d86a]" />

        <div className="absolute left-1/2 top-1/4 h-5 w-10 -translate-x-full rotate-[-30deg] rounded-full rounded-br-none bg-gradient-to-br from-[#8af3a2] to-[#16a34a]" />

        <div className="absolute right-1/2 top-[48%] h-5 w-10 translate-x-full rotate-[30deg] rounded-full rounded-bl-none bg-gradient-to-br from-[#8af3a2] to-[#16a34a]" />

        <div className="absolute left-1/2 top-0 h-5 w-10 -translate-x-full rotate-[-30deg] rounded-full rounded-br-none bg-gradient-to-br from-[#7df29a] to-[#15803d]" />
      </div>

      {/* Coins */}
      <div className={`relative w-20 ${height}`}>
        <div className="absolute bottom-0 left-0 right-0 h-7 rounded-[50%] border-2 border-[#f6ca58] bg-gradient-to-b from-[#ffe58b] via-[#d99a22] to-[#9d6810] shadow-lg" />

        <div className="absolute bottom-5 left-0 right-0 h-7 rounded-[50%] border-2 border-[#f6ca58] bg-gradient-to-b from-[#ffe58b] via-[#d99a22] to-[#9d6810]" />

        <div className="absolute bottom-10 left-0 right-0 h-7 rounded-[50%] border-2 border-[#f6ca58] bg-gradient-to-b from-[#ffe58b] via-[#d99a22] to-[#9d6810]" />

        <div className="absolute bottom-16 left-0 right-0 h-7 rounded-[50%] border-2 border-[#f6ca58] bg-gradient-to-b from-[#ffe58b] via-[#d99a22] to-[#9d6810]" />

        <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[7px] font-black text-[#9d6810]">
          $
        </div>
      </div>

      <span className="mt-2 text-[9px] font-bold text-white/40">
        {amount}
      </span>
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