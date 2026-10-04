import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";
import { createReferralCommissions } from "@/src/lib/referrals";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

type ProfitFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

function addDays(date: Date, days: number) {
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
      const reason =
        typeof body.reason === "string"
          ? body.reason.trim()
          : "";

      const updated =
        await db.transaction(
          async (tx) => {
            const currentDeposit =
              await tx.orm.public.Deposit.first({
                id,
              });

            if (!currentDeposit) {
              throw new Error(
                "DEPOSIT_NOT_FOUND"
              );
            }

            if (
              currentDeposit.status !==
              "PENDING"
            ) {
              throw new Error(
                "DEPOSIT_ALREADY_REVIEWED"
              );
            }

            /*
             * Update deposit
             */
            const updatedDeposit =
              await tx.orm.public.Deposit
                .where({ id })
                .update({
                  status: "REJECTED",
                  rejectionReason:
                    reason || null,
                  reviewedBy:
                    admin.userId,
                  reviewedAt:
                    new Date().toISOString(),
                });

            /*
             * Create notification
             */
            await tx.orm.public.Notification.create(
              {
                user: (user) =>
                  user.connect({
                    id: currentDeposit.userId,
                  }),

                title: "Deposit Rejected",

                message: reason
                  ? `Your deposit of Rs ${(currentDeposit.amountPaisa / 100).toLocaleString(
                      "en-PK",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )} was rejected. Reason: ${reason}`
                  : `Your deposit of Rs ${(currentDeposit.amountPaisa / 100).toLocaleString(
                      "en-PK",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )} was rejected.`,

                type: "WARNING",
              }
            );

            return updatedDeposit;
          }
        );

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
          throw new Error(
            "USER_NOT_FOUND"
          );
        }

        /*
         * --------------------------------------------------------
         * 2. Find investment plan
         * --------------------------------------------------------
         */

        const plan =
          await tx.orm.public.InvestmentPlan.first(
            {
              id: deposit.planId!,
            }
          );

        if (!plan) {
          throw new Error(
            "PLAN_NOT_FOUND"
          );
        }

        /*
         * --------------------------------------------------------
         * 3. Make sure plan is active
         * --------------------------------------------------------
         */

        if (!plan.isActive) {
          throw new Error(
            "PLAN_INACTIVE"
          );
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
         * 5. Validate investment amount
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
              reviewedBy:
                admin.userId,
              reviewedAt:
                new Date().toISOString(),
            });

        /*
         * --------------------------------------------------------
         * IMPORTANT ACCOUNTING RULE
         *
         * Deposit principal is immediately allocated
         * to the investment.
         *
         * Therefore balancePaisa does not increase.
         * --------------------------------------------------------
         */

        const balanceBefore =
          user.balancePaisa;

        const balanceAfter =
          user.balancePaisa;

        /*
         * --------------------------------------------------------
         * 8. Create DEPOSIT transaction
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

              referenceId:
                deposit.id,

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
              userId:
                deposit.userId,

              planId:
                plan.id,

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
         * 10. Update total investment
         * --------------------------------------------------------
         */

        await tx.orm.public.User
          .where({
            id: user.id,
          })
          .update({
            totalInvestmentPaisa:
              user.totalInvestmentPaisa +
              investment.amountPaisa,
          });

        /*
         * --------------------------------------------------------
         * 11. Create referral commissions
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
         * 12. Create INVESTMENT transaction
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

        /*
         * --------------------------------------------------------
         * 13. Deposit notification
         * --------------------------------------------------------
         */

        await tx.orm.public.Notification.create(
          {
            user: (notificationUser) =>
              notificationUser.connect({
                id: user.id,
              }),

            title: "Deposit Approved",

            message:
              `Your deposit of Rs ${(deposit.amountPaisa / 100).toLocaleString(
                "en-PK",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )} has been approved and allocated to your ${plan.name} investment.`,

            type: "SUCCESS",
          }
        );

        /*
         * --------------------------------------------------------
         * 14. Transaction notification
         * --------------------------------------------------------
         */

        await tx.orm.public.Notification.create(
          {
            user: (notificationUser) =>
              notificationUser.connect({
                id: user.id,
              }),

            title: "Transaction Recorded",

            message:
              `Investment transaction of Rs ${(investment.amountPaisa / 100).toLocaleString(
                "en-PK",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )} has been recorded for ${plan.name}.`,

            type: "INFO",
          }
        );

        /*
         * --------------------------------------------------------
         * 15. Investment started notification
         * --------------------------------------------------------
         */

        await tx.orm.public.Notification.create(
          {
            user: (notificationUser) =>
              notificationUser.connect({
                id: user.id,
              }),

            title: "Investment Started",

            message:
              `Your ${plan.name} investment is now active. Your next profit is scheduled according to the ${plan.frequency.toLowerCase()} plan.`,

            type: "SUCCESS",
          }
        );

        return {
          deposit:
            updatedDeposit,

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

      if (
        error.message ===
        "DEPOSIT_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            message:
              "Deposit not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        error.message ===
        "DEPOSIT_ALREADY_REVIEWED"
      ) {
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
