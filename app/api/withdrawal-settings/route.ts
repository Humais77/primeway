import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "USER") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    let globalSetting = await db.orm.public.WithdrawalSetting.first();
    if (!globalSetting) {
      globalSetting = await db.orm.public.WithdrawalSetting.create({ minWithdrawalPaisa: 50000 });
    }
    const userSetting = await db.orm.public.UserWithdrawalSetting.first({ userId: session.userId });
    const investments = await db.orm.public.Investment.where({ userId: session.userId }).all();
    const planIds = [...new Set(investments.map((item) => item.planId))];
    const planMinimums: { id: string; name: string; minWithdrawalPaisa: number | null }[] = [];

    for (const id of planIds) {
      const plan = await db.orm.public.InvestmentPlan.first({ id });
      if (plan && plan.isActive) planMinimums.push({ id: plan.id, name: plan.name, minWithdrawalPaisa: plan.minWithdrawalPaisa ?? null });
    }

    return NextResponse.json({
      setting: {
        minWithdrawalPaisa: globalSetting.minWithdrawalPaisa,
        defaultDailyLimitPaisa: globalSetting.defaultDailyLimitPaisa,
        defaultLifetimeLimitPaisa: globalSetting.defaultLifetimeLimitPaisa,
        userMinWithdrawalPaisa: userSetting?.minWithdrawalPaisa ?? null,
        planMinimums,
      },
    });
  } catch (error) {
    console.error("Withdrawal settings GET error:", error);
    return NextResponse.json({ message: "Unable to load withdrawal settings." }, { status: 500 });
  }
}
