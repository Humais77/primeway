import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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

    const body = await request.json();

    const action = body.action;

    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid deposit action.",
        },
        { status: 400 }
      );
    }

    const deposit =
      await db.orm.public.Deposit.first({
        id,
      });

    if (!deposit) {
      return NextResponse.json(
        {
          message:
            "Deposit not found.",
        },
        { status: 404 }
      );
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "This deposit has already been reviewed.",
        },
        { status: 400 }
      );
    }

    if (action === "REJECT") {
      const updated =
        await db.orm.public.Deposit
          .where({ id })
          .update({
            status: "REJECTED",
            rejectionReason:
              typeof body.reason ===
              "string"
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
     * APPROVAL
     *
     * Everything happens in one transaction:
     *
     * 1. Deposit becomes APPROVED
     * 2. User balance increases
     * 3. User total investment/deposit
     *    balance is updated
     * 4. Transaction record is created
     *
     * This prevents the balance from being
     * updated without the deposit being approved.
     */

    const result =
      await db.transaction(async (tx) => {
        const user =
          await tx.orm.public.User.first({
            id: deposit.userId,
          });

        if (!user) {
          throw new Error(
            "USER_NOT_FOUND"
          );
        }

        const balanceBefore =
          user.balancePaisa;

        const balanceAfter =
          balanceBefore +
          deposit.amountPaisa;

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

        await tx.orm.public.User
          .where({
            id: user.id,
          })
          .update({
            balancePaisa:
              balanceAfter,
          });

        const transaction =
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
                `Deposit approved - ${deposit.method}`,

              deposit: (
                selectedDeposit
              ) =>
                selectedDeposit.connect({
                  id: deposit.id,
                }),
            }
          );

        return {
          deposit: updatedDeposit,
          transaction,
          balanceAfter,
        };
      });

    return NextResponse.json({
      message:
        "Deposit approved and user balance updated.",
      ...result,
    });
  } catch (error) {
    console.error(
      "Admin deposit PATCH error:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          message:
            "Deposit user no longer exists.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Unable to review deposit.",
      },
      { status: 500 }
    );
  }
}