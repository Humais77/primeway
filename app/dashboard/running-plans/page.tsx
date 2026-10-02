import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Sprout,
  TrendingUp,
} from "lucide-react";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import { formatPKR } from "@/src/lib/money";

type Props = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function calculateProgress(
  startDate: Date | string,
  endDate: Date | string
) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(((now - start) / (end - start)) * 100)
    )
  );
}

export default async function RunningPlansPage({
  searchParams,
}: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;

  const selectedStatus =
    params.status === "COMPLETED"
      ? "COMPLETED"
      : params.status === "ALL"
        ? "ALL"
        : "ACTIVE";

  const investments = await db.orm.public.Investment
    .where({
      userId: session.userId,
    })
    .include("plan")
    .orderBy((investment) => investment.createdAt.desc())
    .all();

  const activeInvestments = investments.filter(
    (investment) => investment.status === "ACTIVE"
  );

  const completedInvestments = investments.filter(
    (investment) => investment.status === "COMPLETED"
  );

  const displayedInvestments =
    selectedStatus === "ACTIVE"
      ? activeInvestments
      : selectedStatus === "COMPLETED"
        ? completedInvestments
        : investments;

  const profitTransactions = await db.orm.public.Transaction
    .where({
      userId: session.userId,
      type: "PROFIT",
    })
    .orderBy((transaction) => transaction.createdAt.desc())
    .all();

  return (
    <main className="min-h-screen w-full px-4 pb-4 pt-4 md:px-6 md:pt-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#173b20] md:text-4xl">
              My Running Plans
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 md:text-base">
              Track your investments, payouts and progress.
            </p>
          </div>

          <Link
            href="/dashboard/invest-plan"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:opacity-90"
          >
            Explore Plans
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="mb-6 inline-flex flex-wrap gap-2 rounded-2xl border border-[#dceedd] bg-white p-2 shadow-[0_8px_30px_rgba(45,100,50,0.05)]">
          <StatusTab
            href="/dashboard/running-plans?status=ACTIVE"
            active={selectedStatus === "ACTIVE"}
            label={`Running (${activeInvestments.length})`}
          />

          <StatusTab
            href="/dashboard/running-plans?status=COMPLETED"
            active={selectedStatus === "COMPLETED"}
            label={`Completed (${completedInvestments.length})`}
          />

          <StatusTab
            href="/dashboard/running-plans?status=ALL"
            active={selectedStatus === "ALL"}
            label={`All Plans (${investments.length})`}
          />
        </div>

        {/* Investments */}
        {displayedInvestments.length === 0 ? (
          <EmptyPlans />
        ) : (
          <div className="space-y-4">
            {displayedInvestments.map((investment) => {
              const progress = calculateProgress(
                investment.startDate,
                investment.endDate
              );

              const isActive = investment.status === "ACTIVE";

              return (
                <article
                  key={investment.id}
                  className="group relative overflow-hidden rounded-[22px] border border-[#dceedd] bg-white shadow-[0_6px_24px_rgba(45,100,50,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(45,100,50,0.10)]"
                >
                  {/* Gradient top */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#174d28] via-[#45a94a] to-[#2f7d32] px-4 py-4 text-white">
                    <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

                    <div className="pointer-events-none absolute -bottom-12 left-10 h-20 w-20 rounded-full bg-green-200/10 blur-3xl" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className={`inline-flex rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] ${
                            isActive
                              ? "bg-white/10 text-white/90"
                              : "bg-white/5 text-white/70"
                          }`}
                        >
                          {investment.status}
                        </span>

                        <h2 className="mt-2 truncate text-lg font-black">
                          {investment.plan?.name ?? "Investment Plan"}
                        </h2>

                        <p className="mt-0.5 text-[11px] text-white/65">
                          Started {formatDate(investment.startDate)}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                        <TrendingUp size={18} />
                      </div>
                    </div>

                    {/* Invested amount */}
                    <div className="relative mt-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                        Invested Amount
                      </p>

                      <p className="mt-0.5 text-2xl font-black">
                        {formatPKR(investment.amountPaisa)}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                      <PlanDetail
                        icon={<Coins size={15} />}
                        label="Profit Rate"
                        value={`${(
                          investment.profitRateBps / 100
                        ).toFixed(2)}%`}
                        iconClass="bg-[#eff8f0] text-[#2f7d32]"
                        valueClass="text-[#2f7d32]"
                      />

                      <PlanDetail
                        icon={<TrendingUp size={15} />}
                        label="Earned Profit"
                        value={formatPKR(investment.earnedProfitPaisa)}
                        iconClass="bg-green-50 text-[#45a94a]"
                        valueClass="text-[#45a94a]"
                      />

                      <PlanDetail
                        icon={<CalendarDays size={15} />}
                        label="Frequency"
                        value={investment.frequency}
                        iconClass="bg-[#f0f8f1] text-[#388e3c]"
                        valueClass="text-[#173b20]"
                      />

                      <PlanDetail
                        icon={
                          isActive ? (
                            <Clock3 size={15} />
                          ) : (
                            <CheckCircle2 size={15} />
                          )
                        }
                        label={isActive ? "Next Payout" : "Completed"}
                        value={
                          isActive
                            ? formatDate(investment.nextProfitAt)
                            : formatDate(investment.endDate)
                        }
                        iconClass="bg-[#eff8f0] text-[#45a94a]"
                        valueClass="text-[#2f7d32]"
                      />
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                          Investment Progress
                        </span>

                        <span className="text-xs font-black text-[#173b20]">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#e8f1e8]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#45a94a] to-[#2f7d32] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-4 flex flex-col gap-1.5 border-t border-[#e8f1e8] pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        Started:{" "}
                        <strong className="text-[#173b20]">
                          {formatDate(investment.startDate)}
                        </strong>
                      </span>

                      <span>
                        Ends:{" "}
                        <strong className="text-[#173b20]">
                          {formatDate(investment.endDate)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Recent Profit Credits */}
        <section className="mt-8 overflow-hidden rounded-[22px] border border-[#dceedd] bg-white shadow-[0_6px_24px_rgba(45,100,50,0.06)]">
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#174d28] via-[#45a94a] to-[#2f7d32] px-4 py-4 text-white md:px-5">
            <div>
              <h2 className="text-base font-black md:text-lg">
                Recent Profit Credits
              </h2>

              <p className="mt-0.5 text-[11px] text-white/70">
                Your latest investment profit credits.
              </p>
            </div>

            <Link
              href="/dashboard/transactions"
              className="hidden items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 sm:flex"
            >
              View all
              <ArrowRight size={13} />
            </Link>
          </div>

          {profitTransactions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff8f0] text-[#45a94a]">
                <Coins size={20} />
              </div>

              <p className="mt-3 text-sm text-gray-500">
                No profit credits yet. Your credited payouts will appear
                here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e8f1e8] px-4 md:px-5">
              {profitTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#45a94a]">
                      <TrendingUp size={15} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#173b20]">
                        Profit Credit
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-black text-[#45a94a]">
                    +{formatPKR(transaction.amountPaisa)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/dashboard/transactions"
            className="flex items-center justify-center gap-2 border-t border-[#e8f1e8] px-4 py-3.5 text-sm font-semibold text-[#45a94a] hover:bg-[#f7fbf7] sm:hidden"
          >
            View all transactions
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   STATUS TAB
============================================================ */

function StatusTab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3.5 py-2 text-center text-xs font-bold transition md:text-sm ${
        active
          ? "bg-gradient-to-r from-[#45a94a] to-[#2f7d32] text-white shadow-md shadow-green-200"
          : "text-gray-600 hover:bg-[#f2f8f2]"
      }`}
    >
      {label}
    </Link>
  );
}

/* ============================================================
   PLAN DETAIL
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
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5">
      <div
        className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-[10px] text-gray-500">
        {label}
      </p>

      <p className={`mt-0.5 truncate text-xs font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyPlans() {
  return (
    <section className="rounded-[22px] border border-[#dceedd] bg-gradient-to-b from-[#f2f8f2] to-white px-6 py-14 text-center shadow-[0_6px_24px_rgba(45,100,50,0.05)]">
      <div className="mx-auto flex h-13 w-13 items-center justify-center text-[#45a94a]">
        <Sprout size={32} />
      </div>

      <h2 className="mt-4 text-xl font-black text-[#173b20] md:text-2xl">
        No running plans yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Explore plans or choose another status to view your records.
      </p>

      <Link
        href="/dashboard/invest-plan"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:opacity-90"
      >
        Explore Plans
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}