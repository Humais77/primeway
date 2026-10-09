
import { redirect } from "next/navigation";

import { getSession } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import WithdrawForm from "@/src/components/dashboard/WithdrawForm";

const ACTIVE_STATUSES = ["PENDING", "APPROVED"] as const;
const PAKISTAN_OFFSET_MS = 5 * 60 * 60 * 1000;

function pakistanDayStart(now = new Date()) {
  const pakistanNow = new Date(now.getTime() + PAKISTAN_OFFSET_MS);

  return new Date(
    Date.UTC(
      pakistanNow.getUTCFullYear(),
      pakistanNow.getUTCMonth(),
      pakistanNow.getUTCDate()
    ) - PAKISTAN_OFFSET_MS
  );
}

function isToday(value: unknown, dayStart: Date) {
  const timestamp = new Date(String(value)).getTime();
  return Number.isFinite(timestamp) && timestamp >= dayStart.getTime();
}

function money(value: number) {
  return `Rs ${(value / 100).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function WithdrawPage() {
  const session = await getSession();

  if (!session || session.role !== "USER") {
    redirect("/login");
  }

  const user = await db.orm.public.User.first({
    id: session.userId,
  });

  if (!user) {
    redirect("/login");
  }

  let settings = await db.orm.public.WithdrawalSetting.first();

  if (!settings) {
    settings = await db.orm.public.WithdrawalSetting.create({
      minWithdrawalPaisa: 50000,
      defaultDailyLimitPaisa: null,
      defaultLifetimeLimitPaisa: null,
    });
  }

  const userSetting =
    await db.orm.public.UserWithdrawalSetting.first({
      userId: user.id,
    });

  const investments = await db.orm.public.Investment
    .where({ userId: user.id })
    .all();

  const withdrawals = await db.orm.public.Withdrawal
    .where({ userId: user.id })
    .all();

  const plans = await db.orm.public.InvestmentPlan.all();
  const investedPlanIds = new Set(
    investments.map((investment) => investment.planId)
  );

  const eligiblePlans = plans.filter((plan) =>
    investedPlanIds.has(plan.id)
  );

  const dayStart = pakistanDayStart();

  const countedWithdrawals = withdrawals.filter((withdrawal) =>
    ACTIVE_STATUSES.includes(
      withdrawal.status as (typeof ACTIVE_STATUSES)[number]
    )
  );

  const userDailyUsed = countedWithdrawals
    .filter((withdrawal) => isToday(withdrawal.createdAt, dayStart))
    .reduce((sum, withdrawal) => sum + withdrawal.amountPaisa, 0);

  const userLimitEnabled =
    userSetting?.isEnabled === true &&
    userSetting.dailyLimitPaisa != null;

  const userDailyLimitPaisa = userLimitEnabled
    ? userSetting.dailyLimitPaisa!
    : null;

  const userDailyRemainingPaisa =
    userDailyLimitPaisa == null
      ? null
      : Math.max(0, userDailyLimitPaisa - userDailyUsed);

  const planLimits = eligiblePlans.map((plan) => {
    const planWithdrawals = countedWithdrawals.filter(
      (withdrawal) => withdrawal.planId === plan.id
    );

    const dailyUsed = planWithdrawals
      .filter((withdrawal) => isToday(withdrawal.createdAt, dayStart))
      .reduce((sum, withdrawal) => sum + withdrawal.amountPaisa, 0);

    const lifetimeUsed = planWithdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.amountPaisa,
      0
    );

    const dailyLimit =
      plan.customWithdrawalLimitsEnabled
        ? plan.dailyWithdrawalLimitPaisa ??
          settings!.defaultDailyLimitPaisa
        : settings!.defaultDailyLimitPaisa;

    const lifetimeLimit =
      plan.customWithdrawalLimitsEnabled
        ? plan.lifetimeWithdrawalLimitPaisa ??
          settings!.defaultLifetimeLimitPaisa
        : settings!.defaultLifetimeLimitPaisa;

    const dailyRemaining =
      dailyLimit == null
        ? null
        : Math.max(0, dailyLimit - dailyUsed);

    const lifetimeRemaining =
      lifetimeLimit == null
        ? null
        : Math.max(0, lifetimeLimit - lifetimeUsed);

    const remaining =
      dailyRemaining == null && lifetimeRemaining == null
        ? null
        : Math.min(
            dailyRemaining ?? Number.POSITIVE_INFINITY,
            lifetimeRemaining ?? Number.POSITIVE_INFINITY
          );

    return {
      id: plan.id,
      name: plan.name,
      dailyLimitPaisa: dailyLimit,
      dailyUsedPaisa: dailyUsed,
      dailyRemainingPaisa: dailyRemaining,
      lifetimeLimitPaisa: lifetimeLimit,
      lifetimeUsedPaisa: lifetimeUsed,
      lifetimeRemainingPaisa: lifetimeRemaining,
      remainingPaisa: remaining,
    };
  });

  const maxPlanAllowance = planLimits.length
    ? Math.max(
        ...planLimits.map(
          (plan) => plan.remainingPaisa ?? user.balancePaisa
        )
      )
    : 0;

  const maxAllowedPaisa = Math.max(
    0,
    Math.min(
      user.balancePaisa,
      userDailyRemainingPaisa ?? user.balancePaisa,
      maxPlanAllowance
    )
  );

  return (
    <main className="min-h-screen bg-[#f7faf7] px-4 pb-10 pt-5 md:px-6 md:pt-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#45a94a]">
            Wallet management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#173b20] md:text-4xl">
            Withdraw Funds
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7d6e]">
            Check your available balance and withdrawal allowance before
            requesting a payout.
          </p>
        </div>

        <WithdrawForm
          balancePaisa={user.balancePaisa}
          minWithdrawalPaisa={settings.minWithdrawalPaisa}
          userDailyLimitPaisa={userDailyLimitPaisa}
          userDailyUsedPaisa={userDailyUsed}
          userDailyRemainingPaisa={userDailyRemainingPaisa}
          maxAllowedPaisa={maxAllowedPaisa}
          planLimits={planLimits}
        />

        <p className="mt-5 text-center text-xs leading-5 text-gray-400">
          Daily limits reset at midnight Pakistan time. Pending and approved
          requests count toward your limits; rejected requests do not.
        </p>
      </div>
    </main>
  );
}