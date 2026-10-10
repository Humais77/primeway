import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = { params: Promise<{ id: string }> };
function optionalPaisa(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0);
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const plan = await db.orm.public.InvestmentPlan.first({ id });
    if (!plan) return NextResponse.json({ message: "Investment plan not found." }, { status: 404 });
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Admin investment plan GET error:", error);
    return NextResponse.json({ message: "Unable to load investment plan." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const existing = await db.orm.public.InvestmentPlan.first({ id });
    if (!existing) return NextResponse.json({ message: "Investment plan not found." }, { status: 404 });
    const body = await request.json();

    // Allow status-only updates without requiring the full edit form.
    if (Object.keys(body).length === 1 && typeof body.isActive === "boolean") {
      const plan = await db.orm.public.InvestmentPlan.where({ id }).update({ isActive: body.isActive, updatedAt: new Date().toISOString() });
      return NextResponse.json({ message: "Investment plan updated successfully.", plan });
    }

    const name = typeof body.name === "string" ? body.name.trim() : existing.name;
    const minAmountPaisa = body.minAmountPaisa ?? existing.minAmountPaisa;
    const maxAmountPaisa = body.maxAmountPaisa ?? existing.maxAmountPaisa;
    const profitRateBps = body.profitRateBps ?? existing.profitRateBps;
    const referralBonusBps = body.referralBonusBps ?? existing.referralBonusBps;
    const frequency = body.frequency ?? existing.frequency;
    const durationDays = body.durationDays ?? existing.durationDays;
    const minWithdrawalPaisa = body.minWithdrawalPaisa === undefined ? existing.minWithdrawalPaisa : body.minWithdrawalPaisa;
    const dailyWithdrawalLimitPaisa = body.dailyWithdrawalLimitPaisa === undefined ? existing.dailyWithdrawalLimitPaisa : body.dailyWithdrawalLimitPaisa;
    const lifetimeWithdrawalLimitPaisa = body.lifetimeWithdrawalLimitPaisa === undefined ? existing.lifetimeWithdrawalLimitPaisa : body.lifetimeWithdrawalLimitPaisa;

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

    const plan = await db.orm.public.InvestmentPlan.where({ id }).update({
      name, minAmountPaisa, maxAmountPaisa, profitRateBps, referralBonusBps,
      frequency, durationDays,
      isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
      minWithdrawalPaisa,
      customWithdrawalLimitsEnabled: typeof body.customWithdrawalLimitsEnabled === "boolean" ? body.customWithdrawalLimitsEnabled : existing.customWithdrawalLimitsEnabled,
      dailyWithdrawalLimitPaisa,
      lifetimeWithdrawalLimitPaisa,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ message: "Investment plan updated successfully.", plan });
  } catch (error) {
    console.error("Admin investment plan PATCH error:", error);
    return NextResponse.json({ message: "Unable to update investment plan." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    const plan = await db.orm.public.InvestmentPlan.first({ id });
    if (!plan) return NextResponse.json({ message: "Investment plan not found." }, { status: 404 });
    const referenced = await db.orm.public.Investment.first({ planId: id });
    const hasDeposit = await db.orm.public.Deposit.first({ planId: id });
    const hasWithdrawal = await db.orm.public.Withdrawal.first({ planId: id });
    if (referenced || hasDeposit || hasWithdrawal) {
      return NextResponse.json({ message: "This plan has existing records and cannot be deleted. Deactivate it instead." }, { status: 409 });
    }
    await db.orm.public.InvestmentPlan.where({ id }).delete();
    return NextResponse.json({ message: "Investment plan deleted successfully." });
  } catch (error) {
    console.error("Admin investment plan DELETE error:", error);
    return NextResponse.json({ message: "Unable to delete investment plan." }, { status: 500 });
  }
}
