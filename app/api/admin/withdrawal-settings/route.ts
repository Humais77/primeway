
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

function validLimit(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value > 0)
  );
}

async function getOrCreateSetting() {
  let setting = await db.orm.public.WithdrawalSetting.first();

  if (!setting) {
    setting = await db.orm.public.WithdrawalSetting.create({
      minWithdrawalPaisa: 50000,
      defaultDailyLimitPaisa: null,
      defaultLifetimeLimitPaisa: null,
    });
  }

  return setting;
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const setting = await getOrCreateSetting();

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Admin withdrawal settings GET error:", error);

    return NextResponse.json(
      { message: "Unable to load withdrawal settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const minWithdrawalPaisa = body.minWithdrawalPaisa;
    const defaultDailyLimitPaisa = body.defaultDailyLimitPaisa;
    const defaultLifetimeLimitPaisa = body.defaultLifetimeLimitPaisa;

    if (
      !Number.isSafeInteger(minWithdrawalPaisa) ||
      minWithdrawalPaisa <= 0
    ) {
      return NextResponse.json(
        { message: "Minimum withdrawal must be greater than zero." },
        { status: 400 }
      );
    }

    if (!validLimit(defaultDailyLimitPaisa)) {
      return NextResponse.json(
        {
          message:
            "Daily limit must be a positive amount in paisa or null for no limit.",
        },
        { status: 400 }
      );
    }

    if (!validLimit(defaultLifetimeLimitPaisa)) {
      return NextResponse.json(
        {
          message:
            "Lifetime limit must be a positive amount in paisa or null for no limit.",
        },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.WithdrawalSetting.first();

    const values = {
      minWithdrawalPaisa,
      defaultDailyLimitPaisa,
      defaultLifetimeLimitPaisa,
      updatedAt: new Date().toISOString(),
    };

    const setting = existing
      ? await db.orm.public.WithdrawalSetting
          .where({ id: existing.id })
          .update(values)
      : await db.orm.public.WithdrawalSetting.create(values);

    return NextResponse.json({
      message: "Withdrawal settings saved successfully.",
      setting,
    });
  } catch (error) {
    console.error("Admin withdrawal settings PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to save withdrawal settings." },
      { status: 500 }
    );
  }
}