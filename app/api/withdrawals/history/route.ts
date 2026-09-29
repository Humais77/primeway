import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "USER") {
      return NextResponse.json(
        {
          message:
            "Only user accounts can view withdrawal history.",
        },
        { status: 403 }
      );
    }

    const withdrawals =
      await db.orm.public.Withdrawal
        .include("reviewer")
        .where({
          userId: session.userId,
        })
        .orderBy((withdrawal) =>
          withdrawal.createdAt.desc()
        )
        .all();

    return NextResponse.json({
      withdrawals,
    });
  } catch (error) {
    console.error(
      "Withdrawal history GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load withdrawal history.",
      },
      { status: 500 }
    );
  }
}