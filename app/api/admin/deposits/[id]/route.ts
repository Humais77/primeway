import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";
import { createReferralCommissions } from "@/src/lib/referrals";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

type ProfitFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

function getNextProfitDate(
  start: Date,
  frequency: ProfitFrequency
) {
  const date = new Date(start);

  if (frequency === "DAILY") {
    date.setUTCDate(date.getUTCDate() + 1);
  } else if (frequency === "WEEKLY") {
    date.setUTCDate(date.getUTCDate() + 7);
  } else {
    date.setUTCMonth(date.getUTCMonth() + 1);
  }

  return date;
}

export async function PATCH(
  request: Request,
  { params }: Params
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

    const { id } = await params;
    const body = await request.json();

    const action = body.action;

    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return NextResponse.json(
        {
          message: "Invalid deposit action.",
        },
        {
          status: 400,
        }
      );
    }

    const deposit =
      await db.orm.public.Deposit.first({
        id,
      });

    if (!deposit) {
      return NextResponse.json(
        {
          message: "Deposit not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "This deposit has already been reviewed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * REJECT DEPOSIT
     * ============================================================
     */

    if (action === "REJECT") {
      const updated =
        await db.orm.public.Deposit
          .where({ id })
          .update({
            status: "REJECTED",
            rejectionReason:
              typeof body.reason === "string"
                ? body.reason.trim()
                : null,
            reviewedBy: admin.userId,
            reviewedAt:
              new Date().toISOString(),
          });

      return NextResponse.json({
        message:
          "Deposit rejected successfully.",
        deposit: updated,
      });
    }

    /*
     * ============================================================
     * APPROVE DEPOSIT
     * ============================================================
     */

    if (!deposit.planId) {
      return NextResponse.json(
        {
          message:
            "This deposit has no investment plan attached and cannot be approved.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await db.transaction(
      async (tx) => {
        /*
         * --------------------------------------------------------
         * 1. Find user
         * --------------------------------------------------------
         */

        const user =
          await tx.orm.public.User.first({
            id: deposit.userId,
          });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        /*
         * --------------------------------------------------------
         * 2. Find investment plan
         * --------------------------------------------------------
         */

        const plan =
          await tx.orm.public.InvestmentPlan.first({
            id: deposit.planId!,
          });

        if (!plan) {
          throw new Error("PLAN_NOT_FOUND");
        }

        /*
         * --------------------------------------------------------
         * 3. Make sure plan is active
         * --------------------------------------------------------
         */

        if (!plan.isActive) {
          throw new Error("PLAN_INACTIVE");
        }

        /*
         * --------------------------------------------------------
         * 4. Prevent duplicate active investment
         * --------------------------------------------------------
         */

        const existingInvestment =
          await tx.orm.public.Investment.first({
            userId: deposit.userId,
            planId: plan.id,
            status: "ACTIVE",
          });

        if (existingInvestment) {
          throw new Error(
            "INVESTMENT_ALREADY_EXISTS"
          );
        }

        /*
         * --------------------------------------------------------
         * 5. Validate amount against plan
         * --------------------------------------------------------
         */

        if (
          deposit.amountPaisa <
            plan.minAmountPaisa ||
          deposit.amountPaisa >
            plan.maxAmountPaisa
        ) {
          throw new Error(
            "INVALID_INVESTMENT_AMOUNT"
          );
        }

        /*
         * --------------------------------------------------------
         * 6. Investment dates
         *
         * All dates are stored as UTC ISO strings.
         * --------------------------------------------------------
         */

        const start = new Date();

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
         * --------------------------------------------------------
         * 7. Approve deposit
         * --------------------------------------------------------
         */

        const updatedDeposit =
          await tx.orm.public.Deposit
            .where({ id })
            .update({
              status: "APPROVED",
              reviewedBy: admin.userId,
              reviewedAt:
                new Date().toISOString(),
            });

        /*
         * --------------------------------------------------------
         * IMPORTANT ACCOUNTING RULE
         *
         * The deposit principal is invested.
         *
         * Therefore:
         *
         * balancePaisa DOES NOT increase here.
         *
         * Only future investment profits increase
         * balancePaisa.
         * --------------------------------------------------------
         */

        const balanceBefore =
          user.balancePaisa;

        const balanceAfter =
          user.balancePaisa;

        /*
         * --------------------------------------------------------
         * 8. Create DEPOSIT transaction
         *
         * This records the money received without making
         * the invested principal withdrawable.
         * --------------------------------------------------------
         */

        const depositTransaction =
          await tx.orm.public.Transaction.create(
            {
              user: (transactionUser) =>
                transactionUser.connect({
                  id: user.id,
                }),

              type: "DEPOSIT",

              amountPaisa:
                deposit.amountPaisa,

              balanceBeforePaisa:
                balanceBefore,

              balanceAfterPaisa:
                balanceAfter,

              referenceId: deposit.id,

              description:
                `Deposit approved and allocated to ${plan.name} investment - ${deposit.method}`,

              deposit: (selectedDeposit) =>
                selectedDeposit.connect({
                  id: deposit.id,
                }),
            }
          );

        /*
         * --------------------------------------------------------
         * 9. Create ACTIVE investment
         * --------------------------------------------------------
         */

        const investment =
          await tx.orm.public.Investment.create(
            {
              userId: deposit.userId,

              planId: plan.id,

              amountPaisa:
                deposit.amountPaisa,

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

              status: "ACTIVE",
            }
          );

        /*
         * --------------------------------------------------------
         * 10. Create referral commissions
         *
         * Referral commissions are generated once when the
         * investment becomes active.
         * --------------------------------------------------------
         */

        await createReferralCommissions(
          tx,
          deposit.userId,
          investment.id,
          investment.amountPaisa
        );

        /*
         * --------------------------------------------------------
         * 11. Create INVESTMENT transaction
         *
         * This records that the approved deposit was allocated
         * into the investment.
         * --------------------------------------------------------
         */

        const investmentTransaction =
          await tx.orm.public.Transaction.create(
            {
              user: (transactionUser) =>
                transactionUser.connect({
                  id: user.id,
                }),

              type: "INVESTMENT",

              amountPaisa:
                investment.amountPaisa,

              balanceBeforePaisa:
                balanceAfter,

              balanceAfterPaisa:
                balanceAfter,

              referenceId:
                investment.id,

              description:
                `Investment started - ${plan.name}`,

              investment: (
                selectedInvestment
              ) =>
                selectedInvestment.connect({
                  id: investment.id,
                }),
            }
          );

        return {
          deposit: updatedDeposit,
          depositTransaction,
          investmentTransaction,
          investment,
          balanceAfter,
        };
      }
    );

    return NextResponse.json({
      message:
        "Deposit approved and investment started successfully.",

      ...result,
    });
  } catch (error) {
    console.error(
      "Admin deposit PATCH error:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "USER_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            message:
              "Deposit user no longer exists.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        error.message ===
        "PLAN_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            message:
              "Investment plan no longer exists.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        error.message ===
        "PLAN_INACTIVE"
      ) {
        return NextResponse.json(
          {
            message:
              "This investment plan is no longer active.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        error.message ===
        "INVESTMENT_ALREADY_EXISTS"
      ) {
        return NextResponse.json(
          {
            message:
              "The user already has an active investment in this plan.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        error.message ===
        "INVALID_INVESTMENT_AMOUNT"
      ) {
        return NextResponse.json(
          {
            message:
              "The deposit amount is outside the investment plan limits.",
          },
          {
            status: 400,
          }
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "Unable to review deposit.",
      },
      {
        status: 500,
      }
    );
  }
}