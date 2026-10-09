
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = {
  params: Promise<{ id: string }>;
};

function validLimit(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value > 0)
  );
}

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await db.orm.public.User.first({ id });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const setting =
      await db.orm.public.UserWithdrawalSetting.first({
        userId: id,
      });

    return NextResponse.json({
      setting: setting ?? {
        userId: id,
        dailyLimitPaisa: null,
        isEnabled: false,
      },
    });
  } catch (error) {
    console.error("User withdrawal limit GET error:", error);

    return NextResponse.json(
      { message: "Unable to load the user's withdrawal limit." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const user = await db.orm.public.User.first({ id });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (!validLimit(body.dailyLimitPaisa)) {
      return NextResponse.json(
        {
          message:
            "Daily limit must be a positive amount in paisa or null for no individual cap.",
        },
        { status: 400 }
      );
    }

    if (typeof body.isEnabled !== "boolean") {
      return NextResponse.json(
        { message: "isEnabled must be true or false." },
        { status: 400 }
      );
    }

    let setting =
      await db.orm.public.UserWithdrawalSetting.first({
        userId: id,
      });

    const values = {
      dailyLimitPaisa: body.dailyLimitPaisa,
      isEnabled: body.isEnabled,
      updatedAt: new Date().toISOString(),
    };

    if (setting) {
      setting = await db.orm.public.UserWithdrawalSetting
        .where({ id: setting.id })
        .update(values);
    } else {
      setting = await db.orm.public.UserWithdrawalSetting.create({
        userId: id,
        ...values,
      });
    }

    return NextResponse.json({
      message: "User withdrawal limit saved successfully.",
      setting,
    });
  } catch (error) {
    console.error("User withdrawal limit PATCH error:", error);

    return NextResponse.json(
      { message: "Unable to save the user's withdrawal limit." },
      { status: 500 }
    );
  }
}