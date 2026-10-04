import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

const transactionTypes = [
  "DEPOSIT",
  "WITHDRAWAL",
  "INVESTMENT",
  "PROFIT",
  "REFERRAL_COMMISSION",
  "REFUND",
] as const;

type TransactionType =
  (typeof transactionTypes)[number];

export async function GET(
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

    const { searchParams } =
      new URL(request.url);

    const typeParam =
      searchParams.get("type");

    const userId =
      searchParams.get("userId");

    /*
     * ----------------------------------------------------------
     * Validate transaction type
     * ----------------------------------------------------------
     */

    const type =
      transactionTypes.includes(
        typeParam as TransactionType
      )
        ? (typeParam as TransactionType)
        : null;

    /*
     * ----------------------------------------------------------
     * Build query
     * ----------------------------------------------------------
     */

    let transactions;

    if (type && userId) {
      transactions =
        await db.orm.public.Transaction
          .include("user")
          .include("investment")
          .include("deposit")
          .include("withdrawal")
          .where({
            type,
            userId,
          })
          .orderBy((transaction) =>
            transaction.createdAt.desc()
          )
          .all();
    } else if (type) {
      transactions =
        await db.orm.public.Transaction
          .include("user")
          .include("investment")
          .include("deposit")
          .include("withdrawal")
          .where({
            type,
          })
          .orderBy((transaction) =>
            transaction.createdAt.desc()
          )
          .all();
    } else if (userId) {
      transactions =
        await db.orm.public.Transaction
          .include("user")
          .include("investment")
          .include("deposit")
          .include("withdrawal")
          .where({
            userId,
          })
          .orderBy((transaction) =>
            transaction.createdAt.desc()
          )
          .all();
    } else {
      transactions =
        await db.orm.public.Transaction
          .include("user")
          .include("investment")
          .include("deposit")
          .include("withdrawal")
          .orderBy((transaction) =>
            transaction.createdAt.desc()
          )
          .all();
    }

    return NextResponse.json({
      transactions,
    });
  } catch (error) {
    console.error(
      "Admin transactions GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load transactions.",
      },
      {
        status: 500,
      }
    );
  }
}