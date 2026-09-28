import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

const gateways = [
  "EASYPAISA",
  "BANK",
  "RAAST",
] as const;

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const accounts =
      await db.orm.public.PaymentAccount
        .orderBy((account) =>
          account.createdAt.desc()
        )
        .all();

    return NextResponse.json({
      accounts,
    });
  } catch (error) {
    console.error(
      "Admin payment accounts GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load payment accounts.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      gateway,
      accountName,
      accountNumber,
      processingChargePaisa,
      isActive,
    } = body;

    if (
      !gateways.includes(gateway)
    ) {
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

    const shouldActivate =
      typeof isActive === "boolean"
        ? isActive
        : false;

    const account =
      await db.transaction(async (tx) => {
        if (shouldActivate) {
          await tx.orm.public.PaymentAccount
            .where({
              gateway,
            })
            .update({
              isActive: false,
            });
        }

        return tx.orm.public.PaymentAccount.create(
          {
            gateway,
            accountName:
              accountName.trim(),
            accountNumber:
              accountNumber.trim(),
            processingChargePaisa,
            isActive: shouldActivate,
          }
        );
      });

    return NextResponse.json(
      {
        message:
          "Payment account created successfully.",
        account,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin payment account POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to create payment account.",
      },
      { status: 500 }
    );
  }
}