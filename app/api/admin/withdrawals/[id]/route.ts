
import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function formatPKR(amountPaisa: number) {
  return `Rs ${(amountPaisa / 100).toLocaleString(
    "en-PK",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const session = await getSession();

    if (
      !session ||
      session.role !== "ADMIN"
    ) {
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

    const status = body.status;

    if (
      status !== "APPROVED" &&
      status !== "REJECTED"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid withdrawal status.",
        },
        {
          status: 400,
        }
      );
    }

    const withdrawal =
      await db.orm.public.Withdrawal.first({
        id,
      });

    if (!withdrawal) {
      return NextResponse.json(
        {
          message:
            "Withdrawal not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      withdrawal.status !==
      "PENDING"
    ) {
      return NextResponse.json(
        {
          message:
            "This withdrawal has already been processed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * APPROVE WITHDRAWAL
     * ============================================================
     */

    if (status === "APPROVED") {
      const updated =
        await db.transaction(
          async (tx) => {
            /*
             * Re-read inside transaction
             */
            const current =
              await tx.orm.public.Withdrawal
                .first({ id });

            if (!current) {
              throw new Error(
                "WITHDRAWAL_NOT_FOUND"
              );
            }

            if (
              current.status !==
              "PENDING"
            ) {
              throw new Error(
                "WITHDRAWAL_ALREADY_PROCESSED"
              );
            }

            /*
             * Find user
             */
            const user =
              await tx.orm.public.User.first({
                id: current.userId,
              });

            if (!user) {
              throw new Error(
                "USER_NOT_FOUND"
              );
            }

            /*
             * The withdrawal amount was already
             * reserved/deducted when the user
             * submitted the withdrawal.
             *
             * Therefore we DO NOT deduct
             * balancePaisa again here.
             */

            const balanceBefore =
              user.balancePaisa;

            const balanceAfter =
              user.balancePaisa;

            /*
             * Update withdrawal totals
             */
            await tx.orm.public.User
              .where({
                id: user.id,
              })
              .update({
                totalWithdrawnPaisa:
                  user.totalWithdrawnPaisa +
                  current.amountPaisa,
              });

            /*
             * Update withdrawal status
             */
            const updatedWithdrawal =
              await tx.orm.public.Withdrawal
                .where({ id })
                .update({
                  status: "APPROVED",

                  reviewedBy:
                    session.userId,

                  reviewedAt:
                    new Date().toISOString(),
                });

            /*
             * Create WITHDRAWAL transaction
             *
             * Balance remains unchanged because
             * the amount was already reserved.
             */
            const transaction =
              await tx.orm.public.Transaction.create(
                {
                  user: (transactionUser) =>
                    transactionUser.connect({
                      id: user.id,
                    }),

                  type: "WITHDRAWAL",

                  amountPaisa:
                    current.amountPaisa,

                  balanceBeforePaisa:
                    balanceBefore,

                  balanceAfterPaisa:
                    balanceAfter,

                  referenceId:
                    current.id,

                  description:
                    `Withdrawal approved - ${current.method}`,

                  withdrawal: (
                    selectedWithdrawal
                  ) =>
                    selectedWithdrawal.connect({
                      id: current.id,
                    }),
                }
              );

            /*
             * Withdrawal notification
             */
            await tx.orm.public.Notification.create(
              {
                user: (notificationUser) =>
                  notificationUser.connect({
                    id: user.id,
                  }),

                title:
                  "Withdrawal Approved",

                message:
                  `Your withdrawal of ${formatPKR(
                    current.amountPaisa
                  )} has been approved and is being processed.`,

                type: "SUCCESS",
              }
            );

            /*
             * Transaction notification
             */
            await tx.orm.public.Notification.create(
              {
                user: (notificationUser) =>
                  notificationUser.connect({
                    id: user.id,
                  }),

                title:
                  "Transaction Recorded",

                message:
                  `Withdrawal transaction of ${formatPKR(
                    current.amountPaisa
                  )} has been recorded.`,

                type: "INFO",
              }
            );

            return {
              withdrawal:
                updatedWithdrawal,

              transaction,
            };
          }
        );

      return NextResponse.json({
        message:
          "Withdrawal approved successfully.",

        ...updated,
      });
    }

    /*
     * ============================================================
     * REJECT WITHDRAWAL
     * ============================================================
     */

    const reason =
      typeof body.rejectionReason ===
      "string"
        ? body.rejectionReason.trim()
        : "";

    if (!reason) {
      return NextResponse.json(
        {
          message:
            "Rejection reason is required.",
        },
        {
          status: 400,
        }
      );
    }

    const updated =
      await db.transaction(
        async (tx) => {
          /*
           * Re-read inside transaction
           */
          const current =
            await tx.orm.public.Withdrawal
              .first({ id });

          if (!current) {
            throw new Error(
              "WITHDRAWAL_NOT_FOUND"
            );
          }

          if (
            current.status !==
            "PENDING"
          ) {
            throw new Error(
              "WITHDRAWAL_ALREADY_PROCESSED"
            );
          }

          /*
           * Find user
           */
          const user =
            await tx.orm.public.User.first({
              id: current.userId,
            });

          if (!user) {
            throw new Error(
              "USER_NOT_FOUND"
            );
          }

          /*
           * The amount was previously reserved
           * from balance.
           *
           * Rejection returns it.
           */
          const balanceBefore =
            user.balancePaisa;

          const balanceAfter =
            balanceBefore +
            current.amountPaisa;

          /*
           * Return money to user
           */
          await tx.orm.public.User
            .where({
              id: user.id,
            })
            .update({
              balancePaisa:
                balanceAfter,

              totalWithdrawnPaisa:
                Math.max(
                  0,
                  user.totalWithdrawnPaisa -
                    current.amountPaisa
                ),
            });

          /*
           * Create REFUND transaction
           */
          const refundTransaction =
            await tx.orm.public.Transaction.create(
              {
                user: (transactionUser) =>
                  transactionUser.connect({
                    id: user.id,
                  }),

                type: "REFUND",

                amountPaisa:
                  current.amountPaisa,

                balanceBeforePaisa:
                  balanceBefore,

                balanceAfterPaisa:
                  balanceAfter,

                referenceId:
                  current.id,

                description:
                  `Withdrawal refund: ${reason}`,

                withdrawal: (
                  selectedWithdrawal
                ) =>
                  selectedWithdrawal.connect({
                    id: current.id,
                  }),
              }
            );

          /*
           * Update withdrawal
           */
          const updatedWithdrawal =
            await tx.orm.public.Withdrawal
              .where({ id })
              .update({
                status: "REJECTED",

                rejectionReason:
                  reason,

                reviewedBy:
                  session.userId,

                reviewedAt:
                  new Date().toISOString(),
              });

          /*
           * Withdrawal rejected notification
           */
          await tx.orm.public.Notification.create(
            {
              user: (notificationUser) =>
                notificationUser.connect({
                  id: user.id,
                }),

              title:
                "Withdrawal Rejected",

              message:
                `Your withdrawal of ${formatPKR(
                  current.amountPaisa
                )} was rejected. Reason: ${reason}. The amount has been returned to your available balance.`,

              type: "WARNING",
            }
          );

          /*
           * Refund transaction notification
           */
          await tx.orm.public.Notification.create(
            {
              user: (notificationUser) =>
                notificationUser.connect({
                  id: user.id,
                }),

              title:
                "Transaction Recorded",

              message:
                `A refund of ${formatPKR(
                  current.amountPaisa
                )} has been added back to your balance.`,

              type: "INFO",
            }
          );

          return {
            withdrawal:
              updatedWithdrawal,

            refundTransaction,
          };
        }
      );

    return NextResponse.json({
      message:
        "Withdrawal rejected and amount refunded.",

      ...updated,
    });
  } catch (error) {
    console.error(
      "Admin withdrawal PATCH error:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "WITHDRAWAL_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            message:
              "Withdrawal not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        error.message ===
        "WITHDRAWAL_ALREADY_PROCESSED"
      ) {
        return NextResponse.json(
          {
            message:
              "This withdrawal has already been processed.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        error.message ===
        "USER_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            message:
              "User account not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to process withdrawal.",
      },
      {
        status: 400,
      }
    );
  }
}
