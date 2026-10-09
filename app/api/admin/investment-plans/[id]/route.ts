
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = {
  params: Promise<{ id: string }>;
};

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

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const plan = await db.orm.public.InvestmentPlan.first({ id });

    if (!plan) {
      return NextResponse.json(
        { message: "Investment plan not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Investment plan GET error:", error);

    return NextResponse.json(
      { message: "Unable to load investment plan." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await db.orm.public.InvestmentPlan.first({ id });

    if (!existing) {
      return NextResponse.json(
        { message: "Investment plan not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { message: "Plan name cannot be empty." },
          { status: 400 }
        );
      }
      update.name = body.name.trim();
    }

    for (const field of [
      "minAmountPaisa",
      "maxAmountPaisa",
      "durationDays",
    ] as const) {
      if (body[field] !== undefined) {
        if (!validPositiveInteger(body[field])) {
          return NextResponse.json(
            { message: `${field} must be a positive integer.` },
            { status: 400 }
          );
        }
        update[field] = body[field];
      }
    }

    for (const field of [
      "profitRateBps",
      "referralBonusBps",
    ] as const) {
      if (body[field] !== undefined) {
        if (
          !Number.isSafeInteger(body[field]) ||
          body[field] < 0
        ) {
          return NextResponse.json(
            { message: `${field} must be a non-negative integer.` },
            { status: 400 }
          );
        }
        update[field] = body[field];
      }
    }

    if (body.frequency !== undefined) {
      if (!frequencies.includes(body.frequency)) {
        return NextResponse.json(
          { message: "Select a valid profit frequency." },
          { status: 400 }
        );
      }
      update.frequency = body.frequency;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { message: "isActive must be true or false." },
          { status: 400 }
        );
      }
      update.isActive = body.isActive;
    }

    if (body.customWithdrawalLimitsEnabled !== undefined) {
      if (typeof body.customWithdrawalLimitsEnabled !== "boolean") {
        return NextResponse.json(
          {
            message:
              "customWithdrawalLimitsEnabled must be true or false.",
          },
          { status: 400 }
        );
      }
      update.customWithdrawalLimitsEnabled =
        body.customWithdrawalLimitsEnabled;
    }

    for (const field of [
      "dailyWithdrawalLimitPaisa",
      "lifetimeWithdrawalLimitPaisa",
    ] as const) {
      if (body[field] !== undefined) {
        if (!validOptionalLimit(body[field])) {
          return NextResponse.json(
            {
              message:
                `${field} must be a positive amount in paisa or null to inherit the global default.`,
            },
            { status: 400 }
          );
        }
        update[field] = body[field];
      }
    }

    const minAmount =
      (update.minAmountPaisa as number | undefined) ??
      existing.minAmountPaisa;
    const maxAmount =
      (update.maxAmountPaisa as number | undefined) ??
      existing.maxAmountPaisa;

    if (minAmount > maxAmount) {
      return NextResponse.json(
        { message: "Minimum plan amount cannot exceed maximum amount." },
        { status: 400 }
      );
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided to update." },
        { status: 400 }
      );
    }

    update.updatedAt = new Date().toISOString();

    const plan = await db.orm.public.InvestmentPlan
      .where({ id })
      .update(update);

    return NextResponse.json({
      message: "Investment plan updated successfully.",
      plan,
    });
  } catch (error) {
    console.error("Investment plan PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to update investment plan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await db.orm.public.InvestmentPlan.first({ id });

    if (!existing) {
      return NextResponse.json(
        { message: "Investment plan not found." },
        { status: 404 }
      );
    }

    await db.orm.public.InvestmentPlan.where({ id }).delete();

    return NextResponse.json({
      message: "Investment plan deleted successfully.",
    });
  } catch (error) {
    console.error("Investment plan DELETE error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to delete this plan. It may already be referenced by investments, deposits, or withdrawals.",
      },
      { status: 409 }
    );
  }
}