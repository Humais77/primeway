import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

function addDays(
  date: Date,
  days: number
) {
  const result = new Date(date);
  result.setDate(
    result.getDate() + days
  );
  return result;
}

function getNextProfitDate(
  start: Date,
  frequency: "DAILY" | "WEEKLY" | "MONTHLY"
) {
  const date = new Date(start);

  if (frequency === "DAILY") {
    date.setDate(date.getDate() + 1);
  } else if (frequency === "WEEKLY") {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  return date;
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

    const investments =
      await db.orm.public.Investment
        .include("user")
        .include("plan")
        .orderBy((investment) =>
          investment.createdAt.desc()
        )
        .all();

    return NextResponse.json({
      investments,
    });
  } catch (error) {
    console.error(
      "Admin investments GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load investments.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
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
      userId,
      planId,
      amountPaisa,
      startDate,
      status,
    } = body;

    if (
      typeof userId !== "string" ||
      !userId
    ) {
      return NextResponse.json(
        { message: "User is required." },
        { status: 400 }
      );
    }

    if (
      typeof planId !== "string" ||
      !planId
    ) {
      return NextResponse.json(
        { message: "Plan is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(amountPaisa) ||
      amountPaisa <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Investment amount must be positive.",
        },
        { status: 400 }
      );
    }

    const user =
      await db.orm.public.User.first({
        id: userId,
      });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const plan =
      await db.orm.public.InvestmentPlan.first({
        id: planId,
      });

    if (!plan) {
      return NextResponse.json(
        { message: "Investment plan not found." },
        { status: 404 }
      );
    }

    if (
      amountPaisa < plan.minAmountPaisa ||
      amountPaisa > plan.maxAmountPaisa
    ) {
      return NextResponse.json(
        {
          message:
            "Investment amount is outside the plan limits.",
        },
        { status: 400 }
      );
    }

    const start =
      startDate
        ? new Date(startDate)
        : new Date();

    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { message: "Invalid start date." },
        { status: 400 }
      );
    }

    const end = addDays(
      start,
      plan.durationDays
    );

    const nextProfit =
      getNextProfitDate(
        start,
        plan.frequency
      );

    const investment =
      await db.orm.public.Investment.create({
        userId,
        planId,
        amountPaisa,
        profitRateBps:
          plan.profitRateBps,
        frequency:
          plan.frequency,
        startDate:
          start.toISOString(),
        endDate:
          end.toISOString(),
        nextProfitAt:
          nextProfit.toISOString(),
        status:
          status ?? "ACTIVE",
      });

    return NextResponse.json(
      {
        message:
          "Investment created successfully.",
        investment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin investments POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to create investment.",
      },
      { status: 500 }
    );
  }
}