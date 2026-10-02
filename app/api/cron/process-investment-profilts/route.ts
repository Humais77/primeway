import { processInvestmentProfits } from "@/src/lib/investment-profilt";
import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

export async function GET(
  request: Request
) {
  try {
    const authHeader =
      request.headers.get(
        "authorization"
      );

    const expectedToken =
      process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error(
        "CRON_SECRET is not configured."
      );

      return NextResponse.json(
        {
          message:
            "Cron secret is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      authHeader !==
      `Bearer ${expectedToken}`
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await processInvestmentProfits();

    return NextResponse.json({
      success: true,

      message:
        "Investment profits processed successfully.",

      ...result,
    });
  } catch (error) {
    console.error(
      "Investment profit cron error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to process investment profits.",
      },
      {
        status: 500,
      }
    );
  }
}