import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";
import { createReferralCommissions } from "@/src/lib/referrals";

type ProfitFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

type InvestmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

function addDays(
  date: Date,
  days: number
) {
  const result = new Date(date);

  result.setUTCDate(
    result.getUTCDate() + days
  );

  return result;
}

function getNextProfitDate(
  start: Date,
  frequency: ProfitFrequency
) {
  const date = new Date(start);

  if (frequency === "DAILY") {
    date.setUTCDate(
      date.getUTCDate() + 1
    );
  } else if (frequency === "WEEKLY") {
    date.setUTCDate(
      date.getUTCDate() + 7
    );
  } else {
    date.setUTCMonth(
      date.getUTCMonth() + 1
    );
  }

  return date;
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
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
      {
        status: 500,
      }
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
      userId,
      planId,
      amountPaisa,
      startDate,
      status,
    } = body;

    /*
     * ----------------------------------------------------------
     * Validate user
     * ----------------------------------------------------------
     */

    if (
      typeof userId !== "string" ||
      !userId
    ) {
      return NextResponse.json(
        {
          message: "User is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * Validate plan
     * ----------------------------------------------------------
     */

    if (
      typeof planId !== "string" ||
      !planId
    ) {
      return NextResponse.json(
        {
          message: "Plan is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * Validate amount
     * ----------------------------------------------------------
     */

    if (
      !Number.isInteger(amountPaisa) ||
      amountPaisa <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Investment amount must be positive.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * Find user
     * ----------------------------------------------------------
     */

    const user =
      await db.orm.public.User.first({
        id: userId,
      });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * Find plan
     * ----------------------------------------------------------
     */

    const plan =
      await db.orm.public.InvestmentPlan.first({
        id: planId,
      });

    if (!plan) {
      return NextResponse.json(
        {
          message:
            "Investment plan not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!plan.isActive) {
      return NextResponse.json(
        {
          message:
            "Investment plan is inactive.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * Validate amount against plan
     * ----------------------------------------------------------
     */

    if (
      amountPaisa <
        plan.minAmountPaisa ||
      amountPaisa >
        plan.maxAmountPaisa
    ) {
      return NextResponse.json(
        {
          message:
            "Investment amount is outside the plan limits.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * Start date
     * ----------------------------------------------------------
     */

    const start = startDate
      ? new Date(startDate)
      : new Date();

    if (
      Number.isNaN(start.getTime())
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid start date.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * Investment dates
     * ----------------------------------------------------------
     */

    const end = addDays(
      start,
      plan.durationDays
    );

    const nextProfit =
      getNextProfitDate(
        start,
        plan.frequency
      );

    /*
     * ----------------------------------------------------------
     * Validate requested status
     * ----------------------------------------------------------
     */

    const investmentStatus: InvestmentStatus =
      status === "COMPLETED" ||
      status === "CANCELLED"
        ? status
        : "ACTIVE";

    /*
     * ----------------------------------------------------------
     * Prevent duplicate active investment
     * ----------------------------------------------------------
     */

    if (
      investmentStatus === "ACTIVE"
    ) {
      const existingInvestment =
        await db.orm.public.Investment.first(
          {
            userId,
            planId,
            status: "ACTIVE",
          }
        );

      if (existingInvestment) {
        return NextResponse.json(
          {
            message:
              "User already has an active investment in this plan.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
     * ----------------------------------------------------------
     * Create investment
     * ----------------------------------------------------------
     */

    const investment =
  await db.transaction(
    async (tx) => {
      const createdInvestment =
        await tx.orm.public.Investment.create(
          {
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

            earnedProfitPaisa: 0,

            status:
              investmentStatus,
          }
        );

      /*
       * Update user's total investment.
       */

      await tx.orm.public.User
        .where({ id: userId })
        .update({
          totalInvestmentPaisa:
            user.totalInvestmentPaisa +
            createdInvestment.amountPaisa,
        });

      /*
       * Referral commission is generated
       * only for active investments.
       */

      if (
        investmentStatus === "ACTIVE"
      ) {
        await createReferralCommissions(
          tx,
          userId,
          createdInvestment.id,
          createdInvestment.amountPaisa
        );
      }

      return createdInvestment;
    }
  );

    return NextResponse.json(
      {
        message:
          "Investment created successfully.",

        investment,
      },
      {
        status: 201,
      }
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
      {
        status: 500,
      }
    );
  }
}