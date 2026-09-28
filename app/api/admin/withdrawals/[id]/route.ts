import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

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
    const session = await getSession();

    if (
      !session ||
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
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
        { status: 400 }
      );
    }

    const withdrawal =
      await db.orm.public.Withdrawal
        .first({ id });

    if (!withdrawal) {
      return NextResponse.json(
        {
          message:
            "Withdrawal not found.",
        },
        { status: 404 }
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
        { status: 400 }
      );
    }

    // APPROVE
    if (status === "APPROVED") {
      const updated =
        await db.transaction(
          async (tx) => {
            const current =
              await tx.orm.public.Withdrawal
                .first({ id });

            if (!current) {
              throw new Error(
                "Withdrawal not found."
              );
            }

            if (
              current.status !==
              "PENDING"
            ) {
              throw new Error(
                "Withdrawal has already been processed."
              );
            }

            return await tx.orm.public.Withdrawal
              .where({ id })
              .update({
                status: "APPROVED",
                reviewedBy:
                  session.userId,
                reviewedAt:
                  new Date().toISOString()
              });
          }
        );

      return NextResponse.json({
        message:
          "Withdrawal approved successfully.",
        withdrawal: updated,
      });
    }

    // REJECT
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
        { status: 400 }
      );
    }

    const updated =
      await db.transaction(
        async (tx) => {
          const current =
            await tx.orm.public.Withdrawal
              .first({ id });

          if (!current) {
            throw new Error(
              "Withdrawal not found."
            );
          }

          if (
            current.status !==
            "PENDING"
          ) {
            throw new Error(
              "Withdrawal has already been processed."
            );
          }

          const user =
            await tx.orm.public.User.first({
              id: current.userId,
            });

          if (!user) {
            throw new Error(
              "User account not found."
            );
          }

          const balanceBefore =
            user.balancePaisa;

          const balanceAfter =
            balanceBefore +
            current.amountPaisa;

          // Return reserved money
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

          // Create refund transaction
          await tx.orm.public.Transaction.create(
            {
              userId: user.id,

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

              withdrawalId:
                current.id,
            }
          );

          return await tx.orm.public.Withdrawal
            .where({ id })
            .update({
              status: "REJECTED",
              rejectionReason:
                reason,
              reviewedBy:
                session.userId,
              reviewedAt:
                new Date().toISOString()
            });
        }
      );

    return NextResponse.json({
      message:
        "Withdrawal rejected and amount refunded.",
      withdrawal: updated,
    });
  } catch (error) {
    console.error(
      "Admin withdrawal PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to process withdrawal.",
      },
      { status: 400 }
    );
  }
}