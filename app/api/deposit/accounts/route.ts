import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import { isGateway } from "@/src/lib/gateways";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gatewayParam = searchParams.get("gateway");

    if (!isGateway(gatewayParam)) {
      return NextResponse.json(
        { message: "Invalid payment gateway." },
        { status: 400 }
      );
    }

    // ✅ gatewayParam is now typed as "EASYPAISA" | "BANK" | "RAAST"
    const gateway = gatewayParam;

    const account = await db.orm.public.PaymentAccount.first({
      gateway,
      isActive: true,
    });

    if (!account) {
      return NextResponse.json(
        {
          message:
            "No active payment account is currently available.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      account: {
        id: account.id,
        gateway: account.gateway,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        processingChargePaisa: account.processingChargePaisa,
      },
    });
  } catch (error) {
    console.error("Payment account GET error:", error);
    return NextResponse.json(
      { message: "Unable to load payment account." },
      { status: 500 }
    );
  }
}