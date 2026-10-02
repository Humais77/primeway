import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Gift,
  TrendingUp,
  Wallet,
  Sparkles,
} from "lucide-react";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import { formatPKR } from "@/src/lib/money";

export default async function InvestPlanPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const plans = await db.orm.public.InvestmentPlan
    .where({
      isActive: true,
    })
    .orderBy((plan) => plan.createdAt.asc())
    .all();

  const runningInvestments = await db.orm.public.Investment
    .where({
      userId: session.userId,
      status: "ACTIVE",
    })
    .all();

  const runningPlanIds = new Set(
    runningInvestments.map((investment) => investment.planId)
  );

  const availablePlans = plans.filter(
    (plan) => !runningPlanIds.has(plan.id)
  );

  return (
    <main className="w-full px-4 pb-4 pt-4 md:px-6 md:pt-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#173b20] md:text-4xl">
                Investment Plans
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 md:text-base">
                Explore the available Grow Vest investment plans and review
                their terms before investing.
              </p>
            </div>

            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a] sm:flex">
              <Sparkles size={23} />
            </div>
          </div>
        </div>

        {/* Plans */}
        {availablePlans.length === 0 ? (
          <EmptyPlans />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {availablePlans.map((plan, index) => (
              <InvestmentPlanCard
                key={plan.id}
                plan={plan}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   PLAN CARD
============================================================ */

function InvestmentPlanCard({
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
  const investmentAmount = plan.minAmountPaisa;

  const profitRate = plan.profitRateBps / 100;

  const referralRate = plan.referralBonusBps / 100;

  const periods =
    plan.frequency === "DAILY"
      ? plan.durationDays
      : plan.frequency === "WEEKLY"
        ? Math.floor(plan.durationDays / 7)
        : Math.floor(plan.durationDays / 30);

  const profitPerPeriod = Math.floor(
    investmentAmount * (plan.profitRateBps / 10_000)
  );

  const totalProfit = profitPerPeriod * periods;

  const isFixedPlan =
    plan.minAmountPaisa === plan.maxAmountPaisa;

  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-[#dceedd] bg-white shadow-[0_8px_30px_rgba(45,100,50,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(45,100,50,0.12)]">
      {/* Top gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#174d28] via-[#45a94a] to-[#2f7d32] px-5 pb-5 pt-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-16 left-12 h-32 w-32 rounded-full bg-green-200/10 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white/80">
              PLAN {String(index + 1).padStart(2, "0")}
            </span>

            <h2 className="mt-3 text-2xl font-black">
              {plan.name}
            </h2>

            <p className="mt-1 text-xs text-white/65">
              {getPlanDescription(index)}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
            <TrendingUp size={21} />
          </div>
        </div>

        {/* Investment amount */}
        <div className="relative mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
            Investment
          </p>

          <p className="mt-1 text-3xl font-black">
            {formatPKR(investmentAmount)}
          </p>

          {!isFixedPlan && (
            <p className="mt-1 text-[10px] text-white/60">
              Up to {formatPKR(plan.maxAmountPaisa)}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <PlanDetail
            icon={<TrendingUp size={17} />}
            label={`${getFrequencyLabel(plan.frequency)} Profit`}
            value={formatPKR(profitPerPeriod)}
            iconClass="bg-green-50 text-[#45a94a]"
            valueClass="text-[#45a94a]"
          />

          <PlanDetail
            icon={<CalendarDays size={17} />}
            label="Duration"
            value={`${plan.durationDays} Days`}
            iconClass="bg-[#eff8f0] text-[#2f7d32]"
            valueClass="text-[#173b20]"
          />

          <PlanDetail
            icon={<Wallet size={17} />}
            label="Profit Rate"
            value={`${profitRate}%`}
            iconClass="bg-[#e7f4e8] text-[#2f7d32]"
            valueClass="text-[#2f7d32]"
          />

          <PlanDetail
            icon={<Gift size={17} />}
            label="Referral Bonus"
            value={`${referralRate}%`}
            iconClass="bg-[#f0f8f1] text-[#388e3c]"
            valueClass="text-[#388e3c]"
          />
        </div>

        {/* Total profit */}
        <div className="mt-4 rounded-2xl border border-[#cfe7d1] bg-[#eff8f0] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500">
                Estimated Total Profit
              </p>

              <p className="mt-1 text-xl font-black text-[#173b20]">
                {formatPKR(totalProfit)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#45a94a] shadow-sm">
              <TrendingUp size={19} />
            </div>
          </div>
        </div>

        {/* Invest button */}
        <Link
          href={`/dashboard/deposit?planId=${plan.id}`}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:opacity-90"
        >
          Invest Now
          <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}

/* ============================================================
   DETAIL
============================================================ */

function PlanDetail({
  icon,
  label,
  value,
  iconClass,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
      <div
        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-[10px] text-gray-500">
        {label}
      </p>

      <p className={`mt-0.5 text-sm font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyPlans() {
  return (
    <section className="rounded-3xl border border-dashed border-[#cfe7d1] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
        <Wallet size={25} />
      </div>

      <h2 className="mt-4 text-lg font-bold text-[#173b20]">
        No Investment Plans
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        There are currently no active investment plans available.
      </p>
    </section>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getPlanDescription(index: number) {
  const descriptions = [
    "Small Step · Big Future",
    "Invest Smart · Grow Faster",
    "Bigger Investment · Bigger Opportunities",
    "Strong Today · Stronger Tomorrow",
    "Premium Growth · Premium Rewards",
    "Explore Your · Next Opportunity",
  ];

  return descriptions[index % descriptions.length];
}

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