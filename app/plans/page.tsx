import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Gift,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { db } from "@/src/prisma/db";
import { formatPKR } from "@/src/lib/money";

import { LandingHeader } from "@/src/components/landing/LandingHeader";
import { LandingFooter } from "@/src/components/landing/LandingFooter";

export default async function PlansPage() {
  const plans = await db.orm.public.InvestmentPlan
    .where({
      isActive: true,
    })
    .orderBy((plan) => plan.createdAt.asc())
    .all();

  return (
    <main className="min-h-screen bg-[#f7fbf7]">
      {/* Header Hero */}
      <section className="relative overflow-hidden bg-[#03291d]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-[#16a34a]/20 blur-[110px]" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#45a94a]/10 blur-[120px]" />
        </div>

        <LandingHeader />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70e990]">
            Investment Plans
          </p>

          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Choose a Plan That Fits Your{" "}
            <span className="text-[#70e990]">Goals</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Explore the currently available Grow Vest investment plans, review
            their terms and select the option that works for you.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        {plans.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-[#cfe7d1] bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
              <Wallet size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-[#173b20]">
              Plans Coming Soon
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              There are currently no active investment plans. Please check back
              soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan, index) => (
              <PublicPlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl rounded-[30px] bg-[#eff8f0] px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-black text-[#173b20] sm:text-3xl">
            Not sure where to start?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Learn more about how Grow Vest works before choosing an investment
            plan.
          </p>

          <Link
            href="/learn-more"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#45a94a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f7d32]"
          >
            Learn More
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function PublicPlanCard({
  plan,
  index,
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
  index: number;
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
    <article className="group overflow-hidden rounded-[28px] border border-[#dceedd] bg-white shadow-[0_8px_30px_rgba(45,100,50,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(45,100,50,0.12)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#174d28] via-[#45a94a] to-[#2f7d32] p-6 text-white">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em]">
                PLAN {String(index + 1).padStart(2, "0")}
              </span>

              <h2 className="mt-3 text-2xl font-black">{plan.name}</h2>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-[9px] uppercase tracking-[0.12em] text-white/50">
              Investment
            </p>

            <p className="mt-1 text-3xl font-black">
              {formatPKR(plan.minAmountPaisa)}
            </p>

            {!isFixedPlan && (
              <p className="mt-1 text-[10px] text-white/50">
                Up to {formatPKR(plan.maxAmountPaisa)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          <Detail
            icon={<TrendingUp size={16} />}
            label={`${frequencyLabel(plan.frequency)} Profit`}
            value={formatPKR(profitPerPeriod)}
          />

          <Detail
            icon={<CalendarDays size={16} />}
            label="Duration"
            value={`${plan.durationDays} Days`}
          />

          <Detail
            icon={<Wallet size={16} />}
            label="Profit Rate"
            value={`${profitRate}%`}
          />

          <Detail
            icon={<Gift size={16} />}
            label="Referral Bonus"
            value={`${referralRate}%`}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[#cfe7d1] bg-[#eff8f0] p-4">
          <p className="text-[10px] font-medium text-gray-500">
            Estimated Total Profit
          </p>

          <p className="mt-1 text-xl font-black text-[#173b20]">
            {formatPKR(totalProfit)}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-[#2f7d32]">
          <CheckCircle2 size={15} />
          <span>Available for new investments</span>
        </div>

        <Link
          href={`/register?planId=${encodeURIComponent(plan.id)}`}
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] text-sm font-bold text-white shadow-lg shadow-green-100 transition hover:opacity-90"
        >
          Get Started
          <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e4eee5] bg-[#f8fbf8] p-3">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff8f0] text-[#45a94a]">
        {icon}
      </div>

      <p className="text-[10px] text-gray-500">{label}</p>

      <p className="mt-0.5 text-sm font-bold text-[#173b20]">{value}</p>
    </div>
  );
}

function frequencyLabel(
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