import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

const ALLOWED_METHODS = [
  "EASYPAISA",
  "BANK",
  "RAAST",
];

export async function POST(
  request: Request
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    if (session.role !== "USER") {
      return NextResponse.json(
        {
          message:
            "Only user accounts can create withdrawals.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      amountPaisa,
      method,
      accountName,
      accountNumber,
      bankName,
      iban,
    } = body;

    if (
      !Number.isInteger(amountPaisa) ||
      amountPaisa <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Please enter a valid withdrawal amount.",
        },
        { status: 400 }
      );
    }

    if (
      typeof method !== "string" ||
      !ALLOWED_METHODS.includes(method)
    ) {
      return NextResponse.json(
        {
          message:
            "Please select a valid withdrawal method.",
        },
        { status: 400 }
      );
    }

    if (
      typeof accountName !== "string" ||
      !accountName.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Account name is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof accountNumber !== "string" ||
      !accountNumber.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Account number is required.",
        },
        { status: 400 }
      );
    }

    let setting =
      await db.orm.public.WithdrawalSetting
        .first();

    if (!setting) {
      setting =
        await db.orm.public.WithdrawalSetting.create(
          {
            minWithdrawalPaisa: 50000,
          }
        );
    }

    if (
      amountPaisa <
      setting.minWithdrawalPaisa
    ) {
      return NextResponse.json(
        {
          message: `Minimum withdrawal amount is Rs ${(setting.minWithdrawalPaisa / 100).toLocaleString(
            "en-PK"
          )}.`,
        },
        { status: 400 }
      );
    }

    const result = await db.transaction(
      async (tx) => {
        const user =
          await tx.orm.public.User.first({
            id: session.userId,
          });

        if (!user) {
          throw new Error(
            "User account not found."
          );
        }

        if (!user.isActive) {
          throw new Error(
            "Your account is currently inactive."
          );
        }

        if (
          user.balancePaisa <
          amountPaisa
        ) {
          throw new Error(
            "Insufficient available balance."
          );
        }

        const balanceBefore =
          user.balancePaisa;

        const balanceAfter =
          balanceBefore - amountPaisa;

        const withdrawal =
          await tx.orm.public.Withdrawal.create(
            {
              userId: user.id,

              amountPaisa,

              method,

              accountDetails: {
                accountName:
                  accountName.trim(),

                accountNumber:
                  accountNumber.trim(),

                ...(method === "BANK"
                  ? {
                      bankName:
                        typeof bankName ===
                        "string"
                          ? bankName.trim()
                          : "",
                      iban:
                        typeof iban ===
                        "string"
                          ? iban.trim()
                          : "",
                    }
                  : {}),
              },

              status: "PENDING",
            }
          );

        // Reserve/deduct the money immediately.
        await tx.orm.public.User
  .where({ id: user.id })
  .update({
    balancePaisa: balanceAfter,
  });

        // Record the withdrawal request.
        await tx.orm.public.Transaction.create(
          {
            userId: user.id,

            type: "WITHDRAWAL",

            amountPaisa,

            balanceBeforePaisa:
              balanceBefore,

            balanceAfterPaisa:
              balanceAfter,

            referenceId:
              withdrawal.id,

            description:
              `Withdrawal request via ${method}`,

            withdrawalId:
              withdrawal.id,
          }
        );

        return withdrawal;
      }
    );

    return NextResponse.json(
      {
        message:
          "Withdrawal request submitted successfully.",
        withdrawal: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Withdrawal POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit withdrawal request.",
      },
      { status: 400 }
    );
  }
}