
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

const frequencies = ["DAILY", "WEEKLY", "MONTHLY"] as const;

function validPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function validOptionalLimit(value: unknown): value is number | null {
  return value === null || validPositiveInteger(value);
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const plans = await db.orm.public.InvestmentPlan
      .orderBy((plan) => plan.createdAt.desc())
      .all();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Admin investment plans GET error:", error);

    return NextResponse.json(
      { message: "Unable to load investment plans." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const minAmountPaisa = body.minAmountPaisa;
    const maxAmountPaisa = body.maxAmountPaisa;
    const profitRateBps = body.profitRateBps;
    const referralBonusBps = body.referralBonusBps;
    const durationDays = body.durationDays;
    const frequency = body.frequency;

    const customWithdrawalLimitsEnabled =
      body.customWithdrawalLimitsEnabled === true;

    const dailyWithdrawalLimitPaisa =
      body.dailyWithdrawalLimitPaisa ?? null;

    const lifetimeWithdrawalLimitPaisa =
      body.lifetimeWithdrawalLimitPaisa ?? null;

    if (!name) {
      return NextResponse.json(
        { message: "Plan name is required." },
        { status: 400 }
      );
    }

    if (
      !validPositiveInteger(minAmountPaisa) ||
      !validPositiveInteger(maxAmountPaisa) ||
      minAmountPaisa > maxAmountPaisa
    ) {
      return NextResponse.json(
        { message: "Enter valid minimum and maximum plan amounts." },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(profitRateBps) ||
      profitRateBps < 0 ||
      !Number.isSafeInteger(referralBonusBps) ||
      referralBonusBps < 0
    ) {
      return NextResponse.json(
        { message: "Profit and referral rates must be valid non-negative integers." },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(durationDays) ||
      durationDays <= 0
    ) {
      return NextResponse.json(
        { message: "Duration must be a positive number of days." },
        { status: 400 }
      );
    }

    if (!frequencies.includes(frequency)) {
      return NextResponse.json(
        { message: "Select a valid profit frequency." },
        { status: 400 }
      );
    }

    if (
      !validOptionalLimit(dailyWithdrawalLimitPaisa) ||
      !validOptionalLimit(lifetimeWithdrawalLimitPaisa)
    ) {
      return NextResponse.json(
        {
          message:
            "Withdrawal limits must be positive amounts in paisa or null to inherit global defaults.",
        },
        { status: 400 }
      );
    }

    const plan = await db.orm.public.InvestmentPlan.create({
      name,
      minAmountPaisa,
      maxAmountPaisa,
      profitRateBps,
      referralBonusBps,
      frequency,
      durationDays,
      isActive: body.isActive !== false,
      customWithdrawalLimitsEnabled,
      dailyWithdrawalLimitPaisa,
      lifetimeWithdrawalLimitPaisa,
    });

    return NextResponse.json(
      {
        message: "Investment plan created successfully.",
        plan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin investment plans POST error:", error);

    return NextResponse.json(
      { message: "Unable to create investment plan." },
      { status: 500 }
    );
  }
}