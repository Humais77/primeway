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

    return NextResponse.json({
      minWithdrawalPaisa:
        setting.minWithdrawalPaisa,
    });
  } catch (error) {
    console.error(
      "Withdrawal settings GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load withdrawal settings.",
      },
      { status: 500 }
    );
  }
}