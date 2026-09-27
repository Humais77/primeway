import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const frequencies = ["DAILY", "WEEKLY", "MONTHLY"] as const;

export async function GET(
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

    const plan =
      await db.orm.public.InvestmentPlan.first({
        id,
      });

    if (!plan) {
      return NextResponse.json(
        { message: "Investment plan not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Plan GET error:", error);

    return NextResponse.json(
      { message: "Unable to load plan." },
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

    const existing =
      await db.orm.public.InvestmentPlan.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        { message: "Investment plan not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      name,
      minAmountPaisa,
      maxAmountPaisa,
      profitRateBps,
      referralBonusBps,
      frequency,
      durationDays,
      isActive,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        { message: "Plan name is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(minAmountPaisa) ||
      minAmountPaisa <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid minimum investment." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(maxAmountPaisa) ||
      maxAmountPaisa < minAmountPaisa
    ) {
      return NextResponse.json(
        { message: "Invalid maximum investment." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(profitRateBps) ||
      profitRateBps < 0
    ) {
      return NextResponse.json(
        { message: "Invalid profit rate." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(referralBonusBps) ||
      referralBonusBps < 0
    ) {
      return NextResponse.json(
        { message: "Invalid referral bonus." },
        { status: 400 }
      );
    }

    if (!frequencies.includes(frequency)) {
      return NextResponse.json(
        { message: "Invalid frequency." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(durationDays) ||
      durationDays <= 0
    ) {
      return NextResponse.json(
        { message: "Invalid duration." },
        { status: 400 }
      );
    }

    const plan =
      await db.orm.public.InvestmentPlan
        .where({ id })
        .update({
          name: name.trim(),
          minAmountPaisa,
          maxAmountPaisa,
          profitRateBps,
          referralBonusBps,
          frequency,
          durationDays,
          isActive:
            typeof isActive === "boolean"
              ? isActive
              : existing.isActive,
        });

    return NextResponse.json({
      message: "Investment plan updated successfully.",
      plan,
    });
  } catch (error) {
    console.error("Plan PATCH error:", error);

    return NextResponse.json(
      {
        message: "Unable to update investment plan.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const plan =
      await db.orm.public.InvestmentPlan.first({
        id,
      });

    if (!plan) {
      return NextResponse.json(
        { message: "Investment plan not found." },
        { status: 404 }
      );
    }

    await db.orm.public.InvestmentPlan
      .where({ id })
      .delete();

    return NextResponse.json({
      message: "Investment plan deleted successfully.",
    });
  } catch (error) {
    console.error("Plan DELETE error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to delete investment plan. It may have existing investments.",
      },
      { status: 500 }
    );
  }
}