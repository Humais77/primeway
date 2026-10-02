import Link from "next/link";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  FileText,
  ArrowLeftRight,
  CalendarDays,
  BadgeCheck,
  Download,
  LogOut,
  Gift,
  CreditCard,
  Upload,
  TrendingUp,
  Copy,
  ArrowRight,
  LucideProps,
} from "lucide-react";

import React from "react";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import { formatPKR } from "@/src/lib/money";
import HelpSupport from "@/src/components/help-support";
import ReferralCodeCard from "@/src/components/dashboard/ReferralCodeCard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) return null;

  const user = await db.orm.public.User.first({
    id: session.userId,
  });

  if (!user) return null;

  return (
    <main className="w-full px-4 pb-4 pt-4 md:px-6 md:pt-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-3">

        {/* =====================================================
            ACCOUNT CARD
        ===================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[22px]
            bg-gradient-to-br
            from-[#0F3D2E]
            via-[#18613F]
            to-[#18B152]
            p-5
            text-white
            shadow-[0_10px_30px_rgba(24,97,63,0.22)]
            md:p-6
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-16
              -top-20
              h-48
              w-48
              rounded-full
              bg-[#18B152]/25
              blur-2xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              right-32
              h-40
              w-40
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/70">
                Welcome back
              </p>

              <h2 className="mt-1 truncate text-xl font-black md:text-2xl">
                {user.fullName}
              </h2>

              <span
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-white/10
                  px-2.5
                  py-1
                  text-[11px]
                  font-semibold
                  text-white
                  ring-1
                  ring-white/20
                "
              >
                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    ${
                      user.isActive
                        ? "bg-[#18B152]"
                        : "bg-red-400"
                    }
                  `}
                />

                {user.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <div className="shrink-0 text-right">
              <div
                className="
                  ml-auto
                  mb-2
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/15
                  bg-white/10
                "
              >
                <Wallet size={20} />
              </div>

              <p className="text-[11px] font-medium text-white/70">
                Total Balance
              </p>

              <p className="mt-0.5 text-2xl font-black md:text-3xl">
                {formatPKR(user.balancePaisa)}
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <CardAction
              href="/dashboard/deposit"
              icon={<ArrowDownToLine size={16} />}
              label="Deposit"
            />

            <CardAction
              href="/dashboard/withdraw"
              icon={<ArrowUpFromLine size={16} />}
              label="Withdraw"
            />

            <CardAction
              href="/dashboard/running-plans"
              icon={<Wallet size={16} />}
              label="My Plans"
            />
          </div>
        </section>
        

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            title="Total Investment"
            value={formatPKR(user.totalInvestmentPaisa)}
            icon={<TrendingUp size={16} />}
            iconClass="bg-[#EAF8F0] text-[#18B152]"
          />

          <StatCard
            title="Total Profit"
            value={formatPKR(user.totalProfitPaisa)}
            icon={<Gift size={16} />}
            iconClass="bg-[#EAF8F0] text-[#18613F]"
          />

          <StatCard
            title="Referral Earnings"
            value={formatPKR(user.totalReferralPaisa)}
            icon={<Users size={16} />}
            iconClass="bg-[#EAF8F0] text-[#18B152]"
          />

          <StatCard
            title="Total Withdrawn"
            value={formatPKR(user.totalWithdrawnPaisa)}
            icon={<ArrowUpFromLine size={16} />}
            iconClass="bg-[#EAF8F0] text-[#18613F]"
          />

        </section>

        {/* =====================================================
            HELP & SUPPORT
        ===================================================== */}

        <HelpSupport />

        {/* =====================================================
            REFERRAL
        ===================================================== */}

        <ReferralCodeCard referralCode={user.referralCode} />

        {/* =====================================================
            RECENT TRANSACTIONS
        ===================================================== */}

        <section
          className="
            rounded-[22px]
            border
            border-[#DCEDE3]
            bg-white
            p-4
            shadow-[0_6px_24px_rgba(15,61,46,0.05)]
            md:p-5
          "
        >
          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <h3 className="text-sm font-black text-[#0F3D2E] md:text-base">
                Recent Transactions
              </h3>

              <span
                className="
                  rounded-full
                  bg-[#EAF8F0]
                  px-2
                  py-0.5
                  text-[10px]
                  font-semibold
                  text-[#18613F]
                "
              >
                last 10
              </span>

            </div>

            <Link
              href="/dashboard/transactions"
              className="
                flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-[#18B152]
                transition
                hover:text-[#18613F]
              "
            >
              View All
              <ArrowRight size={13} />
            </Link>

          </div>

          <div className="flex min-h-[64px] items-center justify-center py-4">
            <p className="text-xs text-gray-400">
              No transactions yet.
            </p>
          </div>
        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="grid grid-cols-4 gap-2">

          <QuickAction
            href="/dashboard/deposit-history"
            icon={<FileText />}
            label="Deposit History"
            iconClass="bg-[#EAF8F0] text-[#18B152]"
          />

          <QuickAction
            href="/dashboard/withdrawal-history"
            icon={<Upload />}
            label="Withdraw History"
            iconClass="bg-[#EAF8F0] text-[#18613F]"
          />

          <QuickAction
            href="/dashboard/transactions"
            icon={<ArrowLeftRight />}
            label="Transactions"
            iconClass="bg-[#EAF8F0] text-[#18B152]"
          />

          <QuickAction
            href="/dashboard/running-plans"
            icon={<CalendarDays />}
            label="My Plans"
            iconClass="bg-[#EAF8F0] text-[#18613F]"
          />

        <QuickAction
  href="/dashboard/invest-plan"
  icon={<TrendingUp />}
  label="Invest Plan"
  iconClass="bg-[#EAF8F0] text-[#18B152]"
/>

          <QuickAction
            href="/dashboard/my-team"
            icon={<Users />}
            label="My Team"
            iconClass="bg-[#EAF8F0] text-[#18613F]"
          />

          <QuickAction
            href="/dashboard/app-download"
            icon={<Download />}
            label="App"
            iconClass="bg-[#EAF8F0] text-[#18B152]"
          />

          <QuickAction
            href="/logout"
            icon={<LogOut />}
            label="Logout"
            iconClass="bg-gray-100 text-gray-600"
          />

        </section>

        {/* =====================================================
            FINANCIAL SUMMARY
        ===================================================== */}

        <section className="grid grid-cols-2 gap-2">

          <SummaryCard
            icon={<CreditCard />}
            title="Total Deposit"
            value={formatPKR(user.totalInvestmentPaisa)}
            iconClass="bg-[#EAF8F0] text-[#18B152]"
            valueClass="text-[#18B152]"
          />

          <SummaryCard
            icon={<ArrowUpFromLine />}
            title="Total Withdraw"
            value={formatPKR(user.totalWithdrawnPaisa)}
            iconClass="bg-[#EAF8F0] text-[#18613F]"
            valueClass="text-[#18613F]"
          />

          <SummaryCard
            icon={<Gift />}
            title="Team Reward"
            value={formatPKR(user.totalReferralPaisa)}
            iconClass="bg-[#EAF8F0] text-[#18B152]"
            valueClass="text-[#18B152]"
          />

          <SummaryCard
            icon={<CreditCard />}
            title="My Deposit"
            value={formatPKR(user.totalInvestmentPaisa)}
            iconClass="bg-[#EAF8F0] text-[#18613F]"
            valueClass="text-[#18613F]"
          />

          <SummaryCard
            icon={<Users />}
            title="My Team Deposit"
            value="Rs0.00"
            iconClass="bg-[#EAF8F0] text-[#18B152]"
            valueClass="text-[#18B152]"
          />

          <SummaryCard
            icon={<Users />}
            title="My Team"
            value="0"
            iconClass="bg-[#EAF8F0] text-[#18613F]"
            valueClass="text-[#18613F]"
          />

        </section>

      </div>
    </main>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function CardAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex
        flex-col
        items-center
        justify-center
        gap-1
        rounded-xl
        border
        border-white/15
        bg-white/10
        py-2.5
        text-xs
        font-semibold
        text-white
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:bg-white/20
        hover:shadow-[0_5px_15px_rgba(0,0,0,0.12)]
      "
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-[#DCEDE3]
        bg-white
        p-3.5
        shadow-[0_6px_24px_rgba(15,61,46,0.05)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_8px_28px_rgba(15,61,46,0.08)]
        md:p-4
      "
    >
      <div
        className={`
          mb-2
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          ${iconClass}
        `}
      >
        {icon}
      </div>

      <p className="text-[11px] text-gray-500">
        {title}
      </p>

      <p
        className="
          mt-0.5
          truncate
          text-sm
          font-black
          text-[#0F3D2E]
          md:text-base
        "
      >
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  iconClass,
}: {
  href: string;
  icon: React.ReactElement<LucideProps>;
  label: string;
  iconClass: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        min-h-[86px]
        flex-col
        items-center
        justify-center
        gap-2
        rounded-[18px]
        border
        border-[#DCEDE3]
        bg-white
        p-2
        shadow-[0_6px_24px_rgba(15,61,46,0.05)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#B8DFC7]
        hover:shadow-[0_8px_28px_rgba(15,61,46,0.10)]
      "
    >
      <span
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          transition-transform
          duration-200
          group-hover:scale-105
          ${iconClass}
        `}
      >
        {React.cloneElement(icon, {
          size: 19,
          strokeWidth: 2,
        })}
      </span>

      <span
        className="
          text-center
          text-[10px]
          font-semibold
          leading-tight
          text-[#18613F]
          transition-colors
          group-hover:text-[#18B152]
        "
      >
        {label}
      </span>
    </Link>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  iconClass,
  valueClass,
}: {
  icon: React.ReactElement<LucideProps>;
  title: string;
  value: string;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div
      className="
        group
        flex
        min-h-[70px]
        items-center
        gap-2.5
        rounded-[18px]
        border
        border-[#DCEDE3]
        bg-white
        px-3
        py-2.5
        shadow-[0_6px_24px_rgba(15,61,46,0.05)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#B8DFC7]
        hover:shadow-[0_8px_28px_rgba(15,61,46,0.08)]
      "
    >
      <span
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        {React.cloneElement(icon, {
          size: 17,
          strokeWidth: 2,
        })}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[10px] text-gray-500">
          {title}
        </p>

        <p
          className={`
            mt-0.5
            truncate
            text-xs
            font-bold
            md:text-sm
            ${valueClass}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
}