import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const user = await db.orm.public.User.first({
      id: session.userId,
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const referral =
      await db.orm.public.Referral.first({
        referredUserId: user.id,
      });

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,

        balancePaisa: user.balancePaisa,

        level: referral?.level ?? 1,

        totalInvestmentPaisa:
          user.totalInvestmentPaisa,

        totalProfitPaisa:
          user.totalProfitPaisa,

        totalReferralPaisa:
          user.totalReferralPaisa,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      {
        message: "Unable to load profile.",
      },
      { status: 500 }
    );
  }
}