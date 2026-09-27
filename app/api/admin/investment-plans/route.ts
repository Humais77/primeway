import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

const frequencies = ["DAILY", "WEEKLY", "MONTHLY"] as const;

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const plans =
      await db.orm.public.InvestmentPlan
        .orderBy((plan) => plan.createdAt.asc())
        .all();

    return NextResponse.json({
      plans,
    });
  } catch (error) {
    console.error("Admin plans GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load investment plans.",
      },
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
      await db.orm.public.InvestmentPlan.create({
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
            : true,
      });

    return NextResponse.json(
      {
        message: "Investment plan created successfully.",
        plan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin plans POST error:", error);

    return NextResponse.json(
      {
        message: "Unable to create investment plan.",
      },
      { status: 500 }
    );
  }
}