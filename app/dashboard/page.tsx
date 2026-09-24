import { Wallet, ArrowDownToLine, ArrowUpFromLine, Users } from "lucide-react";

import { connectDB } from "@/src/lib/db";
import { getSession } from "@/src/lib/auth";
import User from "@/src/models/User";
import { formatPKR } from "@/src/lib/money";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  await connectDB();

  const user = await User.findById(session.userId).lean();

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <button className="rounded-xl bg-white p-3 shadow-sm">
          ☰
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold text-[#111b58]">
            Prime Way
          </h1>

          <p className="text-[7px] tracking-[0.25em] text-gray-500">
            INVEST TODAY, EARN TOMORROW
          </p>
        </div>

        <button className="rounded-xl bg-white p-3 shadow-sm">
          🔔
        </button>
      </header>

      {/* Account Card */}
      <section className="rounded-2xl bg-gradient-to-r from-[#4020bd] to-[#063d82] p-5 text-white shadow-lg">
        <div className="flex justify-between">
          <div>
            <p className="text-xs opacity-80">
              Welcome Back!
            </p>

            <h2 className="text-xl font-bold">
              {user.fullName}
            </h2>

            <span className="mt-2 inline-block rounded-full bg-green-500 px-3 py-1 text-xs">
              Active
            </span>
          </div>

          <div className="text-right">
            <Wallet className="ml-auto mb-2" />

            <p className="text-xs opacity-80">
              Total Balance
            </p>

            <p className="text-2xl font-bold">
              {formatPKR(user.balancePaisa)}
            </p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-sm">
        <button className="flex flex-col items-center gap-1 rounded-xl p-3 hover:bg-gray-50">
          <ArrowDownToLine className="text-purple-600" />
          <span className="text-xs">Deposit</span>
        </button>

        <button className="flex flex-col items-center gap-1 rounded-xl p-3 hover:bg-gray-50">
          <ArrowUpFromLine className="text-green-600" />
          <span className="text-xs">Withdraw</span>
        </button>

        <button className="flex flex-col items-center gap-1 rounded-xl p-3 hover:bg-gray-50">
          <Wallet className="text-blue-600" />
          <span className="text-xs">My Plan</span>
        </button>
      </section>

      {/* Statistics */}
      <section className="mt-3 grid grid-cols-2 gap-3">
        <StatCard
          title="Total Investment"
          value={formatPKR(user.totalInvestmentPaisa)}
        />

        <StatCard
          title="Total Profit"
          value={formatPKR(user.totalProfitPaisa)}
        />

        <StatCard
          title="Referral Earnings"
          value={formatPKR(user.totalReferralPaisa)}
        />

        <StatCard
          title="Total Withdrawn"
          value={formatPKR(user.totalWithdrawnPaisa)}
        />
      </section>

      {/* Referral */}
      <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />

          <h3 className="font-semibold">
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
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>

      <p className="mt-1 text-lg font-bold text-[#111b58]">
        {value}
      </p>
    </div>
  );
}