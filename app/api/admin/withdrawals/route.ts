import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function GET() {
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

    const withdrawals =
      await db.orm.public.Withdrawal
        .include("user")
        .include("reviewer")
        .orderBy((withdrawal) =>
          withdrawal.createdAt.desc()
        )
        .all();

    return NextResponse.json({
      withdrawals,
    });
  } catch (error) {
    console.error(
      "Admin withdrawals GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load withdrawals.",
      },
      { status: 500 }
    );
  }
}