import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = { params: Promise<{ id: string }> };

function validOptionalPaisa(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0);
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const user = await db.orm.public.User.first({ id });
    if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });

    const setting = await db.orm.public.UserWithdrawalSetting.first({ userId: id });
    return NextResponse.json({
      setting: setting ?? { userId: id, minWithdrawalPaisa: null, dailyLimitPaisa: null, isEnabled: false },
    });
  } catch (error) {
    console.error("User withdrawal settings GET error:", error);
    return NextResponse.json({ message: "Unable to load the user's withdrawal settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const user = await db.orm.public.User.first({ id });
    if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });

    if (!validOptionalPaisa(body.minWithdrawalPaisa)) {
      return NextResponse.json({ message: "Minimum withdrawal must be a positive amount in paisa or null to inherit the global minimum." }, { status: 400 });
    }
    if (!validOptionalPaisa(body.dailyLimitPaisa)) {
      return NextResponse.json({ message: "Daily limit must be a positive amount in paisa or null for no individual cap." }, { status: 400 });
    }
    if (typeof body.isEnabled !== "boolean") {
      return NextResponse.json({ message: "isEnabled must be true or false." }, { status: 400 });
    }

    const existing = await db.orm.public.UserWithdrawalSetting.first({ userId: id });
    const values = {
      minWithdrawalPaisa: body.minWithdrawalPaisa,
      dailyLimitPaisa: body.dailyLimitPaisa,
      isEnabled: body.isEnabled,
      updatedAt: new Date().toISOString(),
    };

    const setting = existing
      ? await db.orm.public.UserWithdrawalSetting.where({ id: existing.id }).update(values)
      : await db.orm.public.UserWithdrawalSetting.create({ userId: id, ...values });

    return NextResponse.json({ message: "User withdrawal settings saved successfully.", setting });
  } catch (error) {
    console.error("User withdrawal settings PATCH error:", error);
    return NextResponse.json({ message: "Unable to save the user's withdrawal settings." }, { status: 500 });
  }
}
