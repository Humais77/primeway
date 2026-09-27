import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const plans = await db.orm.public.InvestmentPlan
  .where({
    isActive: true,
  })
  .orderBy((plan) => plan.createdAt.asc())
  .all();

    return NextResponse.json({
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        minAmountPaisa: plan.minAmountPaisa,
        maxAmountPaisa: plan.maxAmountPaisa,
        profitRateBps: plan.profitRateBps,
        referralBonusBps: plan.referralBonusBps,
        frequency: plan.frequency,
        durationDays: plan.durationDays,
        isActive: plan.isActive,
      })),
    });
  } catch (error) {
    console.error(
      "Investment plans GET error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load investment plans.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
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
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message: "Plan name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(minAmountPaisa) ||
      minAmountPaisa <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Minimum investment must be a positive integer.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(maxAmountPaisa) ||
      maxAmountPaisa < minAmountPaisa
    ) {
      return NextResponse.json(
        {
          message:
            "Maximum investment must be greater than or equal to minimum investment.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(profitRateBps) ||
      profitRateBps < 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid profit rate.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(referralBonusBps) ||
      referralBonusBps < 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid referral bonus.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !["DAILY", "WEEKLY", "MONTHLY"].includes(
        frequency
      )
    ) {
      return NextResponse.json(
        {
          message: "Invalid profit frequency.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(durationDays) ||
      durationDays <= 0
    ) {
      return NextResponse.json(
        {
          message: "Duration must be positive.",
        },
        {
          status: 400,
        }
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
      });

    return NextResponse.json(
      {
        message: "Investment plan created successfully.",
        plan,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Investment plans POST error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to create investment plan.",
      },
      {
        status: 500,
      }
    );
  }
}