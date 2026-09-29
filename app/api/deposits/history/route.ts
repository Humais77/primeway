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

    const deposits =
      await db.orm.public.Deposit
        .include("plan")
        .include("paymentAccount")
        .where({
          userId: session.userId,
        })
        .orderBy((deposit) =>
          deposit.createdAt.desc()
        )
        .all();

    return NextResponse.json({
      deposits,
    });
  } catch (error) {
    console.error(
      "Deposit history GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load deposit history.",
      },
      { status: 500 }
    );
  }
}