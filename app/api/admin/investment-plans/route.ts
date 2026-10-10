import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

function optionalPaisa(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0);
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const plans = await db.orm.public.InvestmentPlan.orderBy((plan) => plan.createdAt.desc()).all();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Admin investment plans GET error:", error);
    return NextResponse.json({ message: "Unable to load investment plans." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const { minAmountPaisa, maxAmountPaisa, profitRateBps, referralBonusBps, frequency, durationDays } = body;
    const minWithdrawalPaisa = body.minWithdrawalPaisa === undefined ? null : body.minWithdrawalPaisa;
    const dailyWithdrawalLimitPaisa = body.dailyWithdrawalLimitPaisa === undefined ? null : body.dailyWithdrawalLimitPaisa;
    const lifetimeWithdrawalLimitPaisa = body.lifetimeWithdrawalLimitPaisa === undefined ? null : body.lifetimeWithdrawalLimitPaisa;

    if (!name) return NextResponse.json({ message: "Plan name is required." }, { status: 400 });
    if (!Number.isSafeInteger(minAmountPaisa) || minAmountPaisa <= 0 || !Number.isSafeInteger(maxAmountPaisa) || maxAmountPaisa < minAmountPaisa) {
      return NextResponse.json({ message: "Enter valid minimum and maximum investment amounts." }, { status: 400 });
    }
    if (!Number.isSafeInteger(profitRateBps) || profitRateBps < 0 || !Number.isSafeInteger(referralBonusBps) || referralBonusBps < 0) {
      return NextResponse.json({ message: "Profit and referral rates must be valid percentages." }, { status: 400 });
    }
    if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency) || !Number.isSafeInteger(durationDays) || durationDays <= 0) {
      return NextResponse.json({ message: "Choose a valid frequency and duration." }, { status: 400 });
    }
    if (!optionalPaisa(minWithdrawalPaisa) || !optionalPaisa(dailyWithdrawalLimitPaisa) || !optionalPaisa(lifetimeWithdrawalLimitPaisa)) {
      return NextResponse.json({ message: "Minimum, daily, and lifetime withdrawal limits must be positive amounts or null." }, { status: 400 });
    }

    const plan = await db.orm.public.InvestmentPlan.create({
      name, minAmountPaisa, maxAmountPaisa, profitRateBps, referralBonusBps,
      frequency, durationDays,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      minWithdrawalPaisa,
      customWithdrawalLimitsEnabled: Boolean(body.customWithdrawalLimitsEnabled),
      dailyWithdrawalLimitPaisa,
      lifetimeWithdrawalLimitPaisa,
    });
    return NextResponse.json({ message: "Investment plan created successfully.", plan }, { status: 201 });
  } catch (error) {
    console.error("Admin investment plans POST error:", error);
    return NextResponse.json({ message: "Unable to create investment plan." }, { status: 500 });
  }
}
