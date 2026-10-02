import { db } from "@/src/prisma/db";

type ProfitFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

function getNextProfitDate(
  current: Date,
  frequency: ProfitFrequency
) {
  const next = new Date(current);

  if (frequency === "DAILY") {
    next.setUTCDate(
      next.getUTCDate() + 1
    );
  } else if (frequency === "WEEKLY") {
    next.setUTCDate(
      next.getUTCDate() + 7
    );
  } else {
    next.setUTCMonth(
      next.getUTCMonth() + 1
    );
  }

  return next;
}

function calculateProfit(
  amountPaisa: number,
  profitRateBps: number
) {
  return Math.floor(
    (amountPaisa * profitRateBps) /
      10_000
  );
}

function isDue(
  nextProfitAt: string,
  now: Date
) {
  return (
    new Date(nextProfitAt).getTime() <=
    now.getTime()
  );
}

export async function processInvestmentProfits() {
  const now = new Date();

  /*
   * Get all active investments.
   *
   * We filter by date in JavaScript so this remains
   * compatible with the current Prisma 8 contract API.
   */

  const investments =
    await db.orm.public.Investment
      .include("user")
      .include("plan")
      .all();

  const activeInvestments =
    investments.filter(
      (investment) =>
        investment.status ===
          "ACTIVE" &&
        isDue(
          investment.nextProfitAt,
          now
        )
    );

  let processed = 0;
  let totalProfitPaisa = 0;

  for (const investment of activeInvestments) {
    try {
      /*
       * Process one investment inside a transaction.
       */

      const result =
        await db.transaction(
          async (tx) => {
            /*
             * Re-read the investment.
             *
             * This prevents processing an investment that
             * has already been completed/cancelled.
             */

            const current =
              await tx.orm.public.Investment.first(
                {
                  id: investment.id,
                }
              );

            if (!current) {
              return {
                processed: false,
                profitPaisa: 0,
              };
            }

            if (
              current.status !==
              "ACTIVE"
            ) {
              return {
                processed: false,
                profitPaisa: 0,
              };
            }

            /*
             * Get the user.
             */

            const user =
              await tx.orm.public.User.first(
                {
                  id: current.userId,
                }
              );

            if (!user) {
              throw new Error(
                "USER_NOT_FOUND"
              );
            }

            let nextProfitAt =
              new Date(
                current.nextProfitAt
              );

            let earnedProfit =
              current.earnedProfitPaisa;

            let processedPeriods = 0;
            let processedProfit = 0;

            /*
             * Catch up all missed periods.
             *
             * Example:
             *
             * Cron was offline for 3 days.
             * When it runs again, it can process the
             * 3 overdue daily profit periods.
             */

            while (
              nextProfitAt.getTime() <=
                now.getTime() &&
              nextProfitAt.getTime() <=
                new Date(
                  current.endDate
                ).getTime()
            ) {
              const profitPaisa =
                calculateProfit(
                  current.amountPaisa,
                  current.profitRateBps
                );

              /*
               * Zero-profit plans do not generate
               * transaction records.
               */

              if (
                profitPaisa > 0
              ) {
                const balanceBefore =
                  user.balancePaisa +
                  processedProfit;

                const balanceAfter =
                  balanceBefore +
                  profitPaisa;

                /*
                 * Create PROFIT transaction.
                 */

                await tx.orm.public.Transaction.create(
                  {
                    user: (
                      transactionUser
                    ) =>
                      transactionUser.connect(
                        {
                          id: user.id,
                        }
                      ),

                    type: "PROFIT",

                    amountPaisa:
                      profitPaisa,

                    balanceBeforePaisa:
                      balanceBefore,

                    balanceAfterPaisa:
                      balanceAfter,

                    referenceId:
                      current.id,

                    description:
                      `Investment profit - ${current.frequency}`,

                    investment: (
                      selectedInvestment
                    ) =>
                      selectedInvestment.connect(
                        {
                          id: current.id,
                        }
                      ),
                  }
                );

                processedProfit +=
                  profitPaisa;

                earnedProfit +=
                  profitPaisa;
              }

              processedPeriods++;

              /*
               * Move to the next period.
               */

              nextProfitAt =
                getNextProfitDate(
                  nextProfitAt,
                  current.frequency
                );
            }

            /*
             * Nothing was actually due.
             */

            if (
              processedPeriods === 0
            ) {
              return {
                processed: false,
                profitPaisa: 0,
              };
            }

            /*
             * Calculate new balance.
             */

            const newBalance =
              user.balancePaisa +
              processedProfit;

            /*
             * Determine whether investment has ended.
             */

            const endDate =
              new Date(
                current.endDate
              );

            const completed =
              nextProfitAt.getTime() >
              endDate.getTime();

            /*
             * Update user.
             */

            await tx.orm.public.User
              .where({
                id: user.id,
              })
              .update({
                balancePaisa:
                  newBalance,

                totalProfitPaisa:
                  user.totalProfitPaisa +
                  processedProfit,
              });

            /*
             * Update investment.
             */

            await tx.orm.public.Investment
              .where({
                id: current.id,
              })
              .update({
                earnedProfitPaisa:
                  earnedProfit,

                nextProfitAt:
                  nextProfitAt.toISOString(),

                status: completed
                  ? "COMPLETED"
                  : "ACTIVE",
              });

            return {
              processed: true,
              profitPaisa:
                processedProfit,
              periods:
                processedPeriods,
              completed,
            };
          }
        );

      if (result.processed) {
        processed++;

        totalProfitPaisa +=
          result.profitPaisa;
      }
    } catch (error) {
      console.error(
        `Investment profit processing failed for ${investment.id}:`,
        error
      );
    }
  }

  return {
    processed,
    totalProfitPaisa,
    checked:
      activeInvestments.length,
    processedAt:
      now.toISOString(),
  };
}