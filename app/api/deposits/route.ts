import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import { isGateway } from "@/src/lib/gateways";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      planId,
      gateway: gatewayRaw,
      transactionReference,
      proofUrl,
    } = body;

    if (typeof planId !== "string" || !planId) {
      return NextResponse.json(
        { message: "Investment plan is required." },
        { status: 400 }
      );
    }

    if (!isGateway(gatewayRaw)) {
      return NextResponse.json(
        { message: "Valid payment method is required." },
        { status: 400 }
      );
    }

    const gateway = gatewayRaw;

    if (
      typeof transactionReference !== "string" ||
      !transactionReference.trim()
    ) {
      return NextResponse.json(
        { message: "Transaction ID is required." },
        { status: 400 }
      );
    }

    if (typeof proofUrl !== "string" || !proofUrl) {
      return NextResponse.json(
        { message: "Payment screenshot is required." },
        { status: 400 }
      );
    }

    const plan =
      await db.orm.public.InvestmentPlan.first({
        id: planId,
        isActive: true,
      });

    if (!plan) {
      return NextResponse.json(
        {
          message:
            "Investment plan is no longer available.",
        },
        { status: 404 }
      );
    }

    /*
     * Prevent duplicate ACTIVE investment
     */
    const activeInvestment =
      await db.orm.public.Investment.first({
        userId: session.userId,
        planId: plan.id,
        status: "ACTIVE",
      });

    if (activeInvestment) {
      return NextResponse.json(
        {
          message:
            "You already have an active investment in this plan.",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent duplicate PENDING deposit
     *
     * This is important because the Investment does not
     * exist until the admin approves the deposit.
     */
    const pendingDeposit =
      await db.orm.public.Deposit.first({
        userId: session.userId,
        planId: plan.id,
        status: "PENDING",
      });

    if (pendingDeposit) {
      return NextResponse.json(
        {
          message:
            "You already have a pending deposit for this plan. Please wait for admin approval.",
        },
        { status: 400 }
      );
    }

    const account =
      await db.orm.public.PaymentAccount.first({
        gateway,
        isActive: true,
      });

    if (!account) {
      return NextResponse.json(
        {
          message:
            "This payment method is currently unavailable.",
        },
        { status: 400 }
      );
    }

    /*
     * Currently the investment amount is the plan minimum.
     */
    const amountPaisa = plan.minAmountPaisa;

    const processingChargePaisa =
      account.processingChargePaisa;

    const exactAmountPaisa =
      amountPaisa + processingChargePaisa;

    const deposit =
      await db.orm.public.Deposit.create({
        user: (user) =>
          user.connect({
            id: session.userId,
          }),

        plan: (selectedPlan) =>
          selectedPlan.connect({
            id: plan.id,
          }),

        paymentAccount: (selectedAccount) =>
          selectedAccount.connect({
            id: account.id,
          }),

        amountPaisa,
        processingChargePaisa,
        exactAmountPaisa,

        method: gateway,

        transactionReference:
          transactionReference.trim(),

        proofUrl,

        paymentAccountName:
          account.accountName,

        paymentAccountNumber:
          account.accountNumber,

        status: "PENDING",
      });

    return NextResponse.json(
      {
        message:
          "Deposit submitted successfully. Please wait for admin approval.",
        deposit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Deposit POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to submit deposit.",
      },
      { status: 500 }
    );
  }
}