import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const transactions =
      await db.orm.public.Transaction
        .where({
          userId: session.userId,
        })
        .orderBy((transaction) =>
          transaction.createdAt.desc()
        )
        .all();

    return NextResponse.json({
      transactions: transactions.map(
        (transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amountPaisa:
            transaction.amountPaisa,
          balanceBeforePaisa:
            transaction.balanceBeforePaisa,
          balanceAfterPaisa:
            transaction.balanceAfterPaisa,
          referenceId:
            transaction.referenceId,
          description:
            transaction.description,
          createdAt:
            transaction.createdAt,
          investmentId:
            transaction.investmentId,
          depositId:
            transaction.depositId,
          withdrawalId:
            transaction.withdrawalId,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Transactions GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load transaction history.",
      },
      { status: 500 }
    );
  }
}