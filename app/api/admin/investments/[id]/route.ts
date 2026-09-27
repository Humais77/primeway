import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const statuses = [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
] as const;

const frequencies = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
] as const;

export async function GET(
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

    const investment =
      await db.orm.public.Investment
        .include("user")
        .include("plan")
        .first({ id });

    if (!investment) {
      return NextResponse.json(
        {
          message:
            "Investment not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      investment,
    });
  } catch (error) {
    console.error(
      "Investment GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load investment.",
      },
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

    const existing =
      await db.orm.public.Investment.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        {
          message:
            "Investment not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const update: Record<
      string,
      unknown
    > = {};

    if (
      typeof body.amountPaisa ===
        "number" &&
      Number.isInteger(
        body.amountPaisa
      ) &&
      body.amountPaisa > 0
    ) {
      update.amountPaisa =
        body.amountPaisa;
    }

    if (
      Number.isInteger(
        body.profitRateBps
      ) &&
      body.profitRateBps >= 0
    ) {
      update.profitRateBps =
        body.profitRateBps;
    }

    if (
      frequencies.includes(
        body.frequency
      )
    ) {
      update.frequency =
        body.frequency;
    }

    if (
      statuses.includes(body.status)
    ) {
      update.status =
        body.status;
    }

    if (
      typeof body.startDate ===
      "string"
    ) {
      update.startDate =
        body.startDate;
    }

    if (
      typeof body.endDate ===
      "string"
    ) {
      update.endDate =
        body.endDate;
    }

    if (
      typeof body.nextProfitAt ===
      "string"
    ) {
      update.nextProfitAt =
        body.nextProfitAt;
    }

    if (
      Number.isInteger(
        body.earnedProfitPaisa
      ) &&
      body.earnedProfitPaisa >= 0
    ) {
      update.earnedProfitPaisa =
        body.earnedProfitPaisa;
    }

    const investment =
      await db.orm.public.Investment
        .where({ id })
        .update(update);

    return NextResponse.json({
      message:
        "Investment updated successfully.",
      investment,
    });
  } catch (error) {
    console.error(
      "Investment PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update investment.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const investment =
      await db.orm.public.Investment.first({
        id,
      });

    if (!investment) {
      return NextResponse.json(
        {
          message:
            "Investment not found.",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Investment
      .where({ id })
      .delete();

    return NextResponse.json({
      message:
        "Investment deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Investment DELETE error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to delete investment.",
      },
      { status: 500 }
    );
  }
}