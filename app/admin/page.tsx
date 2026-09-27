import { redirect } from "next/navigation";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, plans, investments] =
    await Promise.all([
      db.orm.public.User.all(),
      db.orm.public.InvestmentPlan.all(),
      db.orm.public.Investment.all(),
    ]);

  const activeUsers = users.filter(
    (user) => user.isActive
  );

  const activePlans = plans.filter(
    (plan) => plan.isActive
  );

  const activeInvestments =
    investments.filter(
      (investment) =>
        investment.status === "ACTIVE"
    );

  const totalInvestmentPaisa =
    investments.reduce(
      (total, investment) =>
        total + investment.amountPaisa,
      0
    );

  const totalProfitPaisa =
    investments.reduce(
      (total, investment) =>
        total + investment.earnedProfitPaisa,
      0
    );

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-purple-600">
            PRIME WAY ADMIN
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#111b58]">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage users, investment plans and
            platform investments.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={users.length.toLocaleString()}
          />

          <StatCard
            title="Active Users"
            value={activeUsers.length.toLocaleString()}
          />

          <StatCard
            title="Investment Plans"
            value={`${activePlans.length}`}
          />

          <StatCard
            title="Active Investments"
            value={activeInvestments.length.toLocaleString()}
          />
        </div>

        {/* Financial stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FinancialCard
            title="Total Investment"
            value={formatPKR(
              totalInvestmentPaisa
            )}
          />

          <FinancialCard
            title="Total Earned Profit"
            value={formatPKR(
              totalProfitPaisa
            )}
          />
        </div>

        {/* Quick actions */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#111b58]">
            Quick Management
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              href="/admin/users"
              title="Manage Users"
            />

            <QuickLink
              href="/admin/investment-plans"
              title="Investment Plans"
            />

            <QuickLink
              href="/admin/investments"
              title="Investments"
            />

            <QuickLink
              href="/admin/deposits"
              title="Deposits"
            />
          </div>
        </div>
      </div>
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
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-[#111b58]">
        {value}
      </p>
    </div>
  );
}

function FinancialCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#4020bd] to-[#063d82] p-6 text-white shadow-lg">
      <p className="text-sm text-white/70">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-gray-100 bg-[#f8f8ff] p-4 text-sm font-bold text-[#111b58] transition hover:border-purple-200 hover:bg-purple-50"
    >
      {title}
    </a>
  );
}

function formatPKR(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString(
    "en-PK"
  )}`;
}