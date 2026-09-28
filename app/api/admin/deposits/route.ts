import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const deposits =
      await db.orm.public.Deposit
        .include("user")
        .include("plan")
        .include("paymentAccount")
        .orderBy((deposit) =>
          deposit.createdAt.desc()
        )
        .all();

    return NextResponse.json({
      deposits,
    });
  } catch (error) {
    console.error(
      "Admin deposits GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load deposits.",
      },
      { status: 500 }
    );
  }
}