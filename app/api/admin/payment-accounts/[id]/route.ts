import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

const gateways = [
  "EASYPAISA",
  "BANK",
  "RAAST",
] as const;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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
      await db.orm.public.PaymentAccount.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        {
          message:
            "Payment account not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const gateway =
      body.gateway ?? existing.gateway;

    const accountName =
      body.accountName ??
      existing.accountName;

    const accountNumber =
      body.accountNumber ??
      existing.accountNumber;

    const processingChargePaisa =
      body.processingChargePaisa ??
      existing.processingChargePaisa;

    const isActive =
      typeof body.isActive ===
      "boolean"
        ? body.isActive
        : existing.isActive;

    if (!gateways.includes(gateway)) {
      return NextResponse.json(
        {
          message:
            "Invalid payment gateway.",
        },
        { status: 400 }
      );
    }

    if (
      typeof accountName !== "string" ||
      !accountName.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Account name is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof accountNumber !==
        "string" ||
      !accountNumber.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Account number is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(
        processingChargePaisa
      ) ||
      processingChargePaisa < 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid processing charge.",
        },
        { status: 400 }
      );
    }

    const account =
      await db.transaction(async (tx) => {
        // If this account becomes active,
        // automatically deactivate every
        // other account of the same gateway.
        if (isActive) {
          await tx.orm.public.PaymentAccount
            .where({
              gateway,
            })
            .update({
              isActive: false,
            });
        }

        return tx.orm.public.PaymentAccount
          .where({ id })
          .update({
            gateway,
            accountName:
              accountName.trim(),
            accountNumber:
              accountNumber.trim(),
            processingChargePaisa,
            isActive,
          });
      });

    return NextResponse.json({
      message:
        "Payment account updated successfully.",
      account,
    });
  } catch (error) {
    console.error(
      "Payment account PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update payment account.",
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

    const account =
      await db.orm.public.PaymentAccount.first({
        id,
      });

    if (!account) {
      return NextResponse.json(
        {
          message:
            "Payment account not found.",
        },
        { status: 404 }
      );
    }

    // Soft delete/deactivation is safer
    // because deposits contain historical
    // references to this account.
    await db.orm.public.PaymentAccount
      .where({ id })
      .update({
        isActive: false,
      });

    return NextResponse.json({
      message:
        "Payment account deactivated successfully.",
    });
  } catch (error) {
    console.error(
      "Payment account DELETE error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to deactivate payment account.",
      },
      { status: 500 }
    );
  }
}