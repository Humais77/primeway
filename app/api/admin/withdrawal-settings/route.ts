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
      setting,
    });
  } catch (error) {
    console.error(
      "Admin withdrawal settings GET error:",
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

export async function PATCH(
  request: Request
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

    const body = await request.json();

    const minWithdrawalPaisa =
      Number(
        body.minWithdrawalPaisa
      );

    if (
      !Number.isInteger(
        minWithdrawalPaisa
      ) ||
      minWithdrawalPaisa <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Minimum withdrawal must be greater than zero.",
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
            minWithdrawalPaisa,
          }
        );
    } else {
      setting =
        await db.orm.public.WithdrawalSetting
          .where({
            id: setting.id,
          })
          .update({
            minWithdrawalPaisa,
            updatedAt:
              new Date().toISOString(),
          });
    }

    return NextResponse.json({
      message:
        "Withdrawal settings updated successfully.",
      setting,
    });
  } catch (error) {
    console.error(
      "Admin withdrawal settings PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update withdrawal settings.",
      },
      { status: 500 }
    );
  }
}