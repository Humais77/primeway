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
  Settings,
  Home,
  Grid2X2,
  Upload,
  LucideProps,
  UserRound,
} from "lucide-react";

import React from "react";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import { formatPKR } from "@/src/lib/money";

import {
  DashboardUIProvider,
} from "@/src/components/dashboard/DashboardUI";

import DashboardHeader from "@/src/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await db.orm.public.User.first({
    id: session.userId,
  });

  if (!user) {
    return null;
  }

  return (
    <DashboardUIProvider
      fullName={user.fullName}
      userId={user.id}
    >
      <DashboardHeader 
          fullName={user.fullName} 
          balanceStr={formatPKR(user.balancePaisa)} 
        />
      <main className="w-full px-4 pb-28 pt-[92px] md:px-6 lg:px-8">
        {/* Header */}
        

        {/* Account Card */}
        <section
  className="
    relative
    overflow-hidden
    rounded-2xl
    bg-gradient-to-r
    from-[#4020bd]
    via-[#3520a8]
    to-[#063d82]
    p-6
    text-white
    shadow-[0_8px_25px_rgba(64,32,189,0.18)]
    md:p-7
  "
>
  {/* Decorative glow */}
  <div
    className="
      pointer-events-none
      absolute
      -right-16
      -top-20
      h-48
      w-48
      rounded-full
      bg-white/10
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
      bg-blue-300/10
      blur-3xl
    "
  />

  <div className="relative flex items-center justify-between">
    {/* Left */}
    <div>
      <p className="text-sm font-medium text-white/70">
        Welcome Back!
      </p>

      <h2 className="mt-1 text-2xl font-bold md:text-3xl">
        {user.fullName}
      </h2>

      <span
        className="
          mt-3
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-green-500/20
          px-3
          py-1
          text-xs
          font-semibold
          text-green-100
          ring-1
          ring-green-300/30
        "
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
        {user.isActive ? "Active" : "Inactive"}
      </span>
    </div>

    {/* Right */}
    <div className="text-right">
      <div
        className="
          ml-auto
          mb-2
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-white/10
        "
      >
        <Wallet size={22} />
      </div>

      <p className="text-xs font-medium text-white/70 md:text-sm">
        Total Balance
      </p>

      <p className="mt-1 text-2xl font-black md:text-3xl">
        {formatPKR(user.balancePaisa)}
      </p>
    </div>
  </div>
</section>

        {/* Main Actions */}
        <section className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border border-[#e5e8f3] bg-white p-3 shadow-sm">
          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-xl p-3 transition hover:bg-gray-50"
          >
            <ArrowDownToLine className="text-[#4020bd]" />

            <span className="text-sm">
              Deposit
            </span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-xl p-3 transition hover:bg-gray-50"
          >
            <ArrowUpFromLine className="text-[#063d82]" />

            <span className="text-sm">
              Withdraw
            </span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-xl p-3 transition hover:bg-gray-50"
          >
           <Wallet className="text-[#4020bd]" />

            <span className="text-sm">
              My Plan
            </span>
          </button>
        </section>

        {/* Statistics */}
        <section className="mt-3 grid grid-cols-2 gap-3">
          <StatCard
            title="Total Investment"
            value={formatPKR(
              user.totalInvestmentPaisa
            )}
          />

          <StatCard
            title="Total Profit"
            value={formatPKR(
              user.totalProfitPaisa
            )}
          />

          <StatCard
            title="Referral Earnings"
            value={formatPKR(
              user.totalReferralPaisa
            )}
          />

          <StatCard
            title="Total Withdrawn"
            value={formatPKR(
              user.totalWithdrawnPaisa
            )}
          />
        </section>

        {/* Referral */}
        <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />

            <h3 className="text-base font-semibold">
              Referral Program
            </h3>
          </div>

          <p className="text-sm text-gray-500">
            Your referral code
          </p>

          <div className="mt-2 rounded-lg bg-gray-100 p-3 font-mono text-sm">
            {user.referralCode}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#111b58]">
                Recent Transactions
              </h3>

              <span className="text-[11px] text-gray-400">
                last 10 min
              </span>
            </div>

            <button
              type="button"
              className="flex items-center text-xs font-medium text-purple-600"
            >
              View All
              <span className="ml-1 text-base">
                ›
              </span>
            </button>
          </div>

          <div className="flex min-h-[60px] items-center justify-center">
            <p className="text-xs text-gray-400">
              No transaction from the last 10 minutes.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-3 grid grid-cols-4 gap-2">
          <QuickAction
            icon={<FileText />}
            label={
              <>
                Deposit
                <br />
                History
              </>
            }
            iconClass="bg-purple-100 text-purple-600"
          />

          <QuickAction
            icon={<Upload />}
            label={
              <>
                Withdraw
                <br />
                History
              </>
            }
            iconClass="bg-green-100 text-green-600"
          />

          <QuickAction
            icon={<ArrowLeftRight />}
            label="Transaction"
            iconClass="bg-orange-100 text-orange-500"
          />

          <QuickAction
            icon={<CalendarDays />}
            label="My Plan"
            iconClass="bg-blue-100 text-blue-600"
          />

          <QuickAction
            icon={<BadgeCheck />}
            label="Verified"
            iconClass="bg-pink-100 text-pink-500"
          />

          <QuickAction
            icon={<Users />}
            label="My Team"
            iconClass="bg-purple-100 text-purple-600"
          />

          <QuickAction
            icon={<Download />}
            label="App Download"
            iconClass="bg-blue-100 text-blue-600"
          />

          <QuickAction
            icon={<LogOut />}
            label="Logout"
            iconClass="bg-gray-100 text-gray-600"
          />
        </section>

        {/* Financial Summary */}
        <section className="mt-3 grid grid-cols-2 gap-2">
          <SummaryCard
            icon={<CreditCard />}
            title="Total Deposit"
            value="Rs0.00"
            iconClass="bg-blue-50 text-blue-600"
            valueClass="text-blue-600"
          />

          <SummaryCard
            icon={<ArrowUpFromLine />}
            title="Total Withdraw"
            value="Rs0.00"
            iconClass="bg-pink-50 text-pink-500"
            valueClass="text-pink-500"
          />

          <SummaryCard
            icon={<Gift />}
            title="Total Team Reward"
            value="Rs0.00"
            iconClass="bg-purple-50 text-purple-600"
            valueClass="text-purple-600"
          />

          <SummaryCard
            icon={<CreditCard />}
            title="My Deposit"
            value="Rs0.00"
            iconClass="bg-green-50 text-green-600"
            valueClass="text-green-600"
          />

          <SummaryCard
            icon={<Users />}
            title="My Team Deposit"
            value="Rs0.00"
            iconClass="bg-orange-50 text-orange-500"
            valueClass="text-orange-500"
          />

          <SummaryCard
            icon={<Users />}
            title="My Team"
            value="0"
            iconClass="bg-blue-50 text-blue-600"
            valueClass="text-blue-600"
          />
        </section>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </main>
    </DashboardUIProvider>
  );
}

/* ============================================================ */
/* COMPONENTS */
/* ============================================================ */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-[#111b58]">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  iconClass,
}: {
  icon: React.ReactElement<LucideProps>;
  label: React.ReactNode;
  iconClass: string;
}) {
  return (
    <button
      type="button"
      className="flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-2xl bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {React.cloneElement(icon, {
          size: 20,
          strokeWidth: 2,
        })}
      </span>

      <span className="text-center text-[11px] font-medium leading-tight text-gray-700">
        {label}
      </span>
    </button>
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
    <div className="flex min-h-[72px] items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {React.cloneElement(icon, {
          size: 19,
          strokeWidth: 2,
        })}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[11px] text-gray-500">
          {title}
        </p>

        <p
          className={`mt-0.5 text-sm font-bold ${valueClass}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function BottomNavigation() {
  return (
    <nav className="fixed bottom-3 left-1/2 z-50 flex h-[68px] w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-2xl bg-white px-2 shadow-[0_8px_30px_rgba(40,30,100,0.15)] lg:hidden">
      <BottomNavItem
        icon={<Home />}
        label="Home"
        active
      />

      <BottomNavItem
        icon={<CreditCard />}
        label="My Deposit"
      />

      <div className="relative -mt-7">
        <button
          type="button"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-[0_6px_18px_rgba(109,40,217,0.4)] ring-4 ring-white"
        >
          <Grid2X2 size={23} />
        </button>

        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-purple-600">
          Payment
        </span>
      </div>

      <BottomNavItem
        icon={<Settings />}
        label="Setting"
      />

      <BottomNavItem
        icon={<UserRound />}
        label="Profile"
      />
    </nav>
  );
}

function BottomNavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactElement<LucideProps>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-[58px] flex-col items-center justify-center gap-1 ${
        active ? "text-purple-600" : "text-gray-500"
      }`}
    >
      {React.cloneElement(icon, {
        size: 20,
        strokeWidth: active ? 2.5 : 2,
      })}

      <span className="text-[10px] font-medium">
        {label}
      </span>
    </button>
  );
}