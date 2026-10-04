import { db } from "@/src/prisma/db";

type ProfitFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

function getNextProfitDate(
  current: Date,
  frequency: ProfitFrequency
): Date {
  const next = new Date(current);

  if (frequency === "DAILY") {
    next.setUTCDate(next.getUTCDate() + 1);
  } else if (frequency === "WEEKLY") {
    next.setUTCDate(next.getUTCDate() + 7);
  } else {
    next.setUTCMonth(next.getUTCMonth() + 1);
  }

  return next;
}

function calculateProfit(
  amountPaisa: number,
  profitRateBps: number
): number {
  // 10000 BPS = 100%
  // 5000 BPS  = 50%
  // 2000 BPS  = 20%
  return Math.floor(
    (amountPaisa * profitRateBps) / 10_000
  );
}

function isDue(
  nextProfitAt: string,
  now: Date
): boolean {
  return new Date(nextProfitAt).getTime() <= now.getTime();
}

export async function processInvestmentProfits() {
  const now = new Date();

  /*
   * Get all investments.
   *
   * We filter the active/due investments in JavaScript
   * to remain compatible with the current Prisma 8 contract API.
   */
  const investments =
    await db.orm.public.Investment
      .include("user")
      .include("plan")
      .all();

  const activeInvestments = investments.filter(
    (investment) =>
      investment.status === "ACTIVE" &&
      isDue(investment.nextProfitAt, now)
  );

  let processed = 0;
  let totalProfitPaisa = 0;

  for (const investment of activeInvestments) {
    try {
      const result = await db.transaction(
        async (tx) => {
          /*
           * Re-read the investment inside the transaction.
           */
          const current =
            await tx.orm.public.Investment.first({
              id: investment.id,
            });

          if (!current) {
            return {
              processed: false,
              profitPaisa: 0,
              periods: 0,
            };
          }

          if (current.status !== "ACTIVE") {
            return {
              processed: false,
              profitPaisa: 0,
              periods: 0,
            };
          }

          /*
           * If another process already moved the nextProfitAt
           * into the future, don't process it again.
           */
          if (!isDue(current.nextProfitAt, now)) {
            return {
              processed: false,
              profitPaisa: 0,
              periods: 0,
            };
          }

          const user =
            await tx.orm.public.User.first({
              id: current.userId,
            });

          if (!user) {
            throw new Error("USER_NOT_FOUND");
          }

          const endDate = new Date(current.endDate);

          let nextProfitAt =
            new Date(current.nextProfitAt);

          let earnedProfit =
            current.earnedProfitPaisa;

          let processedProfit = 0;
          let processedPeriods = 0;

          /*
           * Process every overdue profit cycle.
           *
           * Example:
           * DAILY + cron unavailable for 3 days
           * => 3 daily profit cycles are processed.
           */
          while (
            nextProfitAt.getTime() <= now.getTime() &&
            nextProfitAt.getTime() <= endDate.getTime()
          ) {
            /*
             * IMPORTANT:
             *
             * Use the profitRateBps stored on the investment.
             * This is the rate that was locked when the investment
             * was created.
             */
            const profitPaisa = calculateProfit(
              current.amountPaisa,
              current.profitRateBps
            );

            if (profitPaisa > 0) {
              processedProfit += profitPaisa;
              earnedProfit += profitPaisa;
            }

            processedPeriods++;

            /*
             * Move to the next profit cycle.
             */
            nextProfitAt = getNextProfitDate(
              nextProfitAt,
              current.frequency
            );
          }

          if (processedPeriods === 0) {
            return {
              processed: false,
              profitPaisa: 0,
              periods: 0,
            };
          }

          /*
           * Calculate the user's new balance.
           */
          const balanceBefore = user.balancePaisa;

          const balanceAfter =
            balanceBefore + processedProfit;

          /*
           * Create one PROFIT transaction containing
           * the total profit processed during this run.
           */
          if (processedProfit > 0) {
            await tx.orm.public.Transaction.create({
              user: (transactionUser) =>
                transactionUser.connect({
                  id: user.id,
                }),

              type: "PROFIT",

              amountPaisa: processedProfit,

              balanceBeforePaisa: balanceBefore,

              balanceAfterPaisa: balanceAfter,

              referenceId: current.id,

              description:
                `Investment profit - ${current.frequency}`,

              investment: (selectedInvestment) =>
                selectedInvestment.connect({
                  id: current.id,
                }),
            });
          }

          /*
           * Update user balance and profit totals.
           */
          await tx.orm.public.User
            .where({
              id: user.id,
            })
            .update({
              balancePaisa: balanceAfter,

              totalProfitPaisa:
                user.totalProfitPaisa +
                processedProfit,
            });

          /*
           * The investment is completed when there is
           * no future profit cycle remaining before its end date.
           */
          const completed =
            nextProfitAt.getTime() >
            endDate.getTime();

          /*
           * Update investment.
           */
          await tx.orm.public.Investment
            .where({
              id: current.id,
            })
            .update({
              earnedProfitPaisa: earnedProfit,

              nextProfitAt:
                nextProfitAt.toISOString(),

              status: completed
                ? "COMPLETED"
                : "ACTIVE",
            });

          return {
            processed: true,
            profitPaisa: processedProfit,
            periods: processedPeriods,
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
    checked: activeInvestments.length,
    processedAt: now.toISOString(),
  };
}
