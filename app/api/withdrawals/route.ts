
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

const ACTIVE_STATUSES = ["PENDING", "APPROVED"] as const;
const PAKISTAN_OFFSET_MS = 5 * 60 * 60 * 1000;

function pakistanDayStart(now = new Date()): Date {
  // Pakistan is UTC+5 and does not currently observe daylight saving.
  const pakistanNow = new Date(now.getTime() + PAKISTAN_OFFSET_MS);

  return new Date(
    Date.UTC(
      pakistanNow.getUTCFullYear(),
      pakistanNow.getUTCMonth(),
      pakistanNow.getUTCDate()
    ) - PAKISTAN_OFFSET_MS
  );
}

function isWithinDailyWindow(createdAt: unknown, dayStart: Date) {
  const timestamp = new Date(String(createdAt)).getTime();

  return (
    Number.isFinite(timestamp) &&
    timestamp >= dayStart.getTime()
  );
}

function isCountedWithdrawal(status: string) {
  return ACTIVE_STATUSES.includes(
    status as (typeof ACTIVE_STATUSES)[number]
  );
}

function validLimit(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value > 0)
  );
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "USER") {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const amountPaisa = body.amountPaisa;
    const method = body.method;
    const accountName =
      typeof body.accountName === "string"
        ? body.accountName.trim()
        : "";
    const accountNumber =
      typeof body.accountNumber === "string"
        ? body.accountNumber.trim()
        : "";
    const bankName =
      typeof body.bankName === "string"
        ? body.bankName.trim()
        : "";
    const iban =
      typeof body.iban === "string"
        ? body.iban.trim()
        : "";

    if (
      !Number.isSafeInteger(amountPaisa) ||
      amountPaisa <= 0
    ) {
      return NextResponse.json(
        { message: "Enter a valid withdrawal amount." },
        { status: 400 }
      );
    }

    if (
      !["EASYPAISA", "BANK", "RAAST"].includes(method)
    ) {
      return NextResponse.json(
        { message: "Select a valid withdrawal method." },
        { status: 400 }
      );
    }

    if (!accountName || !accountNumber) {
      return NextResponse.json(
        {
          message:
            "Account holder name and account number are required.",
        },
        { status: 400 }
      );
    }

    // Read the minimum before entering the transaction.
    let settings = await db.orm.public.WithdrawalSetting.first();

    if (!settings) {
      settings = await db.orm.public.WithdrawalSetting.create({
        minWithdrawalPaisa: 50000,
        defaultDailyLimitPaisa: null,
        defaultLifetimeLimitPaisa: null,
      });
    }

    if (amountPaisa < settings.minWithdrawalPaisa) {
      return NextResponse.json(
        {
          message: `Minimum withdrawal is Rs ${(
            settings.minWithdrawalPaisa / 100
          ).toLocaleString("en-PK")}.`,
        },
        { status: 400 }
      );
    }

    const dayStart = pakistanDayStart();

    const result = await db.transaction(async (tx) => {
      const user = await tx.orm.public.User.first({
        id: session.userId,
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (!user.isActive) {
        throw new Error("ACCOUNT_DISABLED");
      }

      if (user.balancePaisa < amountPaisa) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // A user's own daily cap applies across all investment plans.
      const userSetting =
        await tx.orm.public.UserWithdrawalSetting.first({
          userId: user.id,
        });

      const userWithdrawals =
        await tx.orm.public.Withdrawal
          .where({ userId: user.id })
          .all();

      const countedUserWithdrawals =
        userWithdrawals.filter((withdrawal) =>
          isCountedWithdrawal(withdrawal.status)
        );

      const userDailyUsed = countedUserWithdrawals
        .filter((withdrawal) =>
          isWithinDailyWindow(withdrawal.createdAt, dayStart)
        )
        .reduce(
          (total, withdrawal) =>
            total + withdrawal.amountPaisa,
          0
        );

      if (
        userSetting?.isEnabled &&
        userSetting.dailyLimitPaisa !== null &&
        userSetting.dailyLimitPaisa !== undefined
      ) {
        const remaining =
          userSetting.dailyLimitPaisa - userDailyUsed;

        if (amountPaisa > remaining) {
          throw new Error(
            `USER_DAILY_LIMIT:${Math.max(0, remaining)}`
          );
        }
      }

      // Only plans the user has invested in are eligible.
      const investments =
        await tx.orm.public.Investment
          .where({ userId: user.id })
          .all();

      const investedPlanIds = new Set(
        investments.map((investment) => investment.planId)
      );

      if (investedPlanIds.size === 0) {
        throw new Error("NO_ELIGIBLE_PLAN");
      }

      const allPlans =
        await tx.orm.public.InvestmentPlan.all();

      const eligiblePlans = allPlans.filter(
        (plan) => investedPlanIds.has(plan.id)
      );

      const allWithdrawals =
        await tx.orm.public.Withdrawal.all();

      const countedWithdrawals =
        allWithdrawals.filter((withdrawal) =>
          isCountedWithdrawal(withdrawal.status)
        );

      const candidates = eligiblePlans
        .map((plan) => {
          const planWithdrawals = countedWithdrawals.filter(
            (withdrawal) =>
              withdrawal.userId === user.id &&
              withdrawal.planId === plan.id
          );

          const lifetimeUsed = planWithdrawals.reduce(
            (total, withdrawal) =>
              total + withdrawal.amountPaisa,
            0
          );

          const dailyUsed = planWithdrawals
            .filter((withdrawal) =>
              isWithinDailyWindow(
                withdrawal.createdAt,
                dayStart
              )
            )
            .reduce(
              (total, withdrawal) =>
                total + withdrawal.amountPaisa,
              0
            );

          // If custom limits are disabled, inherit both global
          // defaults. If enabled, a null value inherits only that
          // corresponding global default.
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
            dailyLimit === null || dailyLimit === undefined
              ? Number.POSITIVE_INFINITY
              : Math.max(0, dailyLimit - dailyUsed);

          const lifetimeRemaining =
            lifetimeLimit === null ||
            lifetimeLimit === undefined
              ? Number.POSITIVE_INFINITY
              : Math.max(0, lifetimeLimit - lifetimeUsed);

          const remaining = Math.min(
            dailyRemaining,
            lifetimeRemaining
          );

          return {
            plan,
            remaining,
            dailyRemaining,
            lifetimeRemaining,
          };
        })
        .filter(
          (candidate) =>
            candidate.remaining >= amountPaisa
        )
        // Prefer the eligible plan with the least remaining
        // allowance after considering its effective limits.
        .sort((a, b) => a.remaining - b.remaining);

      const selected = candidates[0];

      if (!selected) {
        throw new Error("PLAN_WITHDRAWAL_LIMIT");
      }

      const balanceBefore = user.balancePaisa;
      const balanceAfter = balanceBefore - amountPaisa;

      const withdrawal =
        await tx.orm.public.Withdrawal.create({
          userId: user.id,
          planId: selected.plan.id,
          amountPaisa,
          method,
          accountDetails: {
            accountName,
            accountNumber,
            ...(bankName ? { bankName } : {}),
            ...(iban ? { iban } : {}),
          },
          status: "PENDING",
        });

      const updatedUser =
        await tx.orm.public.User
          .where({ id: user.id })
          .update({
            balancePaisa: balanceAfter,
            updatedAt: new Date().toISOString(),
          });

      if (!updatedUser) {
        throw new Error("BALANCE_UPDATE_FAILED");
      }

      await tx.orm.public.Transaction.create({
        userId: user.id,
        type: "WITHDRAWAL",
        amountPaisa,
        balanceBeforePaisa: balanceBefore,
        balanceAfterPaisa: balanceAfter,
        referenceId: withdrawal.id,
        withdrawalId: withdrawal.id,
        description: "Withdrawal request submitted",
      });

      return {
        withdrawal,
        planName: selected.plan.name,
        balancePaisa: balanceAfter,
      };
    });

    return NextResponse.json(
      {
        message: "Withdrawal request submitted successfully.",
        withdrawal: result.withdrawal,
        planName: result.planName,
        balancePaisa: result.balancePaisa,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (message === "ACCOUNT_DISABLED") {
      return NextResponse.json(
        { message: "Your account is disabled." },
        { status: 403 }
      );
    }

    if (message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { message: "Insufficient available balance." },
        { status: 400 }
      );
    }

    if (message.startsWith("USER_DAILY_LIMIT:")) {
      const remaining = Number(message.split(":")[1] ?? 0);

      return NextResponse.json(
        {
          message:
            `Your daily withdrawal limit has been reached. ` +
            `Remaining today: Rs ${(remaining / 100).toLocaleString("en-PK")}.`,
          remainingPaisa: remaining,
        },
        { status: 400 }
      );
    }

    if (message === "NO_ELIGIBLE_PLAN") {
      return NextResponse.json(
        {
          message:
            "You do not have an investment plan eligible for withdrawals.",
        },
        { status: 400 }
      );
    }

    if (message === "PLAN_WITHDRAWAL_LIMIT") {
      return NextResponse.json(
        {
          message:
            "No eligible investment plan has enough remaining withdrawal allowance for this amount.",
        },
        { status: 400 }
      );
    }

    console.error("Withdrawal POST error:", error);

    return NextResponse.json(
      { message: "Unable to submit withdrawal request." },
      { status: 500 }
    );
  }
}