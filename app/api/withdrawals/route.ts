import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

function pakistanDayStart(): Date {
  const shifted = new Date(Date.now() + 5 * 60 * 60 * 1000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - 5 * 60 * 60 * 1000);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "USER") return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const body = await request.json();
    const amountPaisa: unknown = body.amountPaisa;
    const method: unknown = body.method;
    const accountName = typeof body.accountName === "string" ? body.accountName.trim() : "";
    const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber.trim() : "";
    const bankName = typeof body.bankName === "string" ? body.bankName.trim() : "";
    const iban = typeof body.iban === "string" ? body.iban.trim() : "";

    if (typeof amountPaisa !== "number" || !Number.isSafeInteger(amountPaisa) || amountPaisa <= 0) return NextResponse.json({ message: "Enter a valid withdrawal amount." }, { status: 400 });
    if (typeof method !== "string" || !["EASYPAISA", "BANK", "RAAST"].includes(method)) return NextResponse.json({ message: "Choose a valid withdrawal method." }, { status: 400 });
    if (!accountName || !accountNumber) return NextResponse.json({ message: "Account holder name and account number are required." }, { status: 400 });
    if (method === "BANK" && !bankName) return NextResponse.json({ message: "Enter your bank name." }, { status: 400 });

    let global = await db.orm.public.WithdrawalSetting.first();
    if (!global) global = await db.orm.public.WithdrawalSetting.create({ minWithdrawalPaisa: 50000 });
    const dayStartMs = pakistanDayStart().getTime();

    const result = await db.transaction(async (tx) => {
      const user = await tx.orm.public.User.first({ id: session.userId });
      if (!user || !user.isActive) throw new Error("USER_NOT_ACTIVE");
      if (amountPaisa > user.balancePaisa) throw new Error("INSUFFICIENT_BALANCE");

      const userSetting = await tx.orm.public.UserWithdrawalSetting.first({ userId: user.id });
      const investments = await tx.orm.public.Investment.where({ userId: user.id }).all();
      const planIds = [...new Set(investments.map((i) => i.planId))];
      const plans: any[] = [];
      for (const id of planIds) {
        const plan = await tx.orm.public.InvestmentPlan.first({ id });
        if (plan && plan.isActive) plans.push(plan);
      }
      if (!plans.length) throw new Error("NO_ELIGIBLE_PLAN");

      const withdrawals = await tx.orm.public.Withdrawal.where({ userId: user.id }).all();
      const counted = withdrawals.filter((w) => w.status === "PENDING" || w.status === "APPROVED");
      const today = counted.filter((w) => new Date(w.createdAt).getTime() >= dayStartMs);
      const userDailyLimit = userSetting?.isEnabled ? userSetting.dailyLimitPaisa : null;
      const userDailyUsed = today.reduce((sum, w) => sum + w.amountPaisa, 0);
      if (userDailyLimit != null && userDailyUsed + amountPaisa > userDailyLimit) throw new Error(`USER_DAILY_LIMIT:${Math.max(0, userDailyLimit - userDailyUsed)}`);
      const userMinimum = userSetting?.minWithdrawalPaisa ?? null;
      const candidates = plans.map((plan) => {
        const minimumOverrides = [userMinimum, plan.minWithdrawalPaisa ?? null].filter((v): v is number => v != null);
        const effectiveMinimum = minimumOverrides.length ? Math.max(...minimumOverrides) : global.minWithdrawalPaisa;
        const dailyLimit = plan.customWithdrawalLimitsEnabled ? (plan.dailyWithdrawalLimitPaisa ?? global.defaultDailyLimitPaisa) : global.defaultDailyLimitPaisa;
        const lifetimeLimit = plan.customWithdrawalLimitsEnabled ? (plan.lifetimeWithdrawalLimitPaisa ?? global.defaultLifetimeLimitPaisa) : global.defaultLifetimeLimitPaisa;
        const planCounted = counted.filter((w) => w.planId === plan.id);
        const planToday = today.filter((w) => w.planId === plan.id);
        const dailyUsed = planToday.reduce((sum, w) => sum + w.amountPaisa, 0);
        const planLifetimeUsed = planCounted.reduce((sum, w) => sum + w.amountPaisa, 0);
        const dailyRemaining = dailyLimit == null ? null : Math.max(0, dailyLimit - dailyUsed);
        const lifetimeRemaining = lifetimeLimit == null ? null : Math.max(0, lifetimeLimit - planLifetimeUsed);
        const remaining = dailyRemaining == null ? lifetimeRemaining : lifetimeRemaining == null ? dailyRemaining : Math.min(dailyRemaining, lifetimeRemaining);
        return { plan, effectiveMinimum, dailyRemaining, lifetimeRemaining, remaining };
      });

      const minimumPossible = Math.min(...candidates.map((c) => c.effectiveMinimum));
      const eligible = candidates.filter((c) => amountPaisa >= c.effectiveMinimum && (c.dailyRemaining == null || amountPaisa <= c.dailyRemaining) && (c.lifetimeRemaining == null || amountPaisa <= c.lifetimeRemaining));
      if (!eligible.length) {
        if (amountPaisa < minimumPossible) throw new Error(`BELOW_MINIMUM:${minimumPossible}`);
        throw new Error("NO_PLAN_ALLOWANCE");
      }
      eligible.sort((a, b) => (a.remaining ?? Number.MAX_SAFE_INTEGER) - (b.remaining ?? Number.MAX_SAFE_INTEGER));
      const selected = eligible[0];

      const updatedUser = await tx.orm.public.User.where({ id: user.id }).update({ balancePaisa: user.balancePaisa - amountPaisa, updatedAt: new Date().toISOString() });
      if (!updatedUser) throw new Error("USER_UPDATE_FAILED");
      const withdrawal = await tx.orm.public.Withdrawal.create({
        userId: user.id, amountPaisa, method,
        accountDetails: { accountName, accountNumber, bankName: method === "BANK" ? bankName : null, iban: method === "BANK" ? iban : null },
        status: "PENDING", planId: selected.plan.id,
      });
      await tx.orm.public.Transaction.create({
        userId: user.id, type: "WITHDRAWAL", amountPaisa,
        balanceBeforePaisa: user.balancePaisa, balanceAfterPaisa: user.balancePaisa - amountPaisa,
        referenceId: withdrawal.id, withdrawalId: withdrawal.id,
        description: `Withdrawal request submitted (${selected.plan.name})`,
      });
      return { withdrawal, planName: selected.plan.name, minimumWithdrawalPaisa: selected.effectiveMinimum };
    });

    return NextResponse.json({ message: "Withdrawal request submitted successfully.", ...result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "USER_NOT_ACTIVE") return NextResponse.json({ message: "Your account is not active." }, { status: 403 });
    if (message === "INSUFFICIENT_BALANCE") return NextResponse.json({ message: "The withdrawal amount exceeds your available balance." }, { status: 400 });
    if (message === "NO_ELIGIBLE_PLAN") return NextResponse.json({ message: "No eligible investment plan was found for your account." }, { status: 400 });
    if (message.startsWith("BELOW_MINIMUM:")) {
      const minimum = Number(message.split(":")[1]);
      return NextResponse.json({ message: `Minimum withdrawal for your eligible plans is Rs ${(minimum / 100).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`, minimumWithdrawalPaisa: minimum }, { status: 400 });
    }
    if (message.startsWith("USER_DAILY_LIMIT:")) return NextResponse.json({ message: "Your individual daily withdrawal limit has been reached.", remainingPaisa: Number(message.split(":")[1]) }, { status: 400 });
    if (message.startsWith("GLOBAL_DAILY_LIMIT:")) return NextResponse.json({ message: "The daily withdrawal limit has been reached.", remainingPaisa: Number(message.split(":")[1]) }, { status: 400 });
    if (message.startsWith("GLOBAL_LIFETIME_LIMIT:")) return NextResponse.json({ message: "The lifetime withdrawal limit has been reached.", remainingPaisa: Number(message.split(":")[1]) }, { status: 400 });
    if (message === "NO_PLAN_ALLOWANCE") return NextResponse.json({ message: "Your withdrawal exceeds the remaining daily or lifetime allowance for your eligible plans." }, { status: 400 });
    console.error("Withdrawal POST error:", error);
    return NextResponse.json({ message: "Unable to submit withdrawal request." }, { status: 500 });
  }
}
